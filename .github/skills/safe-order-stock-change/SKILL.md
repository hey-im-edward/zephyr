---
name: safe-order-stock-change
description: 'Use when modifying order creation, order status transitions, stock deduction/restock, and inventory consistency logic. Keywords: oversell prevention, transaction, locking, concurrent requests.'
argument-hint: 'Mô tả thay đổi order/stock bạn muốn thực hiện'
---

# Safe Order Stock Change

## Khi nào dùng
- Sửa logic tạo đơn hàng, cập nhật trạng thái đơn, trừ tồn kho, hoàn kho.
- Sửa entity/repository liên quan `orders`, `order_items`, `shoe_sizes`.

## Mục tiêu
- Không oversell.
- Không làm sai lệch tồn kho khi có request đồng thời.
- Giữ tính nhất quán dữ liệu dưới transaction.

## Quy trình chuẩn
1. Xác định transaction boundary cho toàn bộ luồng order/stock.
2. Chọn chiến lược đồng bộ phù hợp:
   - Optimistic locking (`@Version`) khi xung đột thấp.
   - Pessimistic locking khi cần chặn cạnh tranh trực tiếp.
3. Bảo toàn kiểm tra tồn kho trước khi trừ số lượng.
4. Đảm bảo idempotency cho thao tác chuyển trạng thái nhạy cảm.
5. Nếu có logic cancel/restore, kiểm tra đối xứng trừ-hoàn.
6. Bổ sung test concurrency tối thiểu cho case cạnh tranh.

## Checklist bắt buộc
- Có đường đi rõ ràng khi stock không đủ.
- Không có nhánh cập nhật stock ngoài transaction chính.
- Không sửa nhanh bằng cách bỏ check tồn kho.
- Có test regression cho bug inventory đã sửa.

## File trọng tâm trong repo này
- `backend/src/main/java/com/webbanpc/shoestore/order/**`
- `backend/src/main/java/com/webbanpc/shoestore/shoe/**`
- `backend/src/main/resources/db/migration/**`

## Đầu ra kỳ vọng
- Mô tả chiến lược an toàn đồng thời được áp dụng.
- Danh sách test đã thêm/cập nhật.
- Đánh giá rủi ro còn lại và phương án rollback ngắn.
