import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_secret_message_flow():
    print("1. Creating Room with Secret Message...")
    host_payload = {
        "host_name": "HostUser",
        "host_preferences": "Host Prefs",
        "host_secret_message": "Host Secret 123"
    }
    try:
        resp = requests.post(f"{BASE_URL}/rooms", json=host_payload)
        resp.raise_for_status()
        room = resp.json()
        room_code = room['code']
        print(f"   Room Created: {room_code}")
        
        # Verify Host Data via DEBUG endpoint
        print("   Checking RAW DB data...")
        debug_resp = requests.get(f"{BASE_URL}/debug/rooms/{room_code}")
        if debug_resp.status_code == 404:
             print("   WARNING: Debug endpoint not found. Server might be old.")
        else:
            debug_resp.raise_for_status()
            raw_room = debug_resp.json()
            host = raw_room['participants'][0]
            print(f"   RAW DB DATA (Host): {host}")
            
            if host.get('secret_message') == "Host Secret 123":
                print("   SUCCESS: Host secret message saved correctly in DB.")
            else:
                print(f"   FAILURE: Host secret message NOT in DB. Got: {host.get('secret_message')}")
                return

    except Exception as e:
        print(f"   ERROR: {e}")
        return

    print("\n2. Joining Room with Secret Message...")
    join_payload = {
        "room_code": room_code,
        "name": "JoinUser",
        "preferences": "Join Prefs",
        "secret_message": "Join Secret 456"
    }
    try:
        resp = requests.post(f"{BASE_URL}/rooms/join", json=join_payload)
        resp.raise_for_status()
        participant = resp.json()
        print("   User Joined.")

        # Verify Joiner Data via DEBUG endpoint
        debug_resp = requests.get(f"{BASE_URL}/debug/rooms/{room_code}")
        raw_room = debug_resp.json()
        joiner = raw_room['participants'][1]
        
        if joiner.get('secret_message') == "Join Secret 456":
             print("   SUCCESS: Joiner secret message saved correctly in DB.")
        else:
             print(f"   FAILURE: Joiner secret message NOT in DB. Got: {joiner.get('secret_message')}")
             return

    except Exception as e:
        print(f"   ERROR: {e}")
        return

if __name__ == "__main__":
    test_secret_message_flow()
