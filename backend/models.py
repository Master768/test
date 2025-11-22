from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

class Participant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    preferences: str = ""
    secret_message: str = ""
    giftee_id: Optional[str] = None
    is_host: bool = False

class Poll(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    votes: Dict[str, str] = {}  # participant_id -> option
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Room(BaseModel):
    code: str
    name: str = ""
    participants: List[Participant] = []
    is_started: bool = False
    exchange_date: Optional[str] = None
    polls: List[Poll] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JoinRequest(BaseModel):
    room_code: str
    name: str
    preferences: str = ""
    secret_message: str = ""

class CreateRoomRequest(BaseModel):
    host_name: str
    room_name: str = ""
    host_preferences: str = ""
    host_secret_message: str = ""
    exchange_date: Optional[str] = None

class CreatePollRequest(BaseModel):
    question: str
    options: List[str]

class VotePollRequest(BaseModel):
    option: str

class ChatMessage(BaseModel):
    sender: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
