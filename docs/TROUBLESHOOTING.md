# Troubleshooting & Common Issues

## 1. Supabase Auth Redirects
If OAuth redirects to `http://localhost:5173/` without persisting the user session:
- Ensure the Redirect URLs under **Supabase Dashboard -> Authentication -> URL Configuration** include `http://localhost:5173/**`.

## 2. Real-time Subscriptions Not Firing
- Verify `database/migrations/012_enable_realtime.sql` has run and tables are added to `supabase_realtime` publication.

## 3. RLS Violation on Insert
- Verify user ID matches `auth.uid()` in query or policy check.
