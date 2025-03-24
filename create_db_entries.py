import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid
from datetime import datetime
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
openai_api_key = os.getenv('OPENAI_API_KEY')

print(f"Connecting to Supabase at: {supabase_url}")
supabase: Client = create_client(supabase_url, supabase_key)
openai_client = OpenAI(api_key=openai_api_key)

def get_meme_description(meme_name: str) -> str:
    """Get a description of the meme using OpenAI."""
    try:
        # Format the meme name to be more readable
        readable_name = meme_name.replace('-', ' ').strip()
        
        # Create the prompt
        prompt = f"Write a brief, engaging 1-2 sentence description of the '{readable_name}' meme. Explain its typical usage and cultural significance. Keep it concise but informative."
        
        # Get completion from OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a knowledgeable assistant that provides concise, accurate descriptions of internet memes."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        # Extract and return the description
        description = response.choices[0].message.content.strip()
        print(f"Generated description for {meme_name}: {description}")
        return description
        
    except Exception as e:
        print(f"Error getting description for {meme_name}: {str(e)}")
        return "No description available."

def create_database_entry(file_name: str) -> dict:
    """Create a database entry for an already uploaded image."""
    try:
        # Get file info
        file_stem = Path(file_name).stem
        storage_path = file_name
        
        print(f"Processing {file_name}...")
        
        # Get public URL
        public_url = supabase.storage.from_('memes').get_public_url(storage_path)
        print(f"Generated public URL: {public_url}")
        
        # Get meme description
        description = get_meme_description(file_stem)
        
        # Create database entry
        data = {
            'id': str(uuid.uuid4()),
            'name': file_stem,
            'created_at': datetime.utcnow().isoformat(),
            'url': public_url,
            'description': description
        }
        
        print(f"Inserting data into database: {data}")
        result = supabase.table('memes').insert(data).execute()
        print(f"Successfully created entry for {file_name}")
        return result.data
        
    except Exception as e:
        print(f"Error processing {file_name}: {str(e)}")
        return None

def update_existing_descriptions():
    """Update descriptions for existing entries in the database."""
    try:
        # Get all entries without descriptions
        response = supabase.table('memes').select('*').execute()
        entries = response.data
        
        print(f"Found {len(entries)} entries to update")
        
        # Update each entry
        for entry in entries:
            if not entry['description']:
                description = get_meme_description(entry['name'])
                
                # Update the database
                supabase.table('memes').update({
                    'description': description
                }).eq('id', entry['id']).execute()
                
                print(f"Updated description for {entry['name']}")
        
        print("Finished updating descriptions")
        
    except Exception as e:
        print(f"Error updating descriptions: {str(e)}")

def main():
    try:
        # First, update existing entries that don't have descriptions
        print("Updating existing entries...")
        update_existing_descriptions()
        
        # Then process any new files
        print("\nChecking for new files...")
        try:
            # List files in the memes bucket
            response = supabase.storage.from_('memes').list()
            files = [item['name'] for item in response]
            print(f"Found {len(files)} files in storage")
            
            if files:
                print("Files found:", files)
            
            # Process each file
            successful = 0
            for file_name in files:
                result = create_database_entry(file_name)
                if result:
                    successful += 1
            
            print(f"\nDatabase entries creation complete!")
            print(f"Successfully processed {successful} out of {len(files)} files")
            
        except Exception as e:
            print(f"Error accessing storage: {str(e)}")
            print("Error type:", type(e).__name__)
            
    except Exception as e:
        print(f"Error in main: {str(e)}")
        print("Error type:", type(e).__name__)

if __name__ == "__main__":
    main() 