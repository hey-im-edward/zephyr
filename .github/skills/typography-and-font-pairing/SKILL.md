---
name: typography-and-font-pairing
description: 'Use when selecting and implementing font systems, type scale, heading/body pairing, Figma type-style mapping, and visual rhythm for premium frontend interfaces. Keywords: typography, font pairing, variable font, readability, brand voice, figma, frontend.'
argument-hint: 'Mô tả tone thương hiệu và trang cần chuẩn hóa typography'
---

# Typography And Font Pairing

## Khi nào dùng
- Thiết kế mới hoặc refactor hệ chữ toàn trang.
- Cần tăng chất lượng đọc và cá tính thương hiệu.

## Mục tiêu
- Thiết lập hệ chữ có nhịp điệu rõ ràng, dễ đọc, có bản sắc.
- Tránh dùng font ngẫu nhiên hoặc thiếu nhất quán giữa trang.

## Bộ font gợi ý cho web cao cấp
- Sans chính: `Manrope`, `Plus Jakarta Sans`, `Sora`, `Outfit`, `Space Grotesk`.
- Display accent: `Syne`, `Clash Display` (kiểm tra license trước khi dùng), `Instrument Serif` cho editorial touch.
- Fallback chain phải rõ ràng để tránh nhảy layout.

## Quy trình chuẩn
1. Chốt voice: technical, fashion, editorial, hoặc energetic.
2. Chọn tối đa 2 họ font chính + 1 accent (nếu cần).
3. Thiết kế type scale cho display/h1/h2/body/caption.
4. Thiết kế line-height và spacing theo viewport.
5. Kiểm tra readability trên nền glass/gradient.
6. Tối ưu tải font (subset, preload hợp lý, tránh block rendering).

## Kỹ thuật triển khai khuyến nghị
- Ưu tiên `next/font/google` hoặc `next/font/local`.
- Dùng CSS variables để đổi font theo context.
- Dùng font weight có chủ đích; tránh weight quá mảnh ở phần nội dung dài.

## Checklist trước khi hoàn tất
- Heading hierarchy rõ và nhất quán.
- Body text dễ đọc ở mobile.
- Không có FOIT/FOUT gây trải nghiệm xấu.
- Font license và quyền sử dụng được kiểm tra.

## Đầu ra kỳ vọng
- Cặp font được chọn + lý do.
- Type scale và tokens typography có thể tái sử dụng.
- Danh sách điểm cần theo dõi sau triển khai.
