-- Automatically generates initial team chat message upon team creation
CREATE OR REPLACE FUNCTION public.handle_new_team_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chat_messages (channel, user_id, user_name, text)
  SELECT
    'team_' || NEW.id::text,
    NEW.admin_id,
    p.name,
    'Welcome to ' || NEW.name || '! Let''s build something great together.'
  FROM public.profiles p
  WHERE p.id = NEW.admin_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_team_chat ON public.groups;
CREATE TRIGGER trigger_new_team_chat
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team_chat();
