# Student Performance Prediction Tool

Full-stack application that forecasts student CGPA and dropout risk, stores student profiles, and visualizes insights for faculty/admins. The system is split into a React frontend, an Express API, and a FastAPI ML microservice, all packaged with Docker Compose.

## Features
- Predict CGPA and dropout risk using trained ML models (FastAPI + scikit-learn/XGBoost).
- Manage students and predictions through a React + Tailwind dashboard with charts (Recharts) and toasts (Sonner).
- Auth with JWT and Google OAuth; protects API routes and user data.
- MongoDB persistence via Mongoose, with server-side validation and JWT-secured endpoints.
- Containerized workflow for easy spin-up in local or cloud environments.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, React Router, Recharts, @react-oauth/google, Sonner.
- Backend API: Node.js, Express, Mongoose, JSON Web Tokens, bcryptjs, express-validator.
- ML service: FastAPI, scikit-learn, XGBoost, pandas, numpy, joblib.
- Infra: Docker Compose, MongoDB Atlas (provide your URI), Vite build args for environment wiring.

## Repository Layout
- `Students Performance Prediction Tool/frontend/` - React SPA with Tailwind, Google sign-in, charts.
- `Students Performance Prediction Tool/backend/` - Express API for auth, students, and prediction orchestration.
- `Students Performance Prediction Tool/ml-service/` - FastAPI service that hosts the ML models in `models/`.
- `Students Performance Prediction Tool/dataset/StudentData.csv` - sample dataset used to train/evaluate models.
- `Students Performance Prediction Tool/docker-compose.yml` - compose definitions for all services.

## Quick Start (Docker)
1) Prereqs: Docker Engine + Docker Compose, and a MongoDB Atlas connection string.  
2) Backend env: create `Students Performance Prediction Tool/backend/.env` with:
   - `MONGODB_URI=<your Atlas URI>`
   - `JWT_SECRET=<random string>`
   - `JWT_EXPIRATION=<e.g. 1d>`
   - `PORT=3000`
   - `NODE_ENV=development`
   - `FRONTEND_URL=http://localhost:4173`
   - `ML_SERVICE_URL=http://ml-service:8000` (compose overrides this internally)
3) Frontend env: set a Google OAuth client ID in `Students Performance Prediction Tool/frontend/.env` as `VITE_GOOGLE_CLIENT_ID=<your-client-id>` (compose passes it as a build arg).  
4) Start everything:
   ```powershell
   cd "Students Performance Prediction Tool"
   docker compose up --build
   ```

### Service URLs (after compose up)
- Frontend: http://localhost:4173
- Backend API: http://localhost:3000/api
- ML service: http://localhost:8000

## Useful Commands
- Rebuild after code changes: `docker compose build`
- Tail logs: `docker compose logs -f backend` (or `frontend`, `ml-service`)
- Stop everything: `docker compose down`

## Notes
- The frontend build arg `VITE_API_URL` is set in `docker-compose.yml` to `http://localhost:3000/api`; adjust if you change exposed ports.
- If you change the frontend port, also update `FRONTEND_URL` in the backend env to keep CORS aligned.
