# How to Connect to MongoDB Atlas (Online Database)

Currently, the application is set up to connect to a local MongoDB instance by default. To switch to an online database (MongoDB Atlas) so that your data persists in the cloud and is accessible from anywhere (e.g., when you deploy the backend), follow these steps.

## Step 1: Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up for a free account (you can use your Google account).
3. Fill in the welcome questionnaire (or skip it).

## Step 2: Create a Cluster
1. After logging in, you will be prompted to build a database.
2. Choose the **Shared** (FREE) option.
3. Select a **Cloud Provider & Region** (usually AWS and the region closest to you/your users, e.g., N. Virginia or Mumbai).
4. Click **Create Cluster** (the default name `Cluster0` is fine).
5. Wait for the cluster to be provisioned (this might take 1-3 minutes).

## Step 3: Create a Database User
1. While the cluster is being created, you will be asked to set up security.
2. **Username and Password**: Create a username (e.g., `admin`) and a strong password.
   - **IMPORTANT**: Write down this password! You will need it for the connection string.
3. Click **Create User**.

## Step 4: Network Access (Allow Connections)
1. Scroll down to "IP Access List" or go to **Network Access** in the sidebar.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (0.0.0.0/0).
   - *Note: For production apps, you usually whitelist specific IPs, but for this project and Render/Netlify deployment, allowing from anywhere is the easiest way to ensure the backend can connect.*
4. Click **Confirm**.

## Step 5: Get the Connection String
1. Go back to **Database** (in the sidebar) and click **Connect** on your cluster.
2. Select **Drivers**.
3. You will see a connection string that looks like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Copy this string.

## Step 6: Update Your Application
1. Open your project folder.
2. Navigate to the `backend` folder.
3. Create a file named `.env` if it doesn't exist (or open it if it does).
4. Add (or update) the `MONGO_URL` variable with the string you copied.
5. **Replace** `<password>` with the actual password you created in Step 3.

**Example `.env` file:**
```env
MONGO_URL=mongodb+srv://admin:mySuperSecretPassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
DB_NAME=secret_santa_db
```

## Step 7: Verify Connection
1. Restart your backend server.
   ```bash
   # In the backend terminal
   python main.py
   ```
2. Check the logs. You should see:
   ```
   [OK] Connected to MongoDB database: secret_santa_db
   [OK] MongoDB host: cluster0.xxxxx.mongodb.net...
   ```

## Troubleshooting
- **Authentication Failed**: Double-check your password in the `.env` file. Ensure there are no special characters that need URL encoding (though usually standard characters are fine).
- **Timeout / Network Error**: Ensure you completed Step 4 (Network Access) and allowed `0.0.0.0/0`.
- **DNS Issues**: If you see DNS errors, try replacing `mongodb+srv://` with the older standard connection string (usually available in the "Connect" dialog under "I am using an older version..."), but `srv` usually works best.
