"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  ShoppingBag,
  LogIn,
  LogOut,
  Sparkles,
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
  const showDesignSystem =
    process.env.NEXT_PUBLIC_ENABLE_INTERNAL_UI_DOCS === "true" || process.env.NODE_ENV !== "production";

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(4,6,12,0.78)] backdrop-blur-2xl">
      <div className="page-frame">
        <div className="flex items-center justify-between gap-4 py-3 text-[11px] uppercase tracking-[0.24em] text-[var(--foreground-dim)]">
          <div className="hidden items-center gap-2 md:inline-flex">
            <Sparkles size={14} />
            Giao diện kính mờ cho bộ sưu tập giày được tuyển chọn
          </div>
          <div className="inline-flex items-center gap-2">
            <span>Tồn kho theo size rõ ràng</span>
            <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]" />
            <span>Xưởng giày đương đại</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="min-w-0">
            <BrandMark showTagline compact />
          </Link>

          <nav className="scrollbar-thin flex items-center gap-2 overflow-x-auto pb-1 lg:justify-center">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Button
                  key={link.href}
                  asChild
                  size="sm"
                  variant={active ? "default" : "ghost"}
                  className={cn("shrink-0", active ? "text-[var(--brand-ink)]" : "text-[var(--muted-strong)]")}
                >
                  <Link href={link.href}>
                    <Icon size={16} className={active ? "opacity-100" : "opacity-70"} />
                    {link.label}
                  </Link>
                </Button>
              );
            })}

            {showDesignSystem ? (
              <Button asChild size="sm" variant="ghost" className="shrink-0 text-[var(--muted-strong)]">
                <Link href="/design-system">Hệ thiết kế</Link>
              </Button>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Link href="/checkout">
                <ShoppingBag size={16} />
                Giỏ hàng ({itemCount})
              </Link>
            </Button>

            {!isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/dang-ky">Đăng ký</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/dang-nhap">
                    <LogIn size={16} />
                    Đăng nhập
                  </Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/7 px-2 py-2 text-white transition hover:border-white/25 hover:bg-white/10">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(user?.fullName ?? "Z")}</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <div className="max-w-32 truncate text-sm font-medium">{user?.fullName}</div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-dim)]">
                        {isAdmin ? "Admin" : "Thành viên"}
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={() => router.push("/tai-khoan")}>
                    <CircleUserRound size={16} />
                    Tài khoản
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <LayoutGrid size={16} />
                      Quản trị
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
