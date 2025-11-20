# Hosting Guide 🚀

Since your application uses **WebSockets** (for chat and game state), you cannot host the entire application on Vercel alone (Vercel Serverless functions do not support persistent WebSocket connections).

**The Recommended Setup:**
1.  **Backend:** Host on **Render** (supports WebSockets).
2.  **Frontend:** Host on **Vercel** (fast static hosting).

---

## Step 1: Host Backend on Render

1.  Push your code to GitHub.
2.  Go to [dashboard.render.com](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repo.
5.  **Settings:**
    *   **Runtime:** Python 3
    *   **Build Command:** `pip install -r backend/requirements.txt`
    *   **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6.  Click **Create Web Service**.
7.  **Copy your Render URL** (e.g., `https://your-app.onrender.com`).

---

## Step 2: Configure Frontend for Production

1.  Open `frontend/script.js`.
2.  Find the `API_BASE` configuration (around line 206).
3.  Ensure the production URL matches your Render URL from Step 1.

```javascript
const API_BASE = isLocal
    ? 'http://localhost:8080'
    : 'https://your-app-name.onrender.com'; // <--- PASTE RENDER URL HERE
```

---

## Step 3: Host Frontend on Vercel

You can deploy the frontend using the Vercel CLI.

### 1. Install Vercel CLI
Open your terminal and run:
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
Run the deploy command in your project root:
```bash
vercel
```

### 4. Configure Deployment (Interactive)
The CLI will ask you questions. Answer them as follows:

*   **Set up and deploy?** `y`
*   **Which scope?** (Select your account)
*   **Link to existing project?** `n`
*   **Project Name:** `secret-santa-frontend` (or your choice)
*   **In which directory is your code located?** `frontend`  <-- **IMPORTANT: Type "frontend" here**
*   **Want to modify these settings?** `n`

### 5. Done!
Vercel will give you a Production URL (e.g., `https://secret-santa-frontend.vercel.app`).

---

## Summary
-   **Backend runs on Render** (handles data & chat).
-   **Frontend runs on Vercel** (serves the UI).
-   Users visit the **Vercel URL** to play.
