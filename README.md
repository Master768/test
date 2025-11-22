# Secret Santa Application 🎅

This is a local Secret Santa application with a FastAPI backend and a vanilla JavaScript frontend.

## Prerequisites

- Python 3.8+
- pip

## Installation

1.  **Install Backend Dependencies:**
    Open a terminal in the project root directory and run:
    ```bash
    pip install -r backend/requirements.txt
    ```

## Running the Application

The frontend is served automatically by the backend. You only need to run one command.

1.  **Start the Server:**
    Run the following command in the project root:
    ```bash
    uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
    ```

2.  **Access the Website:**
    Open your browser and go to:
    [http://localhost:8080](http://localhost:8080)

## Troubleshooting

-   **Port in use:** If port 8080 is busy, you can change the `--port` flag in the command above.
-   **Database:** The application uses a local MongoDB instance. Ensure you have MongoDB installed and running, or update the `MONGO_URL` in `.env` (or `backend/database.py`) to point to your MongoDB Atlas cluster.
