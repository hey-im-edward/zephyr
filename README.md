# ZEPHYR Monorepo

Modern shoe-store workspace built around the ZEPHYR storefront and operations stack.

## Structure

- `backend/`: Spring Boot 3.5.12 API, Java 21, MySQL, Flyway
- `frontend/`: Next.js 16.2.1 storefront, React 19.2.4, TypeScript, Tailwind CSS 4
- `docker-compose.yml`: optional local MySQL service for development

## Local workflow

1. Start MySQL with Docker if you do not already have a local MySQL server:

```bash
docker compose up -d mysql
```

2. Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## Current status

- Frontend lint and production build were verified successfully.
- Backend build and test were verified on Java 21 against local MySQL Docker.
