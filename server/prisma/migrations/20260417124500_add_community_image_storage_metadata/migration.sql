-- Store Supabase Storage metadata alongside the public image URL.
ALTER TABLE "CommunityPost"
ADD COLUMN "imageBucket" TEXT,
ADD COLUMN "imagePath" TEXT;

-- Create the optional public bucket used by the mobile app image picker.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-post-images',
  'community-post-images',
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
      AND policyname = 'Community images are publicly readable'
  ) THEN
    CREATE POLICY "Community images are publicly readable"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'community-post-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own community images'
  ) THEN
    CREATE POLICY "Users can upload own community images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'community-post-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
