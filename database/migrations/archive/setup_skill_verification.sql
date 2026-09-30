-- ==========================================
-- SGF-Mini: Skill Verification DB Setup
-- ==========================================

-- 1. Create the 'verified_skills' table
CREATE TABLE IF NOT EXISTS public.verified_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    skill_label TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    verification_method TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

-- Enable RLS on verified_skills
ALTER TABLE public.verified_skills ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all verified skills (publicly visible)
CREATE POLICY "Public profiles can view verified skills" 
    ON public.verified_skills FOR SELECT 
    TO public 
    USING (true);

-- Policy: Users can insert/update their own verified skills
CREATE POLICY "Users can manage their own verified skills" 
    ON public.verified_skills FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Create the 'certificates' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760, -- 10 MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload to certificates (must match their folder)
CREATE POLICY "Auth users can upload certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: allow public read of certificates
CREATE POLICY "Public can view certificates"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'certificates');

-- Storage RLS: allow users to delete their own certificates
CREATE POLICY "Users can edit their own certificates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own certificates"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
