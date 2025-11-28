# Containerized setup

Run the full stack (frontend, backend, ML service) with Docker; MongoDB is expected to be MongoDB Atlas (provide the URI via env).

## Prerequisites
- Docker Engine + Docker Compose
- Fill `backend/.env` with your MongoDB Atlas URI and JWT secret (compose reads this file).

## One-command start
```powershell
cd "Students Performance Prediction Tool"
docker compose up --build
```

### Service URLs
- Frontend: http://localhost:4173
- Backend API: http://localhost:3000/api
- ML service: http://localhost:8000

## Environment notes
- Backend env comes from `backend/.env`; include `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `NODE_ENV`, `FRONTEND_URL`, and `ML_SERVICE_URL`.
- Compose also overrides `ML_SERVICE_URL` and `FRONTEND_URL` to point to internal service names/ports.
- FRONTEND_URL in compose is `http://localhost:4173`; adjust if you change the exposed port.
- VITE_API_URL build arg in compose points the frontend at the backend’s exposed URL.

## Useful commands
- Rebuild after code changes: `docker compose build`
- Tail logs: `docker compose logs -f backend` (or `frontend`, `ml-service`, `mongo`)
- Stop everything: `docker compose down`
Faltu commit
