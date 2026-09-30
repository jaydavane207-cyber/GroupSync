# Deployment Guide

## Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. Build Command:
```bash
npm run build --workspace=frontend
```
2. Output Directory:
`frontend/dist`
3. Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## Backend Deployment (Render / Railway / AWS ECS)

1. Root Directory: `backend`
2. Build Command: `npm install`
3. Start Command: `npm start`
