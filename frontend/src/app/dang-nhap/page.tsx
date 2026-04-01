"use client";

import Image from "next/image";
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
    copy: "Hồ sơ cá nhân giúp thanh toán nhanh hơn và tạo cảm giác liền mạch trên mỗi lần quay lại.",
  },
  {
    icon: LockKeyhole,
    title: "Một điểm vào cho mọi vai trò",
    copy: "Người mua đi tiếp vào khu tài khoản, quản trị viên đi thẳng sang bảng điều phối khi có quyền phù hợp.",
  },
];

const coverImage =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80";

export default function LoginPage() {
  const router = useRouter();
  const { loginAction, isAuthenticated, isReady, user } = useAuth();
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
    router.replace(redirect ?? (user?.role === "ADMIN" ? "/admin" : "/tai-khoan"));
  }, [isAuthenticated, isReady, redirect, router, user?.role]);

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
    <div className="section-shell py-10 md:py-14">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <MotionReveal>
          <section className="surface-strong overflow-hidden rounded-[var(--radius-shell)] p-5 md:p-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <BrandMark showTagline />
                <Badge variant="secondary">Smooth sign in</Badge>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="relative min-h-[30rem] overflow-hidden rounded-[2.2rem] border border-white/60">
                  <Image
                    src={coverImage}
                    alt="ZEPHYR member lounge"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_34%,rgba(10,18,32,0.18))]" />
                  <div className="absolute inset-x-5 top-5">
                    <div className="inline-flex rounded-full border border-white/72 bg-white/18 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--foreground-dim)] backdrop-blur-[18px]">
                      Member access
                    </div>
                  </div>
                </div>

                <div className="grid content-start gap-4">
                  <div className="rounded-[1.8rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] p-6 backdrop-blur-[22px]">
                    <div className="editorial-kicker">Member access shell</div>
                    <div className="mt-3 font-display text-[2.3rem] font-bold leading-[0.96] tracking-[-0.045em] text-[var(--foreground-hero)] md:text-[2.55rem]">
                      Trở lại tài khoản để đi tiếp thật nhanh.
                    </div>
                    <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--muted)]">
                      Surface đăng nhập cần sáng, rõ và ổn định. Ảnh chỉ làm nền bầu không khí; text và trust layer phải tách ra khỏi vùng focal point.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {bullets.map(({ icon: Icon, title, copy }) => (
                      <article key={title} className="glass-panel rounded-[1.5rem] p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-white/76 bg-white/26 text-[var(--accent)]">
                          <Icon size={18} />
                        </div>
                        <h2 className="mt-3 text-sm font-semibold leading-6 text-[var(--foreground-hero)]">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                      </article>
                    ))}
                  </div>

                  <div className="rounded-[1.6rem] border border-white/56 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] p-5 backdrop-blur-[18px]">
                    <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Khu tài khoản</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Sau khi đăng nhập, người mua đi vào lịch sử đơn, wishlist, address book và chỉnh sửa hồ sơ trong cùng một account center.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <Card className="surface-panel-strong rounded-[var(--radius-shell)]">
            <CardHeader className="pb-4">
              <Badge variant="secondary" className="w-fit">
                Sign in
              </Badge>
              <CardTitle className="text-[2rem]">Chào mừng quay lại</CardTitle>
              <CardDescription className="max-w-md text-[0.95rem]">
                Đăng nhập để hoàn tất thanh toán, xem lịch sử đơn và cập nhật thông tin cá nhân trong cùng một luồng mạch lạc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@zephyr.vn"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.email.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của anh"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.password.message}</div>
                  ) : null}
                </div>
                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                  {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <div className="mt-6 rounded-[1.4rem] border border-white/78 bg-white/28 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Khu tài khoản</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Nếu chưa có tài khoản, anh có thể tạo mới trong vài bước và dùng lại cho các lần mua sau.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
                <span>Chưa có tài khoản?</span>
                <Link href="/dang-ky" className="inline-flex items-center gap-2 font-medium text-[var(--foreground-hero)]">
                  Đăng ký ngay
                  <ArrowRight />
                </Link>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>
      </div>
    </div>
  );
}
