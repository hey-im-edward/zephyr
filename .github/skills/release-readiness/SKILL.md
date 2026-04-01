---
name: release-readiness
description: 'Use before release or major merge to verify quality gates, risk notes, rollback readiness, migration safety, and production confidence. Keywords: go/no-go, release checklist, rollback plan.'
argument-hint: 'Mô tả phạm vi release cần đánh giá'
---

# Release Readiness

## Khi nào dùng
- Trước khi merge nhánh lớn vào main.
- Trước khi phát hành staging/production.
- Sau một chuỗi thay đổi có rủi ro trung bình/cao.

## Mục tiêu
- Đưa ra quyết định go/no-go dựa trên bằng chứng.
- Giảm xác suất sự cố sau phát hành.
- Đảm bảo rollback khả thi khi cần.

## Quy trình chuẩn
1. Tổng hợp phạm vi thay đổi và mức rủi ro.
2. Kiểm tra chất lượng bắt buộc: lint, typecheck, build, test.
3. Kiểm tra security baseline và dependency risk.
4. Kiểm tra DB migration impact và backward compatibility.
5. Xác nhận smoke checklist sau deploy.
6. Chuẩn bị rollback note ngắn, rõ, có thể thực thi.
7. Kết luận go/no-go kèm lý do.

## Checklist bắt buộc
- Không release nếu thiếu test evidence cho phần rủi ro cao.
- Không release nếu thiếu secret/env bắt buộc.
- Không release nếu deploy workflow đang ở trạng thái placeholder.
- Release note phải ghi rõ tác động người dùng và kế hoạch fallback.

## File trọng tâm trong repo này
- `.github/workflows/**`
- `backend/src/main/resources/application.properties`
- `backend/src/main/resources/db/migration/**`
- `frontend/src/**`

## Đầu ra kỳ vọng
- Báo cáo go/no-go ngắn gọn.
- Danh sách blocker và mức độ nghiêm trọng.
- Rollback approach theo phạm vi thay đổi.
