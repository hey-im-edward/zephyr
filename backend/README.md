# Backend

API REST Spring Boot 3.5.12 cho hệ thống bán giày.

## Stack

- Java 21
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Flyway
- MySQL

## Chạy ứng dụng

```bash
./mvnw spring-boot:run
```

## Biến môi trường

Sao chép giá trị từ `.env.example` vào shell hoặc file môi trường cục bộ:

- `SPRING_DATASOURCE_URL`: chuỗi kết nối MySQL.
- `SPRING_DATASOURCE_USERNAME`: tài khoản truy cập MySQL.
- `SPRING_DATASOURCE_PASSWORD`: mật khẩu MySQL.
- `APP_ADMIN_USERNAME`: email hoặc username bootstrap cho admin.
- `APP_ADMIN_PASSWORD`: mật khẩu mạnh cho bootstrap admin.
- `APP_JWT_SECRET`: secret ký access token JWT, tối thiểu 32 ký tự.
- `APP_CORS_ALLOWED_ORIGINS`: danh sách origin frontend được phép gọi API.
- `APP_AUTH_REFRESH_COOKIE_NAME`: tên cookie chứa refresh token.
- `APP_AUTH_REFRESH_COOKIE_PATH`: path áp dụng cho refresh cookie, mặc định `/api/v1/auth`.
- `APP_AUTH_REFRESH_COOKIE_SECURE`: đặt `true` khi chạy HTTPS thật để cookie chỉ đi qua kết nối bảo mật.
- `APP_AUTH_REFRESH_COOKIE_SAME_SITE`: chính sách `SameSite` cho refresh cookie, mặc định `Lax`.
- `APP_AUTH_REFRESH_COOKIE_DOMAIN`: domain của refresh cookie nếu cần chia sẻ cookie giữa các subdomain tin cậy.

## Ghi chú xác thực

- Refresh token được trả qua `HttpOnly cookie`; frontend không còn cần lưu refresh token trong `localStorage`.
- Access token vẫn đi qua `Authorization: Bearer <token>` cho các API cần xác thực.
- Nếu frontend và backend khác origin, frontend phải gửi request với `credentials: "include"` và backend phải giữ allowlist origin chặt chẽ.
