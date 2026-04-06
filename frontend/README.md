# ZEPHYR Frontend

Storefront Next.js 16 cho trải nghiệm ZEPHYR.

## Stack

- Next.js 16.2.1
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4

## Chạy cục bộ

```bash
npm install
npm run dev
```

## Ghi chú cấu hình

- Đặt `NEXT_PUBLIC_API_BASE_URL` nếu API không chạy ở `http://localhost:8080/api/v1`.
- Luồng đăng nhập mới dựa trên `HttpOnly refresh cookie`, nên các request auth từ frontend phải gửi `credentials: "include"`.
- Frontend chỉ giữ `access token` trong memory cho phiên tab hiện tại; khi tải lại trang, `AuthProvider` sẽ tự bootstrap lại session qua `POST /auth/refresh`.
