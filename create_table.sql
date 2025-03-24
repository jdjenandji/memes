-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create memes table
create table if not exists memes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  file_name text not null,
  extension text not null,
  mime_type text not null,
  storage_path text not null,
  public_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
); 