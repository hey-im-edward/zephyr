---
name: bugfix-from-logs
description: 'Use when debugging runtime issues from logs, stack traces, CI failures, or production-like errors. Keywords: root cause analysis, regression fix, minimal patch, validation loop.'
argument-hint: 'Dán lỗi hoặc mô tả log cần xử lý'
---

# Bugfix From Logs

## Khi nào dùng
- Có stacktrace ở backend/frontend.
- Lỗi xảy ra trên CI hoặc runtime nhưng chưa rõ nguyên nhân.
- Cần sửa nhanh theo hướng tối thiểu rủi ro.

## Mục tiêu
- Tìm đúng root cause thay vì sửa triệu chứng.
- Tạo patch nhỏ nhất để khôi phục hành vi đúng.
- Thêm kiểm chứng tránh tái phát.

## Quy trình chuẩn
1. Chuẩn hóa lỗi đầu vào: symptom, thời điểm, môi trường, bước tái hiện.
2. Xác định điểm nổ đầu tiên trong stacktrace.
3. Truy ngược data flow tới nguyên nhân gốc.
4. Đề xuất 1-2 hướng fix, chọn hướng rủi ro thấp nhất.
5. Áp dụng patch nhỏ, không refactor lan rộng.
6. Chạy lại kiểm chứng để xác nhận lỗi đã đóng.
7. Nếu feasible, thêm regression test.

## Checklist bắt buộc
- Không đóng bug khi chưa tái hiện được hoặc chưa xác nhận hết lỗi.
- Không sửa bằng cách tắt check bảo vệ.
- Ghi rõ giả định nếu thiếu dữ liệu log.
- Báo cáo residual risk nếu còn góc chưa kiểm chứng.

## File trọng tâm trong repo này
- `backend-runtime.log`
- `backend-runtime.err.log`
- `frontend-runtime.log`
- `frontend-runtime.err.log`
- `backend/src/main/java/**`
- `frontend/src/**`

## Đầu ra kỳ vọng
- Root cause cụ thể.
- Patch tối thiểu và lý do chọn.
- Kết quả kiểm chứng sau fix.
