import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import mimetypes
import time
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

def get_mime_type(file_path: str) -> str:
    """Get the MIME type of a file."""
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type or 'application/octet-stream'

def upload_meme(file_path: str) -> dict:
    """Upload a meme to Supabase storage and create a database entry."""
    try:
        # Get file info
        file_name = os.path.basename(file_path)
        file_stem = Path(file_path).stem
        file_extension = Path(file_path).suffix.lower()
        mime_type = get_mime_type(file_path)
        
        print(f"Processing {file_name}...")
        
        # Upload file to Supabase Storage
        with open(file_path, 'rb') as f:
            storage_path = file_name  # Simplified path
            result = supabase.storage.from_('memes').upload(
                storage_path,
                f,
                {'content-type': mime_type}
            )
        
        # Get public URL
        public_url = supabase.storage.from_('memes').get_public_url(storage_path)
        
        # Create database entry
        data = {
            'name': file_stem,
            'file_name': file_name,
            'extension': file_extension,
            'mime_type': mime_type,
            'storage_path': storage_path,
            'public_url': public_url,
            'created_at': datetime.utcnow().isoformat(),
        }
        
        result = supabase.table('memes').insert(data).execute()
        
        print(f"Successfully uploaded and created entry for {file_name}")
        return result.data
        
    except Exception as e:
        print(f"Error processing {file_name}: {str(e)}")
        return None

def main():
    # Check if environment variables are set
    if not os.getenv('SUPABASE_URL') or not os.getenv('SUPABASE_KEY'):
        print("Error: Please set SUPABASE_URL and SUPABASE_KEY in .env file")
        print("You can copy .env.example to .env and fill in your credentials")
        return
    
    memes_dir = "Curated"
    if not os.path.exists(memes_dir):
        print(f"Error: Directory '{memes_dir}' does not exist!")
        return
    
    # Get list of all image files
    image_files = [
        os.path.join(memes_dir, f) for f in os.listdir(memes_dir)
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))
    ]
    
    print(f"Found {len(image_files)} images to process")
    
    # Process each image
    successful = 0
    for file_path in image_files:
        result = upload_meme(file_path)
        if result:
            successful += 1
        time.sleep(0.5)  # Small delay to avoid rate limits
    
    print(f"\nUpload complete!")
    print(f"Successfully processed {successful} out of {len(image_files)} images")

if __name__ == "__main__":
    main() 