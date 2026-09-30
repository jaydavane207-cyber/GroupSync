# Database & Supabase Guide

## Migration Strategy
Migrations are tracked sequentially in `database/migrations/`:
- `001` through `014` define core tables, constraints, indexes, realtime publications, and RLS policies.
- Run migrations using the Supabase CLI:
```bash
supabase db push
```

## Row Level Security
All tables enforce Row Level Security. Authenticated users can read public tables while mutations are restricted to resource owners.
