# Hosting Guide - Deploy to Render 🚀

This guide shows you how to deploy both the **frontend** and **backend** of your Secret Santa application on **Render** as a single web service.

Since your application uses **WebSockets** (for chat and game state), Render is an excellent choice as it fully supports persistent WebSocket connections.

---

## Prerequisites

1. Push your code to a **GitHub** repository
2. Create a free account on [Render](https://render.com)

---

## Deployment Steps

### Step 1: Prepare Your Repository

Make sure your project structure looks like this:

```
your-repo/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── santa.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── notifications.js
└── README.md
```

### Step 2: Create a Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service with these settings:

#### Basic Settings
- **Name**: `secret-santa-app` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `master` (or `main`)
- **Runtime**: `Python 3`

#### Build & Deploy Settings
- **Build Command**: 
  ```bash
  pip install -r backend/requirements.txt
  ```

- **Start Command**: 
  ```bash
  uvicorn backend.main:app --host 0.0.0.0 --port $PORT
  ```

#### Instance Type
- **Free** (for testing) or **Starter** (for production)

5. Click **Create Web Service**

### Step 3: Wait for Deployment

- Render will automatically build and deploy your backend
- This takes about 2-5 minutes for the first deployment
- You'll see build logs in the Render dashboard

### Step 4: Get Your Render URL

Once deployed, Render will give you a URL like:
```
https://secret-santa-app.onrender.com
```

**Copy this URL** - you'll need it for the next step.

### Step 5: Configure Frontend API URL

1. In your local repository, open `frontend/script.js`
2. Find the `API_BASE` configuration (around line 248-251)
3. Update the production URL with your Render URL:

```javascript
const API_BASE = isLocal
    ? 'http://localhost:8080'
    : 'https://YOUR-APP-NAME.onrender.com'; // Replace with your actual Render URL
```

**Important**: Make sure there's NO trailing slash (`/`) at the end of the URL.

### Step 6: Update and Redeploy

1. Commit the changes:
   ```bash
   git add frontend/script.js
   git commit -m "Update production API URL"
   git push origin master
   ```

2. Render will automatically detect the changes and redeploy (Auto-deploy is enabled by default)

---

## Configure Static File Serving (Important!)

By default, Render deploys only the backend. To serve your frontend files, you need to configure FastAPI to serve static files.

### Option A: Update `backend/main.py` to Serve Frontend

Add the following to your `backend/main.py`:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount the frontend directory as static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Serve index.html at the root
@app.get("/")
async def read_root():
    return FileResponse("frontend/index.html")
```

### Option B: Use Render Static Site (Separate Deployment)

If you prefer to keep frontend separate:

1. Deploy backend as a Web Service (as shown above)
2. Deploy frontend as a Static Site:
   - Click **New +** → **Static Site**
   - Connect the same repository
   - **Publish Directory**: `frontend`
   - Deploy

---

## Environment Variables (Optional)

If you're using MongoDB Atlas or other services requiring environment variables:

1. In Render dashboard, go to your service
2. Click **Environment** in the left sidebar
3. Add environment variables:
   - `MONGODB_URL`: Your MongoDB connection string
   - Any other required variables

---

## Testing Your Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Test the following:
   - ✅ Create a room
   - ✅ Copy and share the room link
   - ✅ Join from another device/browser
   - ✅ Send chat messages (WebSocket test)
   - ✅ Start the Secret Santa game
   - ✅ Refresh the page (session persistence)

---

## Troubleshooting

### Issue: "Application Error" or 503

**Solution**: Check the Render logs:
- Go to your service dashboard
- Click **Logs** tab
- Look for error messages

Common causes:
- Missing dependencies in `requirements.txt`
- Incorrect start command
- Port configuration issues

### Issue: Frontend loads but API calls fail

**Solution**: Check CORS configuration in `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: WebSocket connection fails

**Solution**: Ensure your WebSocket URL in `frontend/script.js` uses the correct protocol:
- `wss://` for HTTPS (production)
- `ws://` for HTTP (local)

---

## Free Tier Limitations

Render's free tier has some limitations:

- **Spin down after 15 minutes of inactivity** (app will restart on next request, takes ~30 seconds)
- **750 hours/month** of runtime
- **Limited resources**

**Recommendation**: For production use, consider upgrading to the Starter plan ($7/month) for:
- No spin-down
- Better performance
- More resources

---

## Summary

✅ **Backend + Frontend** hosted on Render  
✅ **WebSockets** fully supported  
✅ **Auto-deployment** from GitHub  
✅ **Free tier** available for testing  

Your Secret Santa app is now live! Share the Render URL with your friends and family to organize your gift exchange! 🎁🎄
