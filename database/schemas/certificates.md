# Certificates Schema

## Table: `public.certificates`

- `id`: UUID Primary Key
- `user_id`: UUID References `profiles(id)`
- `title`: Certificate title (e.g. AWS Certified Solutions Architect)
- `issuer`: Issuing body (e.g. Amazon Web Services)
- `issue_date`: Date issued
- `credential_url`: External verification link
- `file_url`: Uploaded document link in Supabase storage bucket `certificates`
- `verified`: Boolean manual/automated verification status
