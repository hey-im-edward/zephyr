---
name: security-hardening-assistant
description: 'Use when changing authentication, authorization, endpoint exposure, CORS, JWT, secret management, or security config in Spring Boot backend and frontend auth flows.'
argument-hint: 'Nêu khu vực security bạn muốn harden'
---

# Security Hardening Assistant

## Khi nào dùng
- Sửa `SecurityConfig`, JWT filter/service, auth endpoints.
- Thêm endpoint mới có thể ảnh hưởng quyền truy cập.
- Sửa CORS, token handling, hoặc cấu hình môi trường nhạy cảm.

## Mục tiêu
- Bảo vệ endpoint theo nguyên tắc allowlist rõ ràng.
- Không mở quyền ngoài ý muốn.
- Không để fallback secret nguy hiểm đi vào staging/production.

## Quy trình chuẩn
1. Phân loại endpoint: public, authenticated user, admin.
2. Rà quyền truy cập ở filter chain và method-level security.
3. Kiểm tra token lifecycle: issue, refresh, revoke.
4. Kiểm tra cấu hình CORS theo môi trường.
5. Kiểm tra biến môi trường nhạy cảm và cơ chế fail-safe khi thiếu secret.
6. Bổ sung test/validation cho đường đi auth quan trọng.

## Checklist bắt buộc
- Endpoint mới không được mặc định public nếu chưa đánh giá.
- Không dùng secret mặc định cho môi trường production-like.
- Không tắt security để cho test pass.
- Thay đổi auth phải có risk note rõ trong PR.

## File trọng tâm trong repo này
- `backend/src/main/java/com/webbanpc/shoestore/config/**`
- `backend/src/main/java/com/webbanpc/shoestore/auth/**`
- `backend/src/main/resources/application.properties`
- `frontend/src/components/auth-provider.tsx`
- `frontend/src/lib/api.ts`

## Đầu ra kỳ vọng
- Bảng endpoint access matrix trước/sau thay đổi.
- Danh sách hardening đã áp dụng.
- Các giả định và khoảng trống cần review thủ công.
