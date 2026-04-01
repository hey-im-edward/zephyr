---
name: hero-banner-art-direction
description: 'Use when designing or rebuilding hero sections for high-impact visual storytelling, campaign landing, ecommerce conversion, Figma-to-frontend handoff, and award-level UI direction. Keywords: hero banner, art direction, visual hierarchy, conversion zone, figma, frontend.'
argument-hint: 'Mô tả thông điệp campaign và đối tượng trang hero'
---

# Hero Banner Art Direction

## Khi nào dùng
- Thiết kế mới hoặc refactor hero cho trang home, catalog, campaign.
- Muốn nâng chất lượng thị giác theo hướng thi thiết kế.

## Mục tiêu
- Hero phải truyền tải thông điệp thương hiệu ngay lần nhìn đầu.
- Vừa đẹp vừa có khả năng chuyển đổi (CTA rõ, trust signals rõ).

## Framework bố cục 4 lớp
1. Narrative Layer: headline, subheadline, brand tone.
2. Focal Visual Layer: hình chủ đạo hoặc composition sản phẩm.
3. Conversion Layer: CTA chính, CTA phụ, value proposition ngắn.
4. Trust Layer: social proof, shipping, rating, guarantee.

## Quy trình chuẩn
1. Chốt một visual story duy nhất cho hero.
2. Xác định reading path theo thứ tự nhìn mắt: headline -> visual -> CTA -> trust.
3. Tạo grid responsive cho desktop/tablet/mobile.
4. Tạo biến thể cho 3 trạng thái: default, hover/interactive, reduced-motion.
5. Kiểm tra contrast và độ đọc trên overlay/gradient.
6. Kiểm tra conversion clarity (CTA không bị chìm).

## Thư viện và kỹ thuật gợi ý
- Layout + component: Tailwind CSS + CVA.
- Motion: `framer-motion` cho reveal/entrance nhẹ.
- Fine control timeline: `gsap` khi cần animation phức tạp.
- Image optimization: `next/image` với `sizes` rõ ràng.

## Checklist trước khi hoàn tất
- Hero có một focal point rõ ràng.
- Typography không bị vỡ nhịp trên mobile.
- CTA chính nhìn thấy ngay không cần cuộn.
- Tải trang vẫn mượt, không làm LCP tăng đột biến.

## Đầu ra kỳ vọng
- Hero mới có concept rõ ràng + code triển khai.
- Danh sách quyết định visual (font, màu, motion, CTA).
- Ghi chú rủi ro hiệu năng và cách giảm thiểu.
