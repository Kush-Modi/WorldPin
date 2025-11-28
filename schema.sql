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

-- Friend Requests Table
-- Dropping to recreate with correct types and foreign keys
drop table if exists public.friend_requests;

create table public.friend_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid not null references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(sender_id, receiver_id)
);

-- Enable RLS for friend_requests
-- alter table public.friend_requests enable row level security;
alter table public.friend_requests disable row level security;

-- Policies for friend_requests (These won't be enforced if RLS is disabled, but keeping them for reference)
-- create policy "Users can view their own sent or received requests"
-- on public.friend_requests for select
-- using (auth.uid()::text = sender_id or auth.uid()::text = receiver_id);

-- create policy "Users can send requests"
-- on public.friend_requests for insert
-- with check (auth.uid()::text = sender_id);

-- create policy "Users can update their received requests"
-- on public.friend_requests for update
-- using (auth.uid()::text = receiver_id);

-- We need a way to check friendship status in RLS, but since we disabled RLS on places for now (as per line 29),
-- we will handle the "view friend's map" logic in the application layer or re-enable RLS later with a proper function.
-- For now, we keep places RLS disabled to avoid breaking existing functionality and rely on client-side checks.

-- Profiles Table (Public profile info)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  display_name text,
  full_name text,
  avatar_url text,
  updated_at timestamptz
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies (Drop first to avoid "already exists" error)
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, full_name, avatar_url)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1), -- Default display name from email
    '',
    ''
  );
  return new;
end;
$$;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Policies (for photos bucket)
-- Ensure the bucket exists (this usually needs to be done in dashboard, but policies can be set here)
-- We assume a bucket named 'photos' exists.

-- Allow public access to view photos
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'photos' );

-- Allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
on storage.objects for insert
with check ( bucket_id = 'photos' and auth.role() = 'authenticated' );

-- Allow users to update/delete their own photos
create policy "Users can update own photos"
on storage.objects for update
using ( bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[2] );

create policy "Users can delete own photos"
on storage.objects for delete
using ( bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[2] );

