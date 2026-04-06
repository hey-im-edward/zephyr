"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  ShoppingBag,
  LogIn,
  LogOut,
  LayoutGrid,
  CircleUserRound,
} from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Trang chủ", icon: House },
  { href: "/catalog", label: "Bộ sưu tập", icon: LayoutGrid },
  { href: "/checkout", label: "Thanh toán", icon: ShoppingBag },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logoutAction } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      <div className="page-shell pt-4 max-[420px]:pt-1.5 max-[319px]:pt-1">
        <div className="page-frame">
          <div className="surface-panel overflow-hidden rounded-[2.6rem] px-4 py-4 max-[420px]:rounded-[1.25rem] max-[420px]:px-2 max-[420px]:py-1.5 max-[319px]:px-1.5 max-[319px]:py-1 lg:px-6">
            <div className="flex flex-col gap-4 max-[420px]:grid max-[420px]:grid-cols-[1fr_auto] max-[420px]:items-center max-[420px]:gap-x-2 max-[420px]:gap-y-1.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-3 max-[260px]:gap-1.5">
                <Link
                  href="/"
                  className="glass-panel min-w-0 rounded-full px-3 py-2 transition hover:border-white max-[420px]:px-2 max-[420px]:py-1"
                >
                  <BrandMark showTagline compact />
                </Link>

                <div className="flex items-center gap-1 sm:hidden">
                  <Button asChild variant="secondary" size="sm" className="hidden max-[319px]:inline-flex">
                    <Link href="/catalog" aria-label="Bộ sưu tập">
                      <LayoutGrid size={14} />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/checkout">
                      <ShoppingBag size={14} />
                      {itemCount}
                    </Link>
                  </Button>
                </div>
              </div>

              <nav className="scrollbar-thin flex items-center gap-2 overflow-x-auto max-[420px]:col-span-2 max-[420px]:row-start-2 max-[420px]:w-full max-[420px]:justify-start max-[420px]:gap-1 max-[320px]:justify-center max-[319px]:hidden lg:justify-center">
                <div className="flex items-center gap-1 overflow-hidden rounded-full border border-white/70 bg-white/18 p-1.5 shadow-[0_18px_40px_rgba(106,136,182,0.10)] backdrop-blur-[18px] max-[420px]:w-full max-[420px]:justify-between max-[420px]:p-1 max-[320px]:max-w-[12.5rem]">
                  {links.map((link) => {
                    const active = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-label={link.label}
                        className={cn(
                          "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition duration-300 max-[420px]:h-7 max-[420px]:gap-1 max-[420px]:px-2 max-[420px]:text-[10px] max-[260px]:px-1.5",
                          active
                            ? "liquid-button-shell text-[var(--foreground-hero)]"
                            : "text-[var(--muted)] hover:bg-white/24 hover:text-[var(--foreground)]",
                        )}
                      >
                        <Icon size={14} />
                        <span className="max-[420px]:hidden">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="flex items-center justify-end gap-2 max-[420px]:col-start-2 max-[420px]:row-start-1 max-[420px]:gap-1.5">
                <Link
                  href="/checkout"
                  className="hidden h-[3.25rem] w-[12.75rem] items-center justify-between gap-3 rounded-full border border-white/70 bg-white/18 px-4 text-sm font-medium text-[var(--foreground)] shadow-[0_14px_32px_rgba(106,136,182,0.08)] backdrop-blur-[18px] transition hover:border-white sm:inline-flex"
                >
                  <span className="inline-flex items-center gap-3">
                    <ShoppingBag size={16} />
                    <span>Giỏ hàng</span>
                  </span>
                  <span className="rounded-full border border-white/72 bg-white/36 px-2 py-0.5 text-[10px] font-semibold text-inherit">
                    {itemCount}
                  </span>
                </Link>

                {!isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/dang-ky"
                      className="hidden h-[3.25rem] items-center rounded-full border border-white/70 bg-white/18 px-5 text-sm font-medium text-[var(--foreground)] shadow-[0_14px_32px_rgba(106,136,182,0.08)] backdrop-blur-[18px] transition hover:border-white sm:inline-flex"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      href="/dang-nhap"
                      className="inline-flex h-[3.25rem] items-center gap-3 rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.36),rgba(171,228,255,0.26)_46%,rgba(196,181,253,0.26))] px-5 text-sm font-medium text-[var(--foreground-hero)] shadow-[0_18px_36px_rgba(126,154,220,0.14)] backdrop-blur-[22px] transition hover:border-white max-[420px]:h-8 max-[420px]:gap-1.5 max-[420px]:px-2 max-[420px]:text-[11px] max-[260px]:px-1.5"
                    >
                      <LogIn size={14} />
                      <span className="max-[390px]:hidden">Đăng nhập</span>
                    </Link>
                  </div>
                ) : (
                  <div className="glass-panel flex items-center justify-end gap-2 rounded-full p-1.5 max-[420px]:p-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="glass-panel inline-flex h-[3.25rem] w-auto min-w-[3.25rem] items-center justify-between gap-3 rounded-full px-2 py-2 text-[var(--foreground)] transition hover:border-white sm:w-[12.75rem] max-[420px]:h-8 max-[420px]:min-w-8 max-[420px]:gap-1.5 max-[420px]:px-1">
                          <Avatar className="h-9 w-9 max-[420px]:h-8 max-[420px]:w-8">
                            <AvatarFallback>{initials(user?.fullName ?? "Z")}</AvatarFallback>
                          </Avatar>
                          <div className="hidden min-w-0 flex-1 text-left sm:block">
                            <div className="max-w-32 truncate text-sm font-semibold">{user?.fullName}</div>
                            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
                              {isAdmin ? "Quản trị" : "Tài khoản"}
                            </div>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuItem onClick={() => router.push(isAdmin ? "/admin/ho-so" : "/tai-khoan")}>
                          <CircleUserRound size={16} />
                          {isAdmin ? "Hồ sơ quản trị" : "Tài khoản"}
                        </DropdownMenuItem>
                        {isAdmin ? (
                          <DropdownMenuItem onClick={() => router.push("/admin")}>
                            <LayoutGrid size={16} />
                            Bảng quản trị
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            void logoutAction().then(() => router.push("/"));
                          }}
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
