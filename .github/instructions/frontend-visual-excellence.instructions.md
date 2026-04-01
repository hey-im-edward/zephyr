---
description: "Use when building or editing frontend pages/components for premium visual design, hero banners, glassmorphism, liquid glass, typography systems, and motion design in this project."
name: "Frontend Visual Excellence"
applyTo: "frontend/src/**/*.{ts,tsx,css}"
---

# Frontend Visual Excellence

## Mục tiêu
- Giao diện phải có chủ đích thị giác rõ ràng, không dùng bố cục boilerplate.
- Hero banner phải có tính kể chuyện, không chỉ là ảnh nền + tiêu đề.
- Mỗi thay đổi UI phải cân bằng giữa thẩm mỹ, hiệu năng và khả năng sử dụng.

## Hero Banner Standard
- Hero phải có 4 lớp: narrative headline, visual anchor, conversion zone, trust/supporting signal.
- Luôn có một CTA chính và tối đa một CTA phụ.
- Nội dung chính phải đọc được trong 3-5 giây ở màn hình desktop và mobile.
- Không dùng nhiều hơn một visual focal point trong cùng hero frame.

## Glassmorphism Rules
- Ưu tiên lớp nền theo chiều sâu: base surface, frosted layer, highlight edge, shadow layer.
- Dùng `backdrop-filter` có kiểm soát; phải có fallback khi trình duyệt không hỗ trợ.
- Viền kính dùng alpha thấp, tránh viền đậm gây cảm giác nhựa.
- Tránh lạm dụng blur làm giảm độ tương phản chữ.

## Liquid Glass Rules
- Hiệu ứng phải mô phỏng chuyển động chất lỏng nhẹ, không gây rối mắt.
- Dùng motion theo mục đích: reveal, focus shift, hover feedback.
- Bắt buộc hỗ trợ `prefers-reduced-motion`.
- Không áp dụng liquid effect trên mọi thành phần; ưu tiên hero, card nhấn mạnh, hoặc CTA zone.

## Typography Rules
- Mỗi trang dùng tối đa 2 họ font chính + 1 font accent nếu cần.
- Thiết lập scale kiểu chữ có hệ thống (display, heading, body, caption).
- Tránh dùng weight quá mảnh cho chữ trên nền có blur/gradient.
- Đảm bảo line-height và letter-spacing nhất quán giữa desktop/mobile.

## Thư viện và công cụ khuyến nghị
- Motion: `framer-motion`, `gsap`, `@motionone/react`.
- Smooth scrolling/kinetic feel: `@studio-freight/lenis`.
- Class/variant system: `class-variance-authority`, `tailwind-merge`, `clsx`.
- Icon system: `@phosphor-icons/react`.
- Fonts: Google Fonts (`Manrope`, `Plus Jakarta Sans`, `Sora`, `Space Grotesk`, `Outfit`), hoặc Fontshare nếu kiểm tra license phù hợp.

## Performance and Accessibility
- Ưu tiên animation transform/opacity; hạn chế animate layout liên tục.
- Ảnh hero cần tối ưu kích thước, đặt `sizes` phù hợp, không đẩy LCP vượt ngưỡng.
- Bảo đảm tương phản văn bản đủ đọc trên lớp kính.
- Tất cả thao tác hover phải có trạng thái focus/keyboard tương đương.

## Definition of Done cho UI thay đổi
- Layout đẹp và nhất quán trên desktop/mobile.
- Có chủ đề thị giác rõ ràng, không trùng lặp phong cách ngẫu nhiên.
- Không phá vỡ trải nghiệm hiện có và không làm giảm hiệu năng rõ rệt.
