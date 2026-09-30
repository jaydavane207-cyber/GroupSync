-- Sample development seed data for profiles
INSERT INTO public.profiles (id, name, email, college, branch, year, xp, credibility_score, bio)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alex Rivera', 'alex@university.edu', 'Stanford University', 'Computer Science', 'Senior', 1250, 92, 'Full-stack builder passionate about open source and AI.'),
  ('a0000000-0000-0000-0000-000000000002', 'Sarah Chen', 'sarah@university.edu', 'MIT', 'Electrical Engineering', 'Junior', 940, 88, 'Hardware tinkerer and frontend enthusiast.'),
  ('a0000000-0000-0000-0000-000000000003', 'Marcus Johnson', 'marcus@university.edu', 'UC Berkeley', 'Data Science', 'Sophomore', 620, 81, 'Data visualization nerd and hackathon winner.')
ON CONFLICT (id) DO NOTHING;
