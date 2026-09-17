# Task Manager

Mini application de gestion de tâches : API REST Spring Boot (JWT) + frontend React/Vite, MySQL, dockerisée, avec pipeline CI/CD GitHub Actions vers Google Cloud Run.

## Sommaire

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Choix techniques](#choix-techniques)
- [Structure du projet](#structure-du-projet)
- [Installation & exécution](#installation--exécution)
- [Variables d'environnement](#variables-denvironnement)
- [Tests](#tests)
- [Documentation API](#documentation-api)
- [CI/CD & déploiement GCP](#cicd--déploiement-gcp)
- [Captures d'écran](#captures-décran)
- [Déploiement en ligne](#déploiement-en-ligne)

## Architecture

```
┌─────────────┐        HTTPS/JSON        ┌──────────────────┐        JDBC        ┌───────────┐
│  Frontend   │ ───────────────────────▶ │  Backend          │ ─────────────────▶│  MySQL 8  │
│  React/Vite │ ◀─────────────────────── │  Spring Boot API  │◀──────────────────│           │
└─────────────┘      JWT (Bearer)        └──────────────────┘                    └───────────┘
```

- Le frontend est une SPA React qui consomme l'API via Axios ; le token JWT est stocké en `localStorage` et injecté sur chaque requête.
- Le backend expose une API REST stateless (aucune session serveur) : chaque requête est authentifiée via le header `Authorization: Bearer <token>`.
- MySQL persiste les utilisateurs et les tâches ; en local un conteneur Docker suffit, en production c'est une instance Cloud SQL.

## Stack technique

| Côté | Techno |
|---|---|
| Backend | Java 21, Spring Boot 4.1.1, Spring Data JPA / Hibernate, Spring Security, JWT (jjwt), MySQL, springdoc-openapi (Swagger) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios |
| Base de données | MySQL 8 (Docker en local, Cloud SQL en prod) |
| CI/CD | GitHub Actions, Docker, Google Artifact Registry, Cloud Run |

## Choix techniques

- **JWT stateless plutôt que sessions** : simplifie le scaling horizontal (Cloud Run peut créer/détruire des instances sans état partagé) et découple totalement frontend et backend.
- **Filtre de sécurité custom (`JwtAuthenticationFilter`)** plutôt qu'une lib clé-en-main : contrôle total sur la validation du token et sur les logs d'authentification.
- **Spécifications JPA (`TaskSpecifications`)** pour le filtrage des tâches (statut + recherche texte) : évite la multiplication de méthodes de repository pour chaque combinaison de filtres.
- **Connexion Cloud SQL via socket factory** (profil Spring `cloud`) plutôt qu'IP/port exposés : pas de configuration réseau (VPC connector, IP autorisées) à gérer, connexion chiffrée de bout en bout gérée par Google.
- **CORS ouvert côté API** : le frontend appelle directement l'URL du backend (pas besoin de proxy Nginx), ce qui simplifie le build Docker du frontend (l'URL de l'API est injectée via `VITE_API_BASE_URL` au moment du build).
- **Monorepo `backend/` + `frontend/`** : un seul pipeline CI/CD orchestre le build/test des deux, avec des jobs indépendants qui échouent séparément.
- **Logs applicatifs structurés** (SLF4J/Logback) : logs d'accès HTTP (méthode, statut, durée, utilisateur) + logs métier (inscriptions, connexions, opérations CRUD), rotation automatique en local.

## Structure du projet

```
taskmanager/
├── backend/                 # API Spring Boot
│   ├── src/main/java/...    # entités, repositories, services, contrôleurs, sécurité JWT
│   ├── src/test/java/...    # tests unitaires (AuthService, TaskService) + test de contexte
│   ├── Dockerfile           # build multi-stage (Maven -> JRE)
│   └── pom.xml
├── frontend/                 # SPA React/Vite
│   ├── src/
│   │   ├── pages/            # Login, Register, Tasks
│   │   ├── components/       # ProtectedRoute, StatusBadge, ...
│   │   ├── context/           # AuthContext (JWT + user)
│   │   └── services/          # client Axios + services auth/task
│   ├── Dockerfile             # build multi-stage (Node -> Nginx)
│   └── nginx.conf
├── docker-compose.yml         # MySQL + backend + frontend, pour le local
└── .github/workflows/ci-cd.yml # pipeline CI/CD
```

## Installation & exécution

### Prérequis

- Docker + Docker Compose (le plus simple)
- ou, pour un lancement manuel : Java 21, Maven (via `mvnw`), Node.js 22+, une instance MySQL 8

### Option 1 — Tout en Docker (recommandé)

```bash
docker compose up -d --build
```

- Backend : http://localhost:8080
- Frontend : http://localhost:5173
- MySQL : localhost:3308 (root/root, base `taskmanager` auto-créée)

### Option 2 — Lancement manuel

**Backend**

```bash
cd backend
./mvnw spring-boot:run
```

Nécessite une base MySQL accessible (voir [Variables d'environnement](#variables-denvironnement)). Le plus simple : ne lancer que le service `mysql` du `docker-compose.yml` :

```bash
docker compose up -d mysql
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```

## Variables d'environnement

### Backend (`backend/src/main/resources/application.properties`)

| Variable | Défaut | Description |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3308` / `taskmanager` | Connexion MySQL |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | Identifiants MySQL |
| `JWT_SECRET` | valeur de dev fournie | Clé de signature des tokens JWT (⚠️ à changer en prod) |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Durée de validité du token |
| `PORT` / `SERVER_PORT` | `8080` | Port HTTP (Cloud Run injecte `PORT`) |
| `SQL_LOG_LEVEL` | `WARN` | Niveau de log Hibernate SQL |

Profil `cloud` (`application-cloud.properties`, actif via `SPRING_PROFILES_ACTIVE=cloud`) : connexion à Cloud SQL via `CLOUD_SQL_CONNECTION_NAME` (socket factory), voir [CI/CD](#cicd--déploiement-gcp).

### Frontend (`frontend/.env`)

| Variable | Exemple | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | URL de base de l'API (embarquée au build) |

## Tests

```bash
# Backend : tests unitaires (AuthService, TaskService) + test de contexte Spring
cd backend && ./mvnw test

# Frontend : lint + build (pas de suite de tests unitaires à ce jour)
cd frontend && npm run lint && npm run build
```

## Documentation API

Une fois le backend démarré :

- Swagger UI : http://localhost:8080/swagger-ui.html
- Spec OpenAPI (JSON) : http://localhost:8080/v3/api-docs

## CI/CD & déploiement GCP

Le pipeline `.github/workflows/ci-cd.yml` :

1. **Sur chaque PR / push** : build + test du backend (Maven) et du frontend (lint + build Vite), en parallèle.
2. **Sur push vers `main`** (en plus) :
   - build des images Docker backend et frontend,
   - push vers Google Artifact Registry,
   - déploiement du backend sur Cloud Run (avec connexion Cloud SQL),
   - récupération de l'URL du backend déployé, puis build de l'image frontend avec cette URL injectée, push et déploiement sur Cloud Run.

### Pré-requis GCP (à faire une fois, avant le premier déploiement)

```bash
# Artifact Registry
gcloud artifacts repositories create taskmanager --repository-format=docker --location=europe-west1

# Cloud SQL (MySQL)
gcloud sql instances create taskmanager-db --database-version=MYSQL_8_0 --region=europe-west1 --tier=db-f1-micro
gcloud sql databases create taskmanager --instance=taskmanager-db

# Secrets (Secret Manager)
echo -n "motdepasse-secure" | gcloud secrets create db-password --data-file=-
echo -n "utilisateur-db"   | gcloud secrets create db-username --data-file=-
echo -n "cle-jwt-secrete"  | gcloud secrets create jwt-secret --data-file=-
```

### Secrets GitHub à configurer (Settings → Secrets and variables → Actions)

| Secret | Contenu |
|---|---|
| `GCP_SA_KEY` | Clé JSON d'un service account avec les rôles `roles/run.admin`, `roles/artifactregistry.writer`, `roles/cloudsql.client`, `roles/secretmanager.secretAccessor`, `roles/iam.serviceAccountUser` |
| `GCP_PROJECT_ID` | ID du projet GCP |
| `CLOUD_SQL_CONNECTION_NAME` | `project:region:instance` de l'instance Cloud SQL |

> En production, préférer la Workload Identity Federation à une clé de service account JSON (pas de secret long-lived à stocker).

## Captures d'écran

_À ajouter : lancer l'app (`docker compose up -d --build`), puis déposer des captures des pages Login/Register/Tasks dans `docs/screenshots/` et les référencer ici, par ex. :_

```markdown
![Page de connexion](docs/screenshots/login.png)
![Liste des tâches](docs/screenshots/tasks.png)
```

## Déploiement en ligne

_À compléter après le premier déploiement réussi via le pipeline CI/CD :_

- Backend : `https://taskmanager-backend-xxxxx.a.run.app`
- Frontend : `https://taskmanager-frontend-xxxxx.a.run.app`
