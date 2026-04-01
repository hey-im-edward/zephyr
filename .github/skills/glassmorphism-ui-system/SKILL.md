---
name: glassmorphism-ui-system
description: 'Use when implementing frosted glass interfaces, translucent surfaces, layered depth, Figma glass tokens, and premium frontend UI shells. Keywords: glassmorphism, frosted card, blurred backdrop, glass UI tokens, figma, frontend.'
argument-hint: 'Mô tả màn hình hoặc component cần áp dụng glassmorphism'
---

# Glassmorphism UI System

## Khi nào dùng
- Thiết kế surface/card/panel theo phong cách kính mờ cao cấp.
- Chuẩn hóa token để dùng glass nhất quán toàn site.

## Mục tiêu
- Tạo chiều sâu thị giác bằng hệ surface nhiều lớp.
- Tránh hiệu ứng "kính giả" gây rối và giảm khả năng đọc.

## Token gợi ý
- `--glass-bg`: nền trong suốt có alpha thấp.
- `--glass-border`: viền sáng alpha thấp.
- `--glass-shadow`: shadow mềm đa lớp.
- `--glass-blur`: mức blur chuẩn theo thành phần.
- `--glass-highlight`: ánh sáng viền/phản xạ.

## Quy trình chuẩn
1. Thiết kế base palette trước khi thêm blur.
2. Dùng tối đa 3 cấp surface (base, elevated, hero).
3. Áp dụng `backdrop-filter` có fallback khi không hỗ trợ.
4. Tách text layer và glass layer để đảm bảo readability.
5. Kiểm tra contrast trên nhiều nền ảnh.
6. Kiểm tra performance khi nhiều panel kính cùng lúc.

## Thư viện và kỹ thuật gợi ý
- Utility/style: Tailwind CSS variables + custom utility classes.
- Variant management: `class-variance-authority`.
- Merge class an toàn: `tailwind-merge`, `clsx`.
- Optional shader overlay nâng cao: `@react-three/fiber` (chỉ dùng khi cần và có kiểm soát hiệu năng).

## Checklist trước khi hoàn tất
- Text qua panel kính vẫn dễ đọc ở mọi viewport.
- Không lạm dụng blur cho toàn bộ giao diện.
- Surface hierarchy rõ, không bị phẳng hoặc rối.
- Có fallback cho trình duyệt thiếu `backdrop-filter`.

## Đầu ra kỳ vọng
- Bộ class/token glass tái sử dụng được.
- Component áp dụng glass có style thống nhất.
- Ghi chú performance + accessibility cho hiệu ứng đã dùng.
