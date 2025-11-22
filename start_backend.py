#!/usr/bin/env python
"""
Startup script for the Secret Santa backend server.
Run this from the project root directory.
"""
import os
import sys

# Ensure we're in the project root
project_root = os.path.dirname(os.path.abspath(__file__))
os.chdir(project_root)

# Add project root to Python path if not already there
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Run uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
