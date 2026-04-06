"use client";

import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";

const footerLinks = [
  { href: "/catalog", label: "Bộ sưu tập" },
  { href: "/tai-khoan", label: "Tài khoản" },
  { href: "/checkout", label: "Thanh toán" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="section-shell py-12 max-[420px]:py-8 md:py-16">
        <div className="page-frame">
          <div className="surface-glass rounded-[2.8rem] px-6 py-8 max-[420px]:rounded-[1.6rem] max-[420px]:px-4 max-[420px]:py-6 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="space-y-4">
                <BrandMark showTagline />
                <div className="max-w-md">
                  <div className="font-display text-[1.7rem] font-extrabold tracking-[-0.04em] text-[var(--foreground-hero)] max-[420px]:text-[1.25rem] max-[260px]:text-[1.05rem]">
                    Transparent overlays, editorial product focus, clear commerce.
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)] max-[420px]:text-xs max-[420px]:leading-6">
                    ZEPHYR dùng transparent glass như một lớp dẫn mắt: nâng scene, giữ product focus và mở đường cho quyết định mua rõ ràng hơn.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:justify-self-end lg:min-w-[34rem]">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="glass-panel flex items-center justify-between rounded-[1.5rem] px-4 py-3 text-sm text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-white max-[420px]:rounded-[1rem] max-[420px]:px-3 max-[420px]:py-2.5 max-[420px]:text-xs"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-dim)] max-[420px]:mt-6 max-[420px]:pt-4 max-[420px]:tracking-[0.16em] md:flex-row md:items-center md:justify-between">
              <span>ZEPHYR</span>
              <span className="max-[260px]:hidden">Transparent glass commerce for every move.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
