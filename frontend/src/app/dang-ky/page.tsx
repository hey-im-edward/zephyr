"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CreditCard, ShieldCheck, Truck } from "@/components/icons";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/components/auth-provider";
import { MotionReveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên quá ngắn."),
    email: z.email("Email không hợp lệ."),
    phone: z.string().min(9, "Số điện thoại không hợp lệ."),
    password: z.string().min(8, "Mật khẩu phải từ 8 ký tự."),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const valuePillars = [
  {
    icon: CreditCard,
    title: "Thanh toán nhanh hơn",
    copy: "Tài khoản giúp tự điền thông tin giao hàng và rút ngắn luồng mua cho những lần tiếp theo.",
  },
  {
    icon: Truck,
    title: "Theo dõi đơn rõ ràng",
    copy: "Mỗi đơn hàng được gom vào một nơi, đủ dễ theo dõi mà không cần đi tìm lại từ đầu.",
  },
  {
    icon: ShieldCheck,
    title: "Quyền truy cập tách bạch",
    copy: "Vai trò được xác định ở backend, còn trải nghiệm phía trước luôn mạch lạc và nhất quán.",
  },
];

const coverImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAction, isAuthenticated, isReady, user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    router.replace(user?.role === "ADMIN" ? "/admin" : "/tai-khoan");
  }, [isAuthenticated, isReady, router, user?.role]);

  function onSubmit(values: RegisterValues) {
    startTransition(() => {
      void registerAction({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
        .then(() => {
          toast.success("Đăng ký thành công.");
          router.push("/tai-khoan");
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Đăng ký thất bại.");
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
                <Badge variant="secondary">First-time setup</Badge>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="relative min-h-[30rem] overflow-hidden rounded-[2.2rem] border border-white/60">
                  <Image
                    src={coverImage}
                    alt="ZEPHYR new member setup"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_34%,rgba(10,18,32,0.18))]" />
                  <div className="absolute inset-x-5 top-5">
                    <div className="inline-flex rounded-full border border-white/72 bg-white/18 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--foreground-dim)] backdrop-blur-[18px]">
                      New member
                    </div>
                  </div>
                </div>

                <div className="grid content-start gap-4">
                  <div className="rounded-[1.8rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] p-6 backdrop-blur-[22px]">
                    <div className="editorial-kicker">Sign up shell</div>
                    <div className="mt-3 font-display text-[2.3rem] font-bold leading-[0.96] tracking-[-0.045em] text-[var(--foreground-hero)] md:text-[2.55rem]">
                      Một lần thiết lập để những lần mua sau gọn hơn.
                    </div>
                    <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--muted)]">
                      Register shell phải gọn, sáng và có trật tự. Ảnh giữ bầu không khí, còn onboarding copy và trụ cột giá trị phải đứng ở layer riêng.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {valuePillars.map(({ icon: Icon, title, copy }) => (
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
                    <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Data discipline</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Form chỉ lấy dữ liệu phục vụ checkout, hồ sơ và account center có phân vai trò. Mọi thứ còn lại nên để sau khi người dùng vào hệ.
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
                Sign up
              </Badge>
              <CardTitle className="text-[2rem]">Thiết lập tài khoản mới</CardTitle>
              <CardDescription className="max-w-md text-[0.95rem]">
                Đăng ký để lưu lịch sử mua, theo dõi đơn hàng và rút ngắn thời gian thanh toán trong những lần tiếp theo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input id="fullName" autoComplete="name" placeholder="Triết Đặng" {...form.register("fullName")} />
                    {form.formState.errors.fullName ? (
                      <div className="text-sm text-rose-500">{form.formState.errors.fullName.message}</div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" autoComplete="tel" placeholder="09xxxxxxxx" {...form.register("phone")} />
                    {form.formState.errors.phone ? (
                      <div className="text-sm text-rose-500">{form.formState.errors.phone.message}</div>
                    ) : null}
                  </div>
                </div>

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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Tối thiểu 8 ký tự"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password ? (
                      <div className="text-sm text-rose-500">{form.formState.errors.password.message}</div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword ? (
                      <div className="text-sm text-rose-500">{form.formState.errors.confirmPassword.message}</div>
                    ) : null}
                  </div>
                </div>

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                  {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản ZEPHYR"}
                </Button>
              </form>

              <div className="mt-6 rounded-[1.4rem] border border-white/78 bg-white/28 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Đăng nhập sau đó</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Tạo xong là vào thẳng khu tài khoản để xem đơn, sửa hồ sơ và bắt đầu mua sắm ngay.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
                <span>Đã có tài khoản?</span>
                <Link href="/dang-nhap" className="inline-flex items-center gap-2 font-medium text-[var(--foreground-hero)]">
                  Đăng nhập
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
