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

def test_upload():
    # Test with a single image
    test_image = "Curated/Michael-Jackson-Popcorn.jpg"
    
    if not os.path.exists(test_image):
        print(f"Error: Test image {test_image} not found!")
        return
    
    try:
        print(f"Attempting to upload {test_image}...")
        
        # Upload file to Supabase Storage
        with open(test_image, 'rb') as f:
            result = supabase.storage.from_('memes').upload(
                "test.jpg",
                f
            )
            print("Upload successful!")
            print("Result:", result)
            
    except Exception as e:
        print(f"Error during upload: {str(e)}")

if __name__ == "__main__":
    test_upload() 