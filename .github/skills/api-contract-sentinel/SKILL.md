---
name: api-contract-sentinel
description: 'Use when changing backend API controllers/DTOs or frontend API types/clients in this Spring Boot + Next.js monorepo. Keywords: contract sync, schema mismatch, enum mismatch, query params, sort params.'
argument-hint: 'Mô tả endpoint hoặc luồng API cần đồng bộ'
---

# API Contract Sentinel

## Khi nào dùng
- Thêm/sửa endpoint backend.
- Đổi request/response DTO hoặc enum.
- Đổi tham số query như `sort`, `page`, `pageSize`, filter.
- Sửa `frontend/src/lib/types.ts` hoặc `frontend/src/lib/api.ts`.

## Mục tiêu
- Đồng bộ hợp đồng API giữa backend và frontend trong cùng một change set.
- Tránh lỗi runtime do lệch kiểu dữ liệu hoặc lệch giá trị enum/query.

## Quy trình chuẩn
1. Xác định endpoint bị ảnh hưởng và phạm vi domain.
2. Đối chiếu request/response thực tế ở backend với type ở frontend.
3. Cập nhật đồng thời các điểm sau:
   - DTO/backend mapping.
   - TypeScript types.
   - API client call + tham số query.
4. Kiểm tra đặc biệt các giá trị cố định:
   - Enum string.
   - Sort values.
   - Filter keys.
5. Cập nhật test hoặc ít nhất thêm regression case cho điểm lệch vừa sửa.
6. Chạy xác nhận:
   - Backend build/test.
   - Frontend typecheck/build.

## Checklist bắt buộc trước khi hoàn tất
- Không còn chỗ nào dùng schema cũ.
- Frontend parse lỗi API vẫn hoạt động.
- Query params ở frontend và backend khớp 1-1.
- Không thay đổi contract ngầm mà không ghi rõ trong PR summary.

## File trọng tâm trong repo này
- `backend/src/main/java/com/webbanpc/shoestore/**`
- `frontend/src/lib/types.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/app/**/page.tsx`

## Đầu ra kỳ vọng
- Danh sách file đã đồng bộ contract.
- Các mismatch đã phát hiện và cách sửa.
- Rủi ro còn lại (nếu có) và khuyến nghị test.
