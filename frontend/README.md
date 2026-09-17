# Task Manager - Frontend Web

Frontend React + Vite + TypeScript pour l'application Task Manager, consommant l'API Spring Boot.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Le fichier `.env` doit pointer vers l'URL de l'API backend :

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Structure

```
src/
  components/   # composants réutilisables (ProtectedRoute, etc.)
  context/      # AuthContext (token, user en localStorage)
  pages/        # Login, Register, Tasks
  services/     # api.ts (client axios + intercepteur JWT), authService, taskService
  types/        # types TypeScript partagés (Task, User, ...)
```

## Fonctionnalités

- Inscription / connexion, token JWT stocké en localStorage
- Route protégée `/tasks` (redirection vers `/login` si non connecté)
- CRUD des tâches (création, modification du statut, suppression)
- Filtrage par statut + recherche par titre

## Build

```bash
npm run build
```
