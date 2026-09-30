# Messages Schema

## Tables: `public.chat_messages` & `public.direct_messages`

### `chat_messages`
Channels like `'general'`, `'hackathon'`, or `'team_<teamId>'`.
- `id` (BIGINT PK)
- `channel` (TEXT)
- `user_id` (UUID FK -> profiles)
- `user_name` (TEXT)
- `text` (TEXT)
- `created_at` (TIMESTAMPTZ)

### `direct_messages`
1-on-1 private messaging.
- `id` (BIGINT PK)
- `sender_id` (UUID FK -> profiles)
- `recipient_id` (UUID FK -> profiles)
- `text` (TEXT)
- `read` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
