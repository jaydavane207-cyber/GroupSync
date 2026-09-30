# SGF-Mini Technology Stack

This document outlines the core technologies, frameworks, libraries, and services that power the SGF-Mini application.

## Frontend Runtime & Framework
- **React (v19)**: The core UI library used for building component-based user interfaces.
- **Vite (v7)**: A lightning-fast modern frontend build tool that provides a faster and leaner development experience for modern web projects.
- **React Router DOM (v7)**: The standard routing library for React, enabling declarative routing and multi-page application feel in a single-page app architecture.

## Styling & Typography
- **Tailwind CSS (v4)**: A utility-first CSS framework for rapidly building custom designs without having to leave your HTML.
- **Tailwind Merge (`tailwind-merge`) & CLSX (`clsx`)**: Utility functions for properly constructing and merging Tailwind CSS class strings conditionally.
- **Lucide React**: A beautiful and consistent icon toolkit used throughout the application UI.

## Motion & Animations
- **Framer Motion**: An animation and gesture library for React that makes it easy to create complex, fluid animations.

## State Management
- **Zustand**: A small, fast, and scalable bearbones state-management solution used for managing global application state efficiently.

## Backend & Services
- **Supabase (`@supabase/supabase-js`)**: An open-source Firebase alternative providing a complete backend-as-a-service solution. It provides:
  - **PostgreSQL Database**: The core relational database.
  - **Authentication**: Managing user signups, logins, and session data.
  - **Realtime / Subscriptions**: WebSocket-based real-time functionality (e.g., chat messaging).
  - **Storage**: Managing file uploads, such as images or event posters.

## Tooling & Quality Assurance
- **ESLint**: Pluggable linting utility for JavaScript and TypeScript to catch syntax errors and maintain code consistency.
- **Vite Web Plugin (`@vitejs/plugin-react`)**: Provides Fast Refresh capabilities for optimal developer experience.
