import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB configuration
# For MongoDB Atlas, use connection string format:
# mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://secretsanta_user:cezG5iNa85hodn5W@cluster0.wkmbhfh.mongodb.net/?appName=Cluster0")
DB_NAME = os.getenv("DB_NAME", "secret_santa_db")

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        try:
            self.client = AsyncIOMotorClient(MONGO_URL)
            self.db = self.client[DB_NAME]
            print(f"[OK] Connected to MongoDB database: {DB_NAME}")
            # Masked URL for security (hide credentials in logs)
            safe_url = MONGO_URL.split('@')[-1] if '@' in MONGO_URL else MONGO_URL
            print(f"[OK] MongoDB host: {safe_url}")
        except Exception as e:
            print(f"[ERROR] Failed to connect to MongoDB: {e}")
            raise

    def close(self):
        if self.client:
            self.client.close()
            print("[OK] Disconnected from MongoDB")

db = Database()
