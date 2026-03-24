"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Minus, Plus, ShieldCheck, Trash2, Truck } from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-mark";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABELS, submitOrder } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import type { PaymentMethod } from "@/lib/types";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
  city: z.string().min(2, "Vui lòng nhập tỉnh/thành."),
  addressLine: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ."),
  notes: z.string().max(500, "Ghi chú quá dài.").optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart, removeItem, updateQuantity } = useCart();
  const { user, isAuthenticated, isReady, getAccessToken } = useAuth();
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      city: "",
      addressLine: "",
      notes: "",
      paymentMethod: "COD",
    },
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  useEffect(() => {
    if (!isReady || !user) return;
    const currentValues = form.getValues();

    form.reset({
      ...currentValues,
      customerName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  }, [form, isReady, user]);

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) return;

    startTransition(() => {
      void (async () => {
        try {
          const token = isAuthenticated ? await getAccessToken() : null;
          const response = await submitOrder(
            {
              ...values,
              notes: values.notes?.trim() ? values.notes : undefined,
              paymentMethod: values.paymentMethod as PaymentMethod,
              items: items.map((item) => ({
                shoeSlug: item.shoeSlug,
                sizeLabel: item.sizeLabel,
                quantity: item.quantity,
              })),
            },
            token,
          );

          setOrderCode(response.orderCode);
          clearCart();
          toast.success("Đặt hàng thành công.", {
            description: `Mã đơn của bạn là ${response.orderCode}.`,
          });
          form.reset({
            ...values,
            notes: "",
            paymentMethod: values.paymentMethod,
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể tạo đơn hàng lúc này.");
        }
      })();
    });
  }

  if (items.length === 0) {
    return (
      <div className="section-shell py-20">
        <div className="glass-strong brand-shell rounded-[2rem] p-10 text-center">
          <BrandMark compact className="justify-center" />
          <div className="mt-6 font-display text-4xl font-semibold text-white">Giỏ hàng đang trống</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Chọn một vài đôi giày trong bộ sưu tập, sau đó quay lại đây để hoàn tất đơn theo nhịp mua của ZEPHYR.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/catalog">Mở catalog</Link>
            </Button>
            {orderCode ? (
              <Button asChild variant="secondary">
                <Link href={isAuthenticated ? "/tai-khoan" : "/"}>Theo dõi đơn hàng</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-14">
      <div className="mb-8 space-y-4">
        <BrandMark showTagline />
        <div className="editorial-kicker">thanh toán rõ ràng</div>
        <h1 className="font-display text-5xl font-semibold text-white">Hoàn tất đơn hàng trong một nhịp rõ ràng</h1>
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
          {isAuthenticated
            ? "Thông tin tài khoản đã được điền sẵn. Anh có thể chỉnh lại trước khi gửi đơn."
            : "Anh có thể đặt hàng với vai trò khách, hoặc đăng nhập để lưu lịch sử mua hàng trong khu tài khoản."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Giỏ hàng của anh</div>
            <div className="text-sm text-[var(--muted)]">{items.length} dòng sản phẩm</div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.shoeSlug}-${item.sizeLabel}`}
                className="surface-panel-muted flex gap-4 rounded-[1.5rem] p-4"
              >
                <Image
                  src={item.primaryImage}
                  alt={item.shoeName}
                  width={160}
                  height={160}
                  sizes="80px"
                  className="h-20 w-20 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-semibold text-white">{item.shoeName}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {item.brand} • Size {item.sizeLabel}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => updateQuantity(item.shoeSlug, item.sizeLabel, item.quantity - 1)}
                      >
                        <Minus />
                      </Button>
                      <div className="flex h-10 min-w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white">
                        {item.quantity}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => updateQuantity(item.shoeSlug, item.sizeLabel, item.quantity + 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <div className="text-sm text-[var(--muted)]">{formatVnd(item.price)} / đôi</div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4">
                  <div className="text-right font-semibold text-[var(--accent-soft)]">
                    {formatVnd(item.price * item.quantity)}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.shoeSlug, item.sizeLabel)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Tạm tính</span>
              <span>{formatVnd(subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold text-white">
              <span>Tổng thanh toán</span>
              <span className="text-[var(--accent-soft)]">{formatVnd(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="glass-strong brand-shell rounded-[2rem] p-6">
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Họ và tên</Label>
                <Input id="customerName" {...form.register("customerName")} />
                {form.formState.errors.customerName ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.customerName.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.email.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.phone.message}</div>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Tỉnh / Thành phố</Label>
                <Input id="city" {...form.register("city")} />
                {form.formState.errors.city ? (
                  <div className="text-sm text-rose-200">{form.formState.errors.city.message}</div>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine">Địa chỉ nhận hàng</Label>
              <Input id="addressLine" {...form.register("addressLine")} />
              {form.formState.errors.addressLine ? (
                <div className="text-sm text-rose-200">{form.formState.errors.addressLine.message}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú giao hàng</Label>
              <Textarea id="notes" {...form.register("notes")} placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..." />
              {form.formState.errors.notes ? (
                <div className="text-sm text-rose-200">{form.formState.errors.notes.message}</div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Phương thức thanh toán</div>
              <div className="grid gap-3 md:grid-cols-2">
                {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                  <label
                    key={value}
                    className={`rounded-[1.5rem] border p-4 text-sm transition ${
                      paymentMethod === value
                        ? "border-[var(--accent)] bg-[rgba(243,215,162,0.12)] text-white"
                        : "border-white/10 bg-white/6 text-[var(--muted)]"
                    }`}
                  >
                    <input type="radio" value={value} {...form.register("paymentMethod")} className="sr-only" />
                    <div className="flex items-center gap-2 font-medium text-white">
                      {value === "COD" ? <Truck /> : <CreditCard />}
                      {label}
                    </div>
                    <div className="mt-2 text-[var(--muted)]">
                      {value === "COD"
                        ? "Thanh toán khi nhận hàng, phù hợp cho đơn nội thành và giao nhanh."
                        : "Nhận thông tin tài khoản sau khi đặt đơn để đối soát và xử lý gọn hơn."}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="surface-panel-muted rounded-[1.5rem] p-4 text-sm text-[var(--muted)]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 text-[var(--accent)]" />
                <span>Thông tin giao hàng được dùng đúng cho đơn hiện tại và cho lần mua sau nếu anh tiếp tục dùng tài khoản này.</span>
              </div>
            </div>

            {orderCode ? (
              <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Đơn hàng đã được tạo thành công. Mã đơn: <strong>{orderCode}</strong>.
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {!isAuthenticated ? (
                <div className="text-sm text-[var(--muted)]">
                  Muốn lưu lịch sử mua?{" "}
                  <Link href="/dang-nhap" className="text-[var(--accent-soft)]">
                    Đăng nhập ngay
                  </Link>
                  .
                </div>
              ) : (
                <div className="text-sm text-[var(--muted)]">Đơn hàng này sẽ xuất hiện trong khu tài khoản của anh.</div>
              )}

              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang gửi đơn..." : "Xác nhận đặt hàng"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
