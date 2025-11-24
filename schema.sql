-- Create the places table
create table public.places (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Storing Firebase UID
  name text not null,
  full_name text not null,
  location jsonb not null, -- Storing { lat: number, lng: number }
  photos text[] default array[]::text[],
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.places enable row level security;

-- Create policies
-- Allow users to view their own places
create policy "Users can view their own places"
on public.places for select
using ( user_id = auth.uid()::text ); -- Note: This assumes you are using Supabase Auth. Since we are using Firebase Auth, we might need to pass the user ID manually or use a different RLS strategy if we want strict enforcement. 
-- FOR NOW: Since we are using Firebase Auth, Supabase doesn't know the user is logged in via `auth.uid()`.
-- We will disable RLS for simplicity as requested "don't touch firebase auth", OR we can use a service role key (not recommended for client), OR we just rely on client-side filtering for this demo.
-- BETTER APPROACH for "Firebase Auth + Supabase DB":
-- Since we don't have a custom JWT setup for Firebase->Supabase, RLS based on `auth.uid()` won't work out of the box.
-- We will create a policy that allows all operations for now, or we would need to implement a custom auth flow.
-- Given the constraints, I will make the table public for read/write but we will filter by user_id in the client.
-- This is NOT secure for production but fits the "quick fix" nature.
-- ACTUALLY, let's just disable RLS for now to ensure it works immediately.

alter table public.places disable row level security;
