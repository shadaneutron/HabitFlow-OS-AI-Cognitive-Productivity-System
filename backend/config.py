import os
import logging

logger = logging.getLogger(__name__)

def load_dotenv():
    """Loads environment variables from backend/.env if it exists."""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        if "=" in line:
                            key, val = line.split("=", 1)
                            os.environ[key.strip()] = val.strip()
            logger.info("Loaded environment variables from backend/.env")
        except Exception as e:
            logger.error(f"Error loading .env file: {e}")

# Load environment variables on module import
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "llama-3.1-8b-instant")

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set in environment variables.")
