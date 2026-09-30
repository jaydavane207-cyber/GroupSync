# Frontend Architecture Guide

## Directory Conventions (`frontend/src/`)

- `pages/`: Full screen route views corresponding to React Router.
- `components/`: Modular design system components organized by semantic category (`layout`, `buttons`, `cards`, `forms`, `badges`, `modals`, `notifications`, `loaders`, `chat`, `profile`, `team`, `quiz`, `common`, `background`).
- `hooks/`: Custom stateful React hooks (`useAuth`, `useTeams`, `useProjects`, etc.).
- `context/`: React context providers for application state.
- `lib/`: Business logic, services, utilities, and API clients.
- `state/`: Zustand stores for granular reactive state management.
- `styles/`: Modular design tokens and global Tailwind utility layers.

## Path Aliasing
Always use the `@/` alias configured in `vite.config.js` to refer to `frontend/src/`.
Example:
```javascript
import Button from '@/components/buttons/Button';
import { useAuth } from '@/hooks/useAuth';
```
