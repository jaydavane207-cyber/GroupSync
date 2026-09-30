-- Sample projects seed data
INSERT INTO public.projects (owner_id, title, description, tags, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'EcoRoute AI', 'Optimization engine for electric vehicle route planning and charge stops.', ARRAY['React', 'Python', 'FastAPI'], 'in_progress'),
  ('a0000000-0000-0000-0000-000000000002', 'StudySync Hub', 'Collaborative virtual study rooms with integrated pomodoro and ambient audio.', ARRAY['React', 'Supabase', 'Tailwind'], 'completed')
ON CONFLICT DO NOTHING;
