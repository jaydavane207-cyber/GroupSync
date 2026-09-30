-- Sample quizzes seed data
INSERT INTO public.quizzes (skill, title, description, passing_score, time_limit_minutes, questions)
VALUES
  (
    'React',
    'React Fundamentals Verification',
    'Test your knowledge of React hooks, lifecycle, reconciliation, and state management.',
    70,
    10,
    '[
      {"id": "q1", "question": "What is the primary purpose of useEffect with an empty dependency array?", "options": ["Runs on every render", "Runs once on mount", "Runs only on unmount", "Throws an error"], "correct_option": 1},
      {"id": "q2", "question": "Which hook is best suited for complex state logic in a component?", "options": ["useState", "useMemo", "useReducer", "useRef"], "correct_option": 2}
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;
