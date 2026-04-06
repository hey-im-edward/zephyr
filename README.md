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
- Frontend đồng bộ trạng thái đăng nhập giữa các tab bằng cơ chế sync event, nên thao tác đăng nhập, đăng xuất, đổi mật khẩu và cập nhật hồ sơ sẽ phản ánh nhất quán hơn trên cùng trình duyệt.

## Ghi chú giỏ hàng

- Giỏ hàng khách vãng lai được lưu riêng với giỏ hàng của từng tài khoản đã đăng nhập; không còn dùng chung một `localStorage key` cho mọi phiên.
- Khi khách đăng nhập, giỏ hàng guest hiện tại sẽ được hợp nhất vào giỏ hàng của chính tài khoản đó thay vì ghi đè hoặc rò rỉ sang người dùng khác.

## Ghi chú release và deploy

- Ba workflow `deploy-preview`, `deploy-staging`, `deploy-production` hiện đều fail-fast khi thiếu biến deploy bắt buộc và đều có smoke check sau deploy.
- Workflow production chỉ cho phép chạy từ `refs/heads/main` để giảm rủi ro phát hành nhầm nhánh.
- Smoke check hiện xác minh đồng thời storefront HTML và API `/api/v1/home`. Cách này phù hợp khi storefront và backend được publish cùng một origin.
- Nếu kiến trúc deploy tách frontend và backend sang domain khác nhau, cần bổ sung biến URL smoke riêng cho backend trước khi coi pipeline production là hoàn chỉnh.

## Trạng thái xác minh gần nhất

- Frontend: `npm run lint`, `npm run typecheck`, `npm run test:e2e` đều pass.
- Backend: `.\mvnw.cmd test` pass trên Java 21 và MySQL cục bộ.
