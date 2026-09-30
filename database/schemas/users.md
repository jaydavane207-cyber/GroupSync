# Users Schema

Integrates directly with Supabase Auth (`auth.users`).

## Table: `auth.users`

- Managed by Supabase GoTrue authentication service.
- Triggers `on_auth_user_created` to automatically generate a corresponding `public.profiles` row upon email or OAuth signup.
- Secrets and tokens are securely managed within `auth.users` and `public.user_secrets`.
