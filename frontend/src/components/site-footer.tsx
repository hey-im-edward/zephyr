"use client";

import Link from "next/link";
import { ArrowUpRight, HeartPulse, Package, Sparkles } from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[rgba(3,4,10,0.94)]">
      <div className="section-shell py-14">
        <div className="page-frame grid gap-10 xl:grid-cols-[1.35fr_0.9fr_0.9fr]">
          <div className="space-y-5">
            <BrandMark showTagline />
            <p className="max-w-xl text-sm leading-7 text-[var(--muted-strong)]">
              ZEPHYR tuyển chọn những đôi giày có nhịp dáng đẹp, cảm giác mang êm và đủ cá tính để ở lại lâu trong tủ
              đồ. Mỗi bề mặt, nhịp chữ và chuyển động đều được làm để việc mua sắm trở nên tinh gọn nhưng vẫn đáng nhớ.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Kính mờ cao cấp</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tồn kho theo size</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Luồng đơn rõ ràng</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
              Trải nghiệm
            </div>
            <div className="space-y-3 text-sm text-[var(--muted-strong)]">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 text-[var(--brand-gold)]" />
                <span>Bộ sưu tập được tuyển chọn cho phong cách sống, sân court, đường trail và chạy bộ.</span>
              </div>
              <div className="flex items-start gap-3">
                <HeartPulse className="mt-0.5 text-[var(--brand-gold)]" />
                <span>Nhịp mua hàng gọn, dễ hiểu và đủ tinh tế cho một thương hiệu cao cấp.</span>
              </div>
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 text-[var(--brand-gold)]" />
                <span>Tồn kho theo size và lịch sử đơn hàng luôn rõ ràng trong tài khoản.</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
              Hành trình
            </div>
            <div className="space-y-3 text-sm text-[var(--muted-strong)]">
              <Link
                href="/catalog"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/22 hover:bg-white/8"
              >
                <span>Mở bộ sưu tập</span>
                <ArrowUpRight />
              </Link>
              <Link
                href="/dang-ky"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/22 hover:bg-white/8"
              >
                <span>Tạo tài khoản ZEPHYR</span>
                <ArrowUpRight />
              </Link>
              <Link
                href="/checkout"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/22 hover:bg-white/8"
              >
                <span>Đi thẳng tới thanh toán</span>
                <ArrowUpRight />
              </Link>
            </div>
          </div>
        </div>

        <div className="page-frame">
          <div className="soft-divider mt-10" />

          <div className="mt-5 flex flex-col gap-2 text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)] md:flex-row md:items-center md:justify-between">
            <span>ZEPHYR atelier</span>
            <span className="font-display italic text-[0.95rem] normal-case tracking-[0.12em] text-white/75">
              The art of walking well.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
