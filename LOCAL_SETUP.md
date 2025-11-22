# 🎅 Local Development Setup Guide

This guide will help you run the Secret Santa application on your local machine.

## Quick Start

### 1. Install Dependencies (One-time setup)

Open a terminal in the project root directory and run:

```bash
pip install -r backend/requirements.txt
```

### 2. Start the Backend Server

Run this command from the project root:

```bash
python start_backend.py
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3. Access the Application

The backend serves the frontend automatically. Open your browser and navigate to:

**http://localhost:8000**

## Troubleshooting

### Import Error: "No module named 'test.backend'"

**Solution:** Always run the backend using `python start_backend.py` from the project root directory, NOT `python backend/main.py`.

### Port Already in Use

If port 8000 is already in use, you'll see an error. You can:
1. Stop the other application using port 8000, OR
2. Edit `start_backend.py` and change `port=8000` to another port (e.g., `port=8080`)

### Dependencies Not Installed

If you see errors about missing modules, run:

```bash
pip install -r backend/requirements.txt
```

### MongoDB Connection Failed

The application connects to a MongoDB Atlas instance by default. If you see connection errors:
1. Check your internet connection
2. The default credentials are embedded in `backend/database.py`
3. You can override by creating a `.env` file with:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=secret_santa_db
```

## Development Workflow

1. **Make code changes** to backend (`backend/`) or frontend (`frontend/`)
2. **Backend changes:** The server will automatically reload (hot reload is enabled)
3. **Frontend changes:** Just refresh your browser
4. **Stop the server:** Press `Ctrl+C` in the terminal

## Project Structure

```
test/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application
│   ├── database.py   # MongoDB connection
│   ├── models.py     # Data models
│   └── santa.py      # Gift assignment logic
├── frontend/         # HTML/CSS/JS frontend
│   ├── index.html    # Main HTML
│   ├── style.css     # Styles
│   └── script.js     # Application logic
└── start_backend.py  # Server startup script
```

## Notes

- The backend serves static files from the `frontend` directory
- WebSocket connections are used for real-time chat
- Session data is stored in localStorage for hosts
- MongoDB stores all room and participant data
