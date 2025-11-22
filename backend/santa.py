import random
from typing import List
from .models import Participant

def assign_secret_santa(participants: List[Participant]) -> List[Participant]:
    """
    Shuffles participants and assigns a giftee to each one.
    Ensures no one is assigned to themselves.
    """
    if len(participants) < 2:
        return participants

    givers = participants.copy()
    receivers = participants.copy()
    
    # Simple shuffle approach:
    # Shift the receivers list by 1 (or more) to ensure no one gets themselves
    # But a pure random shuffle is better for "randomness", we just need to check constraints.
    
    # Derangement algorithm (Sattolo's algorithm or simple retry)
    # Since N is likely small, a retry loop is sufficient and robust.
    
    max_retries = 100
    for _ in range(max_retries):
        random.shuffle(receivers)
        valid = True
        for g, r in zip(givers, receivers):
            if g.id == r.id:
                valid = False
                break
        
        if valid:
            # Apply assignments
            for g, r in zip(givers, receivers):
                g.giftee_id = r.id
            return givers
            
    # Fallback (should rarely happen for N > 1)
    return participants
