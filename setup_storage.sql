-- Enable storage management
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "extensions";

-- Set up storage policy for the memes bucket
BEGIN;
  -- Remove any existing policies
  DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
  
  -- Create a policy to allow public access to the memes bucket
  CREATE POLICY "Allow public access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'memes')
  WITH CHECK (bucket_id = 'memes');
  
  -- Grant access to authenticated and anonymous users
  GRANT ALL ON storage.objects TO authenticated;
  GRANT ALL ON storage.objects TO anon;
  GRANT ALL ON storage.objects TO service_role;
COMMIT; 