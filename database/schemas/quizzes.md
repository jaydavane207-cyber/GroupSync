# Quizzes Schema

## Tables: `public.quizzes` & `public.quiz_attempts`

### `quizzes`
- `id`: UUID Primary Key
- `skill`: Associated skill name
- `title`: Assessment title
- `passing_score`: Minimum score required to verify
- `time_limit_minutes`: Duration in minutes
- `questions`: JSONB array of question objects

### `quiz_attempts`
- `id`: UUID Primary Key
- `user_id`: UUID References `profiles(id)`
- `quiz_id`: UUID References `quizzes(id)`
- `score`: Score achieved (0-100)
- `passed`: Boolean pass/fail outcome
- `answers`: JSONB submission data
