---
name: liquid-glass-motion-effects
description: 'Use when creating liquid-glass visual effects, fluid transitions, kinetic highlights, Figma prototype-like motion, and modern interactive motion systems for premium frontend experiences. Keywords: liquid glass, fluid motion, cinematic UI, interaction effects, figma, frontend.'
argument-hint: 'Mô tả section hoặc component cần liquid-glass motion'
---

# Liquid Glass Motion Effects

## Khi nào dùng
- Cần hiệu ứng chuyển động tinh tế kiểu liquid glass cho hero/card/CTA.
- Cần tạo cảm giác cao cấp, hiện đại, có chiều sâu động.

## Mục tiêu
- Motion mang tính kể chuyện và điều hướng chú ý, không trang trí vô nghĩa.
- Hiệu ứng mượt, có kiểm soát, không hy sinh khả năng dùng.

## Nguyên tắc motion
- Dùng motion theo mục tiêu: reveal, focus, feedback, transition.
- Dùng easing mềm, tránh chuyển động giật hoặc lặp dư thừa.
- Ưu tiên transform/opacity; hạn chế repaint nặng.
- Luôn hỗ trợ `prefers-reduced-motion`.

## Quy trình chuẩn
1. Xác định motion map theo từng thành phần UI.
2. Chọn layer cần liquid behavior (highlight band, shimmer, refractive edge).
3. Tạo biến thể animation cho desktop/mobile.
4. Kiểm tra FPS và thời gian tương tác thực tế.
5. Giảm mật độ motion nếu ảnh hưởng readability hoặc conversion.

## Thư viện và kỹ thuật gợi ý
- Orchestration chính: `framer-motion`.
- Timeline nâng cao và physics: `gsap`.
- Scroll kinetics: `@studio-freight/lenis`.
- Shader/gradient dynamics nhẹ: CSS keyframes + mask/gradient layering.
- Nâng cao (có kiểm soát): `@react-three/fiber` + postprocessing cho scene đặc biệt.

## Checklist trước khi hoàn tất
- Có chế độ giảm chuyển động và không phá layout.
- CTA không bị che hoặc mất ưu tiên vì hiệu ứng.
- Không tạo jank khi cuộn hoặc hover liên tục.
- Motion duration nhất quán theo design system.

## Đầu ra kỳ vọng
- Bộ motion variants dùng lại được theo component type.
- Tài liệu ngắn về mapping hiệu ứng -> mục tiêu UX.
- Danh sách điểm cần theo dõi hiệu năng sau khi tích hợp.
