# Authentication Guide

GroupSync supports two authentication methods via Supabase Auth:
1. **Email & Password**: Verified email addresses with custom password security requirements.
2. **Google OAuth**: Fast single-click authentication for student accounts.

## Onboarding Gate
Users with uncompleted profiles are redirected to `/onboarding` via `ProtectedLayout` until mandatory onboarding steps (academic department, skills, and bio) are finalized.
