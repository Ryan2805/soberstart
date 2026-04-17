-- Keep profile image storage metadata on the app user row.
ALTER TABLE "User"
ADD COLUMN "displayName" TEXT,
ADD COLUMN "profileImageUrl" TEXT,
ADD COLUMN "profileImageBucket" TEXT,
ADD COLUMN "profileImagePath" TEXT;

-- Create the public profile picture bucket used by the Account screen.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Profile pictures are publicly readable'
  ) THEN
    CREATE POLICY "Profile pictures are publicly readable"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile-pictures');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own profile pictures'
  ) THEN
    CREATE POLICY "Users can upload own profile pictures"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-pictures'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
