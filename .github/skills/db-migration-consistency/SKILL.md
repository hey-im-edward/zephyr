---
name: db-migration-consistency
description: 'Use when creating or updating Flyway migrations, JPA entities, repositories, and SQL queries. Keywords: schema consistency, migration safety, index strategy, backward compatibility.'
argument-hint: 'Mô tả migration hoặc thay đổi schema cần thực hiện'
---

# DB Migration Consistency

## Khi nào dùng
- Thêm migration mới trong `db/migration`.
- Đổi schema ảnh hưởng entity/repository/query.
- Tối ưu index hoặc ràng buộc dữ liệu.

## Mục tiêu
- Migrate an toàn, không phá dữ liệu hiện có.
- Đồng bộ schema, entity và query usage.
- Dễ rollback hoặc giảm rủi ro khi deploy.

## Quy trình chuẩn
1. Xác định impact map: bảng, cột, FK, index, query path bị ảnh hưởng.
2. Thiết kế migration theo hướng tương thích tiến (forward-compatible) trước khi cleanup.
3. Đồng bộ code:
   - Entity fields và constraints.
   - Repository query.
   - Service mapping.
4. Rà performance:
   - Index cho cột filter/join/order.
   - Tránh full scan ở query nóng.
5. Kiểm tra dữ liệu cũ có đi qua migration an toàn.
6. Thêm validation test tối thiểu cho luồng chính bị ảnh hưởng.

## Checklist bắt buộc
- Tên migration rõ ràng, version đúng thứ tự.
- Không drop nguy hiểm trong cùng đợt khi app chưa ngừng dùng.
- DDL thay đổi nhạy cảm phải có risk note.
- Có ghi rõ giả định dữ liệu legacy.

## File trọng tâm trong repo này
- `backend/src/main/resources/db/migration/**`
- `backend/src/main/java/com/webbanpc/shoestore/**`

## Đầu ra kỳ vọng
- Danh sách thay đổi schema + code sync tương ứng.
- Các điểm rủi ro dữ liệu/hiệu năng.
- Kế hoạch rollback hoặc mitigation ngắn.
