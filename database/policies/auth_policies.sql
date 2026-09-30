-- Auth related RLS policies
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own secret" ON public.user_secrets;
CREATE POLICY "Users can insert their own secret"
  ON public.user_secrets FOR INSERT
  WITH CHECK (auth.uid() = id);
