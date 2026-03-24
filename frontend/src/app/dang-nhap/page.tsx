"use client";

import Link from "next/link";
import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleUserRound, LockKeyhole, Package } from "@/components/icons";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/components/auth-provider";
import { MotionReveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(8, "Mật khẩu phải từ 8 ký tự."),
});

type LoginValues = z.infer<typeof loginSchema>;

const bullets = [
  {
    icon: Package,
    title: "Theo dõi đơn hàng gọn gàng",
    copy: "Lịch sử mua và trạng thái xử lý được giữ trong cùng một nơi, không cần lần nào cũng bắt đầu lại.",
  },
  {
    icon: CircleUserRound,
    title: "Giữ thông tin cho lần mua sau",
    copy: "Hồ sơ cá nhân giúp thanh toán nhanh hơn và tạo cảm giác liền mạch trên mọi lần quay lại.",
  },
  {
    icon: LockKeyhole,
    title: "Một điểm vào cho mọi vai trò",
    copy: "Người mua đi tiếp vào khu tài khoản, quản trị viên đi thẳng sang bảng điều phối khi có quyền phù hợp.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAction, isAuthenticated, isReady } = useAuth();
  const [isPending, startTransition] = useTransition();
  const redirect = useMemo(
    () => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("redirect")),
    [],
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    router.replace(redirect ?? "/tai-khoan");
  }, [isAuthenticated, isReady, redirect, router]);

  function onSubmit(values: LoginValues) {
    startTransition(() => {
      void loginAction(values)
        .then((session) => {
          toast.success("Đăng nhập thành công.");
          router.push(redirect ?? (session.user.role === "ADMIN" ? "/admin" : "/tai-khoan"));
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại.");
        });
    });
  }

  return (
    <div className="section-shell grid gap-6 py-14 lg:grid-cols-[1.02fr_0.98fr]">
      <MotionReveal className="space-y-6">
        <div className="glass-strong brand-shell rounded-[2.2rem] p-7">
          <BrandMark showTagline />
          <div className="mt-6">
            <Badge variant="secondary" className="border border-white/12">
              khu thành viên
            </Badge>
            <div className="editorial-kicker mt-4">trở lại thật êm</div>
            <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-none text-white">
              Trở lại để tiếp tục đơn hàng, lưu nhịp mua sắm và giữ mọi lịch sử trong tài khoản.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              ZEPHYR dùng một điểm đăng nhập cho cả người mua và quản trị. Luồng sau khi vào sẽ tự chuyển đúng nơi
              theo vai trò của anh.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {bullets.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="surface-panel-muted flex items-start gap-4 rounded-[1.35rem] p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,rgba(243,215,162,0.22),rgba(240,168,192,0.26))]">
                  <Icon />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="surface-panel rounded-[1.65rem] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Sau khi đăng nhập</div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
              <div>• Người mua đi vào khu tài khoản và lịch sử đơn.</div>
              <div>• Quản trị viên đi thẳng tới màn điều phối.</div>
            </div>
          </div>
          <div className="surface-panel rounded-[1.65rem] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Điểm cộng</div>
            <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Không còn copy dev nội bộ trên màn hình. Đây là khu đăng nhập đúng nghĩa cho một storefront đang vận hành.
            </div>
          </div>
        </div>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <Card className="glass-strong brand-shell">
          <CardHeader>
            <CardTitle>Chào mừng quay lại</CardTitle>
            <CardDescription>
              Đăng nhập để hoàn tất thanh toán, xem lịch sử đơn và cập nhật thông tin cá nhân.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.email.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
                {form.formState.errors.password ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.password.message}</div>
                ) : null}
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
              <span>Chưa có tài khoản?</span>
              <Link href="/dang-ky" className="inline-flex items-center gap-2 font-medium text-[var(--accent-soft)]">
                Đăng ký ngay
                <ArrowRight />
              </Link>
            </div>
          </CardContent>
        </Card>
      </MotionReveal>
    </div>
  );
}
