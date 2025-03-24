import requests
import os
from urllib.parse import urlparse
from pathlib import Path
import time

def download_image(url, save_dir):
    try:
        # Get the filename from the URL
        filename = os.path.basename(urlparse(url).path)
        save_path = os.path.join(save_dir, filename)
        
        # Skip if file already exists
        if os.path.exists(save_path):
            print(f"Skipping {filename} - already exists")
            return True
        
        # Download the image
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Save the image
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"Downloaded {filename}")
        return True
        
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")
        return False

def main():
    # Create save directory if it doesn't exist
    save_dir = "downloaded_memes"
    os.makedirs(save_dir, exist_ok=True)
    
    # Read URLs from file
    with open('all-urls.txt', 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    total_urls = len(urls)
    successful = 0
    
    print(f"Found {total_urls} URLs to process")
    
    # Download each image with a small delay to be nice to the server
    for i, url in enumerate(urls, 1):
        if download_image(url, save_dir):
            successful += 1
        time.sleep(0.5)  # 500ms delay between downloads
        
        # Print progress every 10 downloads
        if i % 10 == 0:
            print(f"Progress: {i}/{total_urls} ({successful} successful)")
    
    print(f"\nDownload complete!")
    print(f"Successfully downloaded {successful} out of {total_urls} images")

if __name__ == "__main__":
    main() 