-- Allow public access to the 'photos' bucket
-- Since we are using Firebase Auth, we can't easily use Supabase RLS for user-specific checks without custom JWTs.
-- For this "quick migration", we will make the bucket public for uploads/downloads.

-- Update the bucket to be public (if not already)
update storage.buckets
set public = true
where id = 'photos';

-- Create a policy to allow anyone to upload to 'photos'
create policy "Allow public uploads"
on storage.objects for insert
with check ( bucket_id = 'photos' );

-- Create a policy to allow anyone to select (view) from 'photos'
create policy "Allow public downloads"
on storage.objects for select
using ( bucket_id = 'photos' );

-- Create a policy to allow anyone to update (if needed)
create policy "Allow public updates"
on storage.objects for update
using ( bucket_id = 'photos' );

-- Create a policy to allow anyone to delete (if needed)
create policy "Allow public deletes"
on storage.objects for delete
using ( bucket_id = 'photos' );
