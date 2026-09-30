# Projects Schema

## Table: `public.projects`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique project identifier |
| `owner_id` | UUID | NOT NULL, REFERENCES profiles(id) | Project owner/creator |
| `title` | TEXT | NOT NULL | Project title |
| `description` | TEXT | | Project synopsis & requirements |
| `tags` | TEXT[] | DEFAULT '{}' | Tech stack tags |
| `status` | TEXT | DEFAULT 'idea' | 'idea', 'in_progress', 'completed' |
| `github_url` | TEXT | | GitHub repository URL |
| `demo_url` | TEXT | | Live deployment URL |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last updated timestamp |
