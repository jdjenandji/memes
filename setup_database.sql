-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the memes table
DROP TABLE IF EXISTS memes;
CREATE TABLE memes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    extension TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_name)
);

-- Disable Row Level Security
ALTER TABLE memes DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON memes TO authenticated;
GRANT ALL ON memes TO anon;
GRANT ALL ON memes TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role; 