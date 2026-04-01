import Link from "next/link";
import { LoaderCircle, LogIn, ShieldCheck } from "@/components/icons";

import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { Button } from "@/components/ui/button";

export function AdminLoadingState() {
  return (
    <div className="mx-auto flex min-h-[56vh] max-w-7xl items-center justify-center px-6 py-24">
      <div className="flex items-center gap-3 text-[var(--muted)]">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        <span>Đang tải không gian quản trị...</span>
      </div>
    </div>
  );
}

export function AdminLoginRequiredState() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-5xl items-center px-6 py-16">
      <AdminPanel>
        <AdminPanelHeader
          title="Khu vận hành ZEPHYR"
          description="Đăng nhập bằng tài khoản quản trị để kiểm soát đơn hàng, tồn kho và danh mục của cửa hàng."
        />
        <AdminPanelBody className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/56 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
              <ShieldCheck className="h-4 w-4" />
              quyền quản trị
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Giao diện này ưu tiên độ rõ ràng, độ tương phản và tốc độ xử lý. Bạn cần quyền admin để tiếp tục.
            </p>
          </div>
          <Button asChild className="min-w-44">
            <Link href="/dang-nhap?redirect=/admin">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          </Button>
        </AdminPanelBody>
      </AdminPanel>
    </div>
  );
}

export function AdminForbiddenState() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-5xl items-center px-6 py-16">
      <AdminPanel>
        <AdminPanelHeader
          title="Tài khoản hiện tại không có quyền admin"
          description="Bạn có thể quay lại storefront hoặc đăng nhập bằng một tài khoản vận hành khác."
        />
        <AdminPanelBody className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dang-nhap?redirect=/admin">Đăng nhập tài khoản khác</Link>
          </Button>
        </AdminPanelBody>
      </AdminPanel>
    </div>
  );
}
