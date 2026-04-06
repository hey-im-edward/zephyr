# ZEPHYR Monorepo

Workspace cho storefront và hệ vận hành của ZEPHYR.

## Cấu trúc chính

- `backend/`: API Spring Boot 3.5.12, Java 21, MySQL, Flyway.
- `frontend/`: storefront Next.js 16.2.1, React 19.2.4, TypeScript, Tailwind CSS 4.
- `docker-compose.yml`: dịch vụ MySQL cục bộ phục vụ phát triển và kiểm thử.

## Quy trình chạy cục bộ

1. Khởi động MySQL nếu máy chưa có instance cục bộ:

```bash
docker compose up -d mysql
```

2. Chạy backend:

```bash
cd backend
./mvnw spring-boot:run
```

3. Chạy frontend:

```bash
cd frontend
npm install
npm run dev
```

## Ghi chú xác thực

- `refresh token` được backend phát qua `HttpOnly cookie`; frontend không còn lưu token xác thực trong `localStorage`.
- `access token` được giữ ngắn hạn trong memory và tiếp tục đi qua header `Authorization: Bearer <token>` cho các API cần xác thực.
- Nếu frontend và backend chạy khác origin, request xác thực phải gửi kèm `credentials: "include"` và backend chỉ được allowlist đúng origin tin cậy.

## Trạng thái xác minh gần nhất

- Frontend: `npm run lint`, `npm run typecheck`, `npm run test:e2e` đều pass.
- Backend: `.\mvnw.cmd test` pass trên Java 21 và MySQL cục bộ.
