# Supabase setup

## Apply the schema

1. Open your Supabase project's **SQL Editor**.
2. Paste the contents of `migrations/0001_init.sql`.
3. Click **Run**.

This creates 6 tables (`brands`, `accounts`, `buyers`, `interactions`, `reorders`, `reminders`), 2 enums (`account_stage`, `interaction_type`), all RLS policies, and a public `brand-logos` storage bucket.

## Auth configuration

In **Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3737` (in development) or your production URL
- **Redirect URLs**: add `http://localhost:3737/auth/callback`

Magic links are enabled by default. No other provider setup required for MVP.
