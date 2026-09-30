# Notifications Schema

## Table: `public.notifications`

- `id`: UUID Primary Key
- `user_id`: UUID References `profiles(id)`
- `title`: Notification title
- `message`: Notification body
- `type`: 'team_invite', 'badge_earned', 'system'
- `read`: Boolean flag
- `link`: Optional routing destination
- `created_at`: Creation timestamp
