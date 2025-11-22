from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict
import string
import random
import json
import os
from dotenv import load_dotenv

from .database import db
from .models import Room, Participant, Poll, CreateRoomRequest, JoinRequest, ChatMessage, CreatePollRequest, VotePollRequest
from .santa import assign_secret_santa

# Load environment variables
load_dotenv()

app = FastAPI(title="Secret Santa API", version="1.0.0")

# CORS - Configure origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins != "*":
    cors_origins = [origin.strip() for origin in cors_origins.split(",")]
else:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WebSockets for Chat ---
class ConnectionManager:
    def __init__(self):
        # Map room_code -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Map WebSocket -> {user_name, participant_id, room_code}
        self.connection_data: Dict[WebSocket, Dict[str, str]] = {}

    async def connect(self, websocket: WebSocket, room_code: str, user_name: str, participant_id: str):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)
        
        # Store participant data for this connection
        self.connection_data[websocket] = {
            "user_name": user_name,
            "participant_id": participant_id,
            "room_code": room_code
        }

    async def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.active_connections:
            self.active_connections[room_code].remove(websocket)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]
        
        # Clean up connection data
        if websocket in self.connection_data:
            del self.connection_data[websocket]

    async def broadcast(self, message: str, room_code: str):
        if room_code in self.active_connections:
            for connection in self.active_connections[room_code]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

# --- Helpers ---
def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# --- Routes ---
@app.get("/api")
async def root():
    """API status endpoint."""
    return {"message": "Secret Santa API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms."""
    try:
        # Check database connection
        await db.db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
@app.post("/api/rooms", response_model=Room)
async def create_room(request: CreateRoomRequest):
    print(f"DEBUG: Creating room '{request.room_name}' with exchange_date='{request.exchange_date}'")
    room_code = generate_room_code()
    host = Participant(
        name=request.host_name, 
        preferences=request.host_preferences, 
        secret_message=request.host_secret_message,
        is_host=True
    )
    
    room = Room(
        code=room_code, 
        name=request.room_name, 
        participants=[host],
        exchange_date=None  # Date is set later
    )
    
    await db.db.rooms.insert_one(room.dict())
    return room

class SetDateRequest(BaseModel):
    exchange_date: str

@app.post("/api/rooms/{room_code}/date")
async def set_exchange_date(room_code: str, body: SetDateRequest):
    """Set the exchange date for the room (Host only)."""
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    await db.db.rooms.update_one(
        {"code": room_code},
        {"$set": {"exchange_date": body.exchange_date}}
    )
    
    # Broadcast date update
    msg = json.dumps({
        "type": "date_updated",
        "exchange_date": body.exchange_date
    })
    await manager.broadcast(msg, room_code)
    
    return {"message": "Date updated"}

@app.get("/api/rooms/{room_code}", response_model=Room)
async def get_room(room_code: str):
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    return Room(**room_data)

@app.post("/api/rooms/join", response_model=Participant)
async def join_room(request: JoinRequest):
    print(f"DEBUG: Joining room {request.room_code} with secret_message='{request.secret_message}'")
    room_data = await db.db.rooms.find_one({"code": request.room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = Room(**room_data)
    if room.is_started:
        raise HTTPException(status_code=400, detail="Game already started")
        
    # Check if participant with same name already exists
    existing_participant = next((p for p in room.participants if p.name == request.name), None)
    if existing_participant:
        # If exists, return the existing one (idempotent)
        # We might want to update preferences/secret if they changed, but for now just return existing
        return existing_participant

    new_participant = Participant(
        name=request.name, 
        preferences=request.preferences,
        secret_message=request.secret_message
    )
    
    # Update DB
    await db.db.rooms.update_one(
        {"code": request.room_code},
        {"$push": {"participants": new_participant.dict()}}
    )
    
    return new_participant

@app.post("/api/rooms/{room_code}/start")
async def start_game(room_code: str):
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = Room(**room_data)
    if len(room.participants) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 participants")
    
    # Broadcast countdown start to all participants
    countdown_msg = json.dumps({"type": "countdown_start"})
    await manager.broadcast(countdown_msg, room_code)
        
    # Shuffle
    updated_participants = assign_secret_santa(room.participants)
    
    # Create pairings list to save to database
    from .models import Pairing
    pairings = []
    for giver in updated_participants:
        if giver.giftee_id:
            # Find the receiver
            receiver = next((p for p in updated_participants if p.id == giver.giftee_id), None)
            if receiver:
                pairing = Pairing(
                    room_code=room_code,
                    giver_name=giver.name,
                    giver_id=giver.id,
                    receiver_name=receiver.name,
                    receiver_id=receiver.id,
                    receiver_preferences=receiver.preferences,
                    receiver_secret_message=receiver.secret_message
                )
                pairings.append(pairing.dict())
    
    # Save pairings to database
    if pairings:
        await db.db.pairings.insert_many(pairings)
    
    # Save
    await db.db.rooms.update_one(
        {"code": room_code},
        {"$set": {"participants": [p.dict() for p in updated_participants], "is_started": True}}
    )
    
    return {"message": "Game started", "participants": updated_participants}

@app.delete("/api/rooms/{room_code}")
async def delete_room(room_code: str):
    result = await db.db.rooms.delete_one({"code": room_code})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}

@app.delete("/api/rooms/{room_code}/participants/{participant_id}")
async def remove_participant(room_code: str, participant_id: str, reason: str = "kicked"):
    """Remove a participant from the room."""
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = Room(**room_data)
    
    # Check if game has started
    if room.is_started:
        raise HTTPException(status_code=400, detail="Cannot remove participants after game has started")
    
    # Find the participant to get their name
    participant_to_remove = None
    for p in room.participants:
        if p.id == participant_id:
            participant_to_remove = p
            break
    
    if not participant_to_remove:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Remove from database
    await db.db.rooms.update_one(
        {"code": room_code},
        {"$pull": {"participants": {"id": participant_id}}}
    )
    
    # Determine message based on reason
    if reason == "left":
        message = f"{participant_to_remove.name} left the room."
    else:
        message = f"{participant_to_remove.name} was removed from the room by the host."

    # Broadcast removal notification via WebSocket
    removal_msg = json.dumps({
        "sender": "System",
        "message": message,
        "type": "participant_removed",
        "removed_id": participant_id,
        "reason": reason
    })
    await manager.broadcast(removal_msg, room_code)
    
    return {"message": "Participant removed"}

# --- Poll Endpoints ---
class CreatePollBody(BaseModel):
    question: str
    options: List[str]
    creator_name: str

class VotePollBody(BaseModel):
    option: str
    voter_id: str

@app.post("/api/rooms/{room_code}/polls")
async def create_poll(room_code: str, body: CreatePollBody):
    """Create a new poll in the room."""
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    poll = Poll(
        question=body.question,
        options=body.options,
        created_by=body.creator_name
    )
    
    # Add poll to room
    await db.db.rooms.update_one(
        {"code": room_code},
        {"$push": {"polls": poll.dict()}}
    )
    
    # Broadcast poll creation
    poll_msg = json.dumps({
        "type": "poll_created",
        "poll": poll.dict()
    })
    await manager.broadcast(poll_msg, room_code)
    
    return poll

@app.post("/api/rooms/{room_code}/polls/{poll_id}/vote")
async def vote_poll(room_code: str, poll_id: str, body: VotePollBody):
    """Vote on a poll."""
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = Room(**room_data)
    
    # Find the poll
    poll_index = None
    for i, poll in enumerate(room.polls):
        if poll.id == poll_id:
            poll_index = i
            break
    
    if poll_index is None:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Update vote
    room.polls[poll_index].votes[body.voter_id] = body.option
    
    # Save to database
    await db.db.rooms.update_one(
        {"code": room_code},
        {"$set": {"polls": [p.dict() for p in room.polls]}}
    )
    
    # Broadcast vote update
    vote_msg = json.dumps({
        "type": "poll_voted",
        "poll_id": poll_id,
        "poll": room.polls[poll_index].dict()
    })
    await manager.broadcast(vote_msg, room_code)
    
    return {"message": "Vote recorded"}

@app.get("/api/debug/rooms/{room_code}")
async def get_room_debug(room_code: str):
    """Returns raw MongoDB document for debugging."""
    room_data = await db.db.rooms.find_one({"code": room_code})
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    # Convert ObjectId to str for JSON serialization
    if "_id" in room_data:
        room_data["_id"] = str(room_data["_id"])
    return room_data

@app.websocket("/ws/{room_code}/{user_name}/{participant_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, user_name: str, participant_id: str):
    await manager.connect(websocket, room_code, user_name, participant_id)
    try:
        # Announce join
        join_msg = json.dumps({"sender": "System", "message": f"{user_name} joined the chat.", "type": "system"})
        await manager.broadcast(join_msg, room_code)
        
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                msg_text = payload.get("message", "")
            except:
                msg_text = data
                
            msg = json.dumps({"sender": user_name, "message": msg_text, "type": "chat"})
            await manager.broadcast(msg, room_code)
            
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_code)
        
        # Auto-remove participant if they're not the host and game hasn't started
        try:
            room_data = await db.db.rooms.find_one({"code": room_code})
            if room_data:
                room = Room(**room_data)
                
                # Find the participant
                participant_to_remove = None
                for p in room.participants:
                    if p.id == participant_id:
                        participant_to_remove = p
                        break
                
                # Only auto-remove if: participant exists, not host, and game hasn't started
                if participant_to_remove and not participant_to_remove.is_host and not room.is_started:
                    # Remove from database
                    await db.db.rooms.update_one(
                        {"code": room_code},
                        {"$pull": {"participants": {"id": participant_id}}}
                    )
                    
                    # Broadcast removal notification
                    removal_msg = json.dumps({
                        "sender": "System",
                        "message": f"{user_name} left the room.",
                        "type": "participant_removed",
                        "removed_id": participant_id,
                        "reason": "left"
                    })
                    await manager.broadcast(removal_msg, room_code)
        except Exception as e:
            print(f"Error auto-removing participant: {e}")
# Mount static files
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Note: Run 'python start_backend.py' from the project root instead
    # This ensures proper module resolution for relative imports
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

