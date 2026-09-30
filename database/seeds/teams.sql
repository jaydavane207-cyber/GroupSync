-- Sample teams seed data
INSERT INTO public.groups (name, description, category, max_members, admin_id, status)
VALUES
  ('HackMIT Finalists', 'Building an autonomous campus shuttle scheduling agent.', 'Hackathon', 4, 'a0000000-0000-0000-0000-000000000001', 'recruiting'),
  ('OpenSource Web3', 'Decentralized identity research group.', 'Open Source', 6, 'a0000000-0000-0000-0000-000000000002', 'active')
ON CONFLICT DO NOTHING;
