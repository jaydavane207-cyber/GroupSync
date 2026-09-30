# GroupSync 🚀

> **Production-ready, AI-enhanced student collaboration & project team-matching platform.**

GroupSync empowers students and developers to form optimal project teams, take proctored skill-verification quizzes, collaborate in real-time campus and team channels, earn XP and badges, and showcase verified credibility.

---

## 🏗️ Architecture Overview

GroupSync is organized as a unified, production-ready monorepo separating client interfaces, backend services, database migrations, and centralized documentation:

```
groupsync/
├── .github/                     # GitHub Actions CI/CD workflows & issue templates
├── backend/                     # Node.js + Express API starter service (REST & WebSockets)
├── database/                    # Supabase PostgreSQL schema, migrations, triggers & RLS
│   ├── migrations/              # Sequenced numbered migrations (001_ to 014_)
│   ├── seeds/                   # Seed data (users, teams, projects, quizzes)
│   ├── functions/               # Stored procedures & scoring algorithms
│   ├── triggers/                # Database triggers (XP, chats, notifications)
│   ├── policies/                # Row-Level Security (RLS) policies
│   └── schemas/                 # Markdown documentation of table relationships
├── docs/                        # Complete technical documentation & design specs
│   ├── architecture/            # Architectural decisions & system designs
│   ├── api/                     # API endpoint references & specifications
│   ├── database/                # ER diagrams & schema references
│   ├── deployment/              # Vercel, Supabase & Cloud deployment guides
│   ├── guides/                  # Development & onboarding runbooks
│   ├── design-system/           # Color tokens, typography, and component specs
│   ├── runbooks/                # Feature testing runbooks (Chat, Quiz, Teams, Profile)
│   └── images/                  # Architecture diagrams & app screenshots
├── frontend/                    # Modern React 19 + Vite SPA with Tailwind CSS
│   ├── public/                  # Static assets (icons, logos, media)
│   └── src/
│       ├── assets/              # Component-level static media
│       ├── components/          # Categorized, modular UI component library
│       │   ├── badges/          # Credibility & skill badges
│       │   ├── buttons/         # Action buttons & state toggles
│       │   ├── cards/           # User, Team, Project, and Quiz cards
│       │   ├── chat/            # Real-time chat & message components
│       │   ├── forms/           # Form inputs, filters, and controls
│       │   ├── layout/          # Navbar, Sidebar, and AppShell
│       │   ├── loaders/         # Skeletons, spinners, and placeholders
│       │   ├── modals/          # Dialogs and verification flows
│       │   ├── notifications/   # Toast banners and alerts
│       │   ├── profile/         # Portfolio & skill verification widgets
│       │   ├── quiz/            # Proctored quiz taking interfaces
│       │   ├── team/            # Team creation and member rosters
│       │   └── common/          # Shared utility components
│       ├── config/              # Centralized environment & client config
│       ├── constants/           # Global enums, routes, and constants
│       ├── context/             # Global React Context providers
│       ├── hooks/               # Custom reusable React hooks
│       ├── lib/                 # Core utilities, API clients, Supabase helpers
│       ├── pages/               # Top-level page views and routes
│       ├── state/               # Zustand global state stores
│       ├── styles/              # Design tokens and modular stylesheets
│       ├── tests/               # Unit, integration, and E2E specs
│       └── types/               # TypeScript type definitions & interfaces
├── mobile/                      # React Native / Expo cross-platform mobile scaffold
├── scripts/                     # Operational, data seed, and migration scripts
├── .editorconfig                # Universal IDE formatting rules
├── .env.example                 # Root environment variable documentation template
├── docker-compose.yml           # Local multi-service development orchestrator
├── package.json                 # Monorepo root workspace orchestration
└── turbo.json                   # Turborepo task pipeline configuration
```

---

## ⚡ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS | Fast, accessible client UI with `@/` path aliasing |
| **State & Data** | Zustand & React Context | Predictable state management and auth contexts |
| **Backend** | Node.js, Express, Socket.IO | Extensible REST API and WebSocket events |
| **Database** | PostgreSQL + Supabase BaaS | Relational data, RLS, functions, and real-time pub/sub |
| **Mobile** | React Native, Expo | Native iOS and Android companion client |
| **DevOps & CI** | GitHub Actions, Turborepo | Automated linting, test suites, and Vercel CD |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)
- **Supabase Account**: A Supabase project with database credentials

### 2. Installation
Clone the repository and install dependencies at the monorepo root:
```bash
git clone https://github.com/jaydavane207-cyber/GroupSync.git
cd GroupSync
npm install
```

### 3. Environment Setup
Copy the example environment file and provide your Supabase credentials:
```bash
cp .env.example frontend/.env
```
Populate `frontend/.env` with your project URL and public key:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Running the Development Server
From the project root:
```bash
# Starts the frontend development server on http://localhost:3000
npm run dev
```

---

## 🛠️ Monorepo Scripts

Run standard commands directly from the monorepo root:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launch frontend Vite development server at `localhost:3000` |
| `npm run build` | Compile optimized production bundles in `frontend/dist/` |
| `npm run lint` | Run ESLint across frontend and backend codebases |
| `npm run test` | Execute test runner |
| `npm run preview` | Locally preview the built production bundle |

---

## 🗄️ Database Setup

All migrations, triggers, stored functions, and RLS policies are sequentially organized in the `database/` directory:

1. **Migrations**: Apply `database/migrations/001_init_users.sql` through `database/migrations/014_add_triggers.sql` sequentially in your Supabase SQL editor.
2. **Seeds**: Run seed scripts from `database/seeds/` to populate test users, projects, and quiz questions.
3. **Automated Runner**: Use `node scripts/run_migrations.mjs` for programmatic migration application.

See [`database/README.md`](database/README.md) for full instructions.

---

## 📚 Documentation Index

Comprehensive guides are available in the [`docs/`](docs/) directory:

- [**System Architecture**](docs/ARCHITECTURE.md) - Deep dive into data flow and component hierarchy.
- [**API Specifications**](docs/API.md) - Full endpoint documentation for backend and Supabase calls.
- [**Database Schema**](docs/DATABASE.md) - Entity relationship models, constraints, and RLS rules.
- [**Deployment Runbook**](docs/DEPLOYMENT.md) - Step-by-step production deployment instructions.
- [**Troubleshooting Guide**](docs/TROUBLESHOOTING.md) - Common build, auth, and database resolutions.
- [**Testing Runbooks**](docs/runbooks/) - Feature-by-feature verification instructions.

---

## 👥 Contributing

We welcome contributions! Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](docs/CODE_OF_CONDUCT.md) before opening a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
