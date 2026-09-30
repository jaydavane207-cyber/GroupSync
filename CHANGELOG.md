# Changelog

All notable changes to the GroupSync project will be documented in this file.

## [1.0.0] - 2026-09-30
### Added
- Reorganized monorepo architecture separating frontend, backend, database, mobile, and docs.
- Added comprehensive modular components categorized by layout, buttons, cards, forms, badges, modals, notifications, loaders, chat, profile, team, quiz, common, and background.
- Added custom hooks (`useAuth`, `useTeams`, `useProjects`, `useNotifications`, etc.).
- Added Zustand store state layer (`authStore`, `projectStore`, `teamStore`, `chatStore`, etc.).
- Added 14 version-controlled Supabase SQL migrations and database schemas.
- Added Express.js REST API & Socket.IO backend architecture.
- Added React Native mobile application starter scaffold.
- Added GitHub Actions CI/CD workflows and issue templates.
