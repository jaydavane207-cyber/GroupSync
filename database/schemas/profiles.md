# Profiles Schema

Stores public and semi-private profile information for registered students and developers.

## Table: `public.profiles`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | Unique user ID from auth |
| `name` | TEXT | NOT NULL | Full name of the student |
| `avatar` | TEXT | | Storage or public URL to profile image |
| `college` | TEXT | | University or college name |
| `branch` | TEXT | | Engineering/Major branch |
| `year` | TEXT | | Academic standing (e.g. Senior) |
| `cgpa` | TEXT | | Academic GPA |
| `bio` | TEXT | | Bio/summary |
| `xp` | INTEGER | DEFAULT 100 | Total experience points |
| `credibility_score` | INTEGER | DEFAULT 75 | Verified trust & skill score |
| `skills` | TEXT[] | DEFAULT '{}' | List of self-declared skills |
| `social_links` | JSONB | DEFAULT '{}' | GitHub, LinkedIn, and Portfolio links |
| `online` | BOOLEAN | DEFAULT false | Realtime presence status |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
