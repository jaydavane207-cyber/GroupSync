# API Documentation

The GroupSync ecosystem communicates through two primary channels:
1. Direct Supabase PostgREST & Realtime WebSocket client.
2. Node.js/Express REST API (`http://localhost:4000/api`).

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login user

### Users & Profiles
- `GET /api/users/:id/profile` - Get user profile

### Teams & Projects
- `GET /api/teams` - List teams
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

### Real-Time Chat
- `GET /api/messages/channel/:channel` - Retrieve channel history
