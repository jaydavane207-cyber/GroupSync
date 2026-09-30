# GroupSync Database Architecture

This directory contains version-controlled Supabase SQL migrations, seed files, functions, triggers, security policies, and documentation.

## Directory Structure

- `migrations/`: Sequential SQL migrations (e.g. `001_init_users.sql` to `014_add_triggers.sql`)
- `migrations/archive/`: Legacy raw migration scripts preserved for reference
- `seeds/`: Initial development seeds for testing
- `functions/`: Reusable stored functions
- `triggers/`: Automation triggers
- `policies/`: Modular Row Level Security policies
- `schemas/`: Detailed schema specifications

## Setup & Running Migrations

Using the Supabase CLI:
```bash
supabase db reset
```

Or execute scripts sequentially in the Supabase Dashboard SQL Editor:
1. Run `migrations/001_init_users.sql` through `014_add_triggers.sql`
2. Run desired seed files from `seeds/`
