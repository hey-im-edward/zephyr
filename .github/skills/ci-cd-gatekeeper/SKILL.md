---
name: ci-cd-gatekeeper
description: 'Use when modifying GitHub Actions workflows, quality gates, branch protections, deploy checks, and release automation. Keywords: fail-fast, pipeline quality, no false green, deployment safety.'
argument-hint: 'Nêu workflow hoặc gate CI/CD bạn muốn chỉnh'
---

# CI CD Gatekeeper

## Khi nào dùng
- Sửa workflow build/test/lint/typecheck.
- Sửa workflow deploy preview/staging/production.
- Thêm hoặc siết quality gate trước merge.

## Mục tiêu
- Pipeline phản ánh đúng chất lượng thật.
- Không có trạng thái "xanh giả" khi điều kiện deploy chưa đầy đủ.
- Bảo vệ nhánh chính bằng gate tự động.

## Quy trình chuẩn
1. Xác định gate bắt buộc theo mức rủi ro thay đổi.
2. Kiểm tra thứ tự pipeline: setup -> verify -> build -> test -> artifact -> deploy.
3. Với deploy workflow, bật fail-fast khi thiếu biến bắt buộc.
4. Kiểm tra timeout, concurrency group, path filters.
5. Đảm bảo kết quả thất bại được hiển thị rõ lý do.
6. Đảm bảo PR không thể merge khi gate quan trọng chưa pass.

## Checklist bắt buộc
- Không dùng placeholder success cho deploy thật.
- Build/test của backend và frontend phải độc lập và có thể tái chạy.
- Có bước smoke check tối thiểu sau deploy.
- Các secret/env bắt buộc được validate sớm.

## File trọng tâm trong repo này
- `.github/workflows/*.yml`
- `backend/pom.xml`
- `frontend/package.json`

## Đầu ra kỳ vọng
- Danh sách gate đã thêm/siết.
- Danh sách luồng fail-fast đã thiết lập.
- Cách kiểm chứng pipeline sau thay đổi.
