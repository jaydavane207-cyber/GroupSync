# Development Environment Setup

## Workspace Architecture

This project is a monorepo configured with npm workspaces:
- `frontend`: Vite + React 19 app
- `backend`: Express API service
- `mobile`: React Native / Expo application

## Running Components

### Frontend
```bash
npm run dev
# or
npm --prefix frontend run dev
```

### Backend
```bash
npm --prefix backend run dev
```

### Mobile
```bash
npm --prefix mobile start
```
