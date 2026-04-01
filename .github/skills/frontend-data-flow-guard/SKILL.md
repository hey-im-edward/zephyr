---
name: frontend-data-flow-guard
description: 'Use when updating frontend forms, state management, API request/response mapping, auth session flow, cart flow, and server/client data boundaries in Next.js app router.'
argument-hint: 'Mô tả màn hình hoặc luồng dữ liệu frontend cần kiểm tra'
---

# Frontend Data Flow Guard

## Khi nào dùng
- Sửa form nhập liệu, validation schema, submit payload.
- Sửa Context/State cho auth, cart, account, checkout.
- Sửa mapping dữ liệu từ API ra UI.

## Mục tiêu
- Không mismatch giữa form schema, payload gửi đi, và response nhận về.
- Không làm vỡ trạng thái loading/error/success của người dùng.
- Giữ hành vi đồng nhất giữa server component và client component.

## Quy trình chuẩn
1. Xác định data flow hiện tại: input -> validate -> request -> response -> UI state.
2. Đối chiếu field-level mapping với `types.ts` và `api.ts`.
3. Kiểm tra enum/string constants dùng trong filter/sort/query.
4. Kiểm tra nhánh lỗi API, empty state, và retry behavior.
5. Kiểm tra token/session path cho các call cần xác thực.
6. Chạy typecheck và rà lỗi runtime tiềm ẩn.

## Checklist bắt buộc
- Form schema khớp payload 1-1.
- Không nuốt lỗi quan trọng.
- Không tạo side effects gây lệch state cross-tab.
- Các params query quan trọng (như sort/filter) khớp backend.

## File trọng tâm trong repo này
- `frontend/src/lib/types.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/components/auth-provider.tsx`
- `frontend/src/components/cart-provider.tsx`
- `frontend/src/app/**/page.tsx`

## Đầu ra kỳ vọng
- Danh sách mismatch đã sửa.
- Danh sách trạng thái UI đã kiểm tra.
- Rủi ro còn lại và đề xuất test tiếp theo.
