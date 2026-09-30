# Teams & Groups Schema

## Tables: `public.groups` & `public.group_members`

### `groups`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, GENERATED ALWAYS | Group ID |
| `name` | TEXT | NOT NULL | Team name |
| `description` | TEXT | | Goals and focus |
| `category` | TEXT | | 'Hackathon', 'Project', 'Study' |
| `max_members` | INTEGER | DEFAULT 10 | Max capacity |
| `admin_id` | UUID | REFERENCES profiles(id) | Team creator |
| `status` | TEXT | DEFAULT 'active' | Current team status |

### `group_members`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY | Join record ID |
| `group_id` | BIGINT | REFERENCES groups(id) | Team ID |
| `profile_id` | UUID | REFERENCES profiles(id) | Member ID |
| `role` | TEXT | DEFAULT 'member' | 'leader', 'member' |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | Join date |
