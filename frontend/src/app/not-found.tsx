import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-frame flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <BrandMark compact className="justify-center" />
      <div className="mt-6 font-display text-8xl font-semibold text-white">404</div>
      <h1 className="mt-5 font-display text-4xl font-semibold text-white">Trang này không còn ở đây</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
        Có thể đường dẫn đã thay đổi, sản phẩm đã được gỡ bỏ hoặc anh vừa đi nhanh hơn một nhịp so với hệ thống.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/catalog">Mở bộ sưu tập</Link>
        </Button>
      </div>
    </div>
  );
}
