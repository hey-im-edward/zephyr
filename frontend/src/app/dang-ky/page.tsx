"use client";

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

export default function RegisterPage() {
  const router = useRouter();
  const { registerAction, isAuthenticated, isReady } = useAuth();
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
    router.replace("/tai-khoan");
  }, [isAuthenticated, isReady, router]);

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
    <div className="section-shell grid gap-6 py-14 lg:grid-cols-[1fr_1fr]">
      <MotionReveal className="space-y-6">
        <div className="glass-strong brand-shell rounded-[2.2rem] p-7">
          <BrandMark showTagline />
          <div className="mt-6">
            <Badge variant="secondary" className="border border-white/12">
              thành viên mới
            </Badge>
            <div className="editorial-kicker mt-4">giữ nhịp mua</div>
            <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-none text-white">
              Đăng ký một lần để mọi lần mua sau trôi mượt hơn.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Một tài khoản ZEPHYR tốt phải làm được ba việc: rút ngắn thanh toán, giữ lịch sử đơn và mở đường cho các
              trải nghiệm cá nhân hóa sau này.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {valuePillars.map(({ icon: Icon, title, copy }) => (
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
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Dữ liệu sử dụng</div>
            <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Họ tên, số điện thoại và email sẽ được dùng để thanh toán, lưu lịch sử đơn và cập nhật hồ sơ.
            </div>
          </div>
          <div className="surface-panel rounded-[1.65rem] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Tư duy vận hành</div>
            <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Đăng ký bằng thông tin thật và giữ mật khẩu đủ mạnh để dùng tài khoản này như một điểm quay lại lâu dài.
            </div>
          </div>
        </div>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <Card className="glass-strong brand-shell">
          <CardHeader>
            <CardTitle>Thiết lập tài khoản mới</CardTitle>
            <CardDescription>
              Đăng ký để lưu lịch sử mua, theo dõi đơn hàng và thanh toán nhanh hơn trong những lần tiếp theo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
                  {form.formState.errors.fullName ? (
                    <div className="text-sm text-rose-200">{form.formState.errors.fullName.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" autoComplete="tel" {...form.register("phone")} />
                  {form.formState.errors.phone ? (
                    <div className="text-sm text-rose-200">{form.formState.errors.phone.message}</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.email.message}</div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
                  {form.formState.errors.password ? (
                    <div className="text-sm text-rose-200">{form.formState.errors.password.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...form.register("confirmPassword")}
                  />
                  {form.formState.errors.confirmPassword ? (
                    <div className="text-sm text-rose-200">{form.formState.errors.confirmPassword.message}</div>
                  ) : null}
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản ZEPHYR"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
              <span>Đã có tài khoản?</span>
              <Link href="/dang-nhap" className="inline-flex items-center gap-2 font-medium text-[var(--accent-soft)]">
                Đăng nhập
                <ArrowRight />
              </Link>
            </div>
          </CardContent>
        </Card>
      </MotionReveal>
    </div>
  );
}
