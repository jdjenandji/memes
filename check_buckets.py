import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

try:
    # List all buckets
    print("Attempting to list buckets...")
    buckets = supabase.storage.list_buckets()
    print("\nAvailable buckets:")
    for bucket in buckets:
        print(f"- {bucket['name']}")
except Exception as e:
    print(f"Error: {str(e)}") 