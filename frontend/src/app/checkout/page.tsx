"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, Minus, Plus, ShieldCheck, Trash2, Truck } from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-mark";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPaymentSession,
  PAYMENT_METHOD_LABELS,
  getMyAddresses,
  getPromotions,
  getShippingMethods,
  submitOrder,
} from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { fallbackPromotions, fallbackShippingMethods, isStorefrontDemoFallbackEnabled } from "@/lib/storefront-fallback";
import type { Promotion, ShippingMethod, UserAddress } from "@/lib/types";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
  city: z.string().min(2, "Vui lòng nhập tỉnh/thành."),
  addressLine: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ."),
  notes: z.string().max(500, "Ghi chú quá dài.").optional(),
  paymentMethod: z.enum(["COD", "BANK_QR"]).optional(),
  shippingMethodSlug: z.string().optional(),
  promotionCode: z.string().optional(),
}).refine((values) => values.paymentMethod !== undefined, {
  path: ["paymentMethod"],
  message: "Vui lòng chọn phương thức thanh toán.",
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type CheckoutDependencyMode = "loading" | "live" | "demo-fallback" | "unavailable";
const USER_FACING_PAYMENT_METHODS = ["COD", "BANK_QR"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, removeItem, updateQuantity } = useCart();
  const { user, isAuthenticated, isAdmin, isReady, getAccessToken } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [checkoutDependencyMode, setCheckoutDependencyMode] = useState<CheckoutDependencyMode>("loading");
  const [isPending, startTransition] = useTransition();
  const savedAddresses = isAuthenticated ? addresses : [];

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      city: "",
      addressLine: "",
      notes: "",
      shippingMethodSlug: "",
      promotionCode: "",
    },
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  const shippingMethodSlug = useWatch({
    control: form.control,
    name: "shippingMethodSlug",
  });

  const promotionCode = useWatch({
    control: form.control,
    name: "promotionCode",
  });

  useEffect(() => {
    void (async () => {
      try {
        const [shippingData, promotionData] = await Promise.all([getShippingMethods(), getPromotions()]);
        setShippingMethods(shippingData);
        setPromotions(promotionData);
        setCheckoutDependencyMode("live");

        form.setValue("shippingMethodSlug", shippingData[0]?.slug ?? "");
        form.setValue(
          "promotionCode",
          promotionData.find((promotion) => promotion.featured)?.code ?? promotionData[0]?.code ?? "",
        );
      } catch {
        if (isStorefrontDemoFallbackEnabled()) {
          setShippingMethods(fallbackShippingMethods);
          setPromotions(fallbackPromotions);
          setCheckoutDependencyMode("demo-fallback");
          form.setValue("shippingMethodSlug", fallbackShippingMethods[0]?.slug ?? "");
          form.setValue(
            "promotionCode",
            fallbackPromotions.find((promotion) => promotion.featured)?.code ?? fallbackPromotions[0]?.code ?? "",
          );
          toast.warning("Checkout đang ở chế độ demo fallback. Nút xác nhận đơn đã bị khóa cho đến khi backend phục hồi.");
          return;
        }

        setShippingMethods([]);
        setPromotions([]);
        setCheckoutDependencyMode("unavailable");
        form.setValue("shippingMethodSlug", "");
        form.setValue("promotionCode", "");
        toast.error("Không thể tải shipping method và promotion. Checkout đang tạm khóa để tránh gửi dữ liệu không đầy đủ.");
      }
    })();
  }, [form]);

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

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const data = await getMyAddresses(token);
        setAddresses(data);

        const defaultAddress = data.find((item) => item.defaultAddress) ?? data[0];
        if (defaultAddress) {
          form.setValue("customerName", defaultAddress.recipientName);
          form.setValue("phone", defaultAddress.phone);
          form.setValue("addressLine", defaultAddress.addressLine);
          form.setValue("city", defaultAddress.city);
        }
      } catch {
        // Non-blocking for guest checkout parity.
      }
    })();
  }, [form, getAccessToken, isAuthenticated, isReady]);

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.slug === shippingMethodSlug) ?? shippingMethods[0],
    [shippingMethodSlug, shippingMethods],
  );
  const selectedPromotion = useMemo(
    () => promotions.find((promotion) => promotion.code === promotionCode),
    [promotionCode, promotions],
  );

  const shippingFee = selectedShipping?.fee ?? 0;
  const discountAmount = selectedPromotion ? Math.round(subtotal * 0.08) : 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);
  const isCheckoutReadyForSubmit = checkoutDependencyMode === "live";
  const checkoutIsDegraded = checkoutDependencyMode === "demo-fallback" || checkoutDependencyMode === "unavailable";

  const checkoutGuardCopy =
    checkoutDependencyMode === "demo-fallback"
      ? "Checkout đang hiển thị dữ liệu demo để giữ bố cục review. Nút xác nhận đơn bị khóa cho đến khi backend shipping và promotion phản hồi lại."
      : checkoutDependencyMode === "unavailable"
        ? "Không thể tải shipping method và promotion từ hệ thống. Checkout đang được giữ ở chế độ an toàn để tránh gửi contract không đầy đủ."
        : null;

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) return;
    const selectedPaymentMethod = values.paymentMethod;
    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán trước khi đặt hàng.");
      return;
    }
    if (isAdmin) {
      toast.error("Tài khoản quản trị không được phép mua hàng.");
      return;
    }
    if (!isCheckoutReadyForSubmit) {
      toast.error("Checkout đang tạm khóa vì chưa có dữ liệu shipping và promotion từ backend.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const token = isAuthenticated ? await getAccessToken() : null;
          const response = await submitOrder(
            {
              ...values,
              notes: values.notes?.trim() ? values.notes : undefined,
              paymentMethod: selectedPaymentMethod,
              shippingMethodSlug: values.shippingMethodSlug || undefined,
              promotionCode: values.promotionCode || undefined,
              items: items.map((item) => ({
                shoeSlug: item.shoeSlug,
                sizeLabel: item.sizeLabel,
                quantity: item.quantity,
              })),
            },
            token,
          );

          clearCart();

          if (selectedPaymentMethod === "COD") {
            setOrderCode(response.orderCode);
            toast.success("Đặt hàng thành công.", {
              description: `Mã đơn của bạn là ${response.orderCode}.`,
            });
            return;
          }

          let referenceToken: string | null = null;
          try {
            const paymentSession = await createPaymentSession({ orderCode: response.orderCode });
            referenceToken = paymentSession.referenceToken;
          } catch {
            toast.warning("Đơn đã tạo nhưng chưa mở được phiên thanh toán.", {
              description: "Bạn sẽ được chuyển tới màn hình thanh toán để thử tạo lại phiên.",
            });
          }

          const searchParams = new URLSearchParams({ orderCode: response.orderCode });
          if (referenceToken) {
            searchParams.set("referenceToken", referenceToken);
          }

          toast.message("Đơn đang chờ thanh toán.", {
            description: `Hoàn tất thanh toán VNPay để xác nhận mã đơn ${response.orderCode}.`,
          });

          router.push(`/checkout/payment?${searchParams.toString()}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể tạo đơn hàng lúc này.");
        }
      })();
    });
  }

  if (isReady && isAuthenticated && isAdmin) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center py-20">
        <div className="surface-strong mx-auto max-w-4xl rounded-[2.4rem] px-8 py-12 text-center">
          <BrandMark compact className="justify-center" />
          <div className="mt-6 font-display text-4xl font-semibold text-(--foreground-hero)">Tài khoản quản trị không hỗ trợ mua hàng</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-(--muted)">
            Vai trò ADMIN chỉ dùng cho vận hành. Vui lòng dùng tài khoản khách hàng để đặt đơn hoặc quay lại khu quản trị.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/admin">Mở bảng quản trị</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center py-20">
        <div className="surface-strong mx-auto max-w-4xl rounded-[2.4rem] px-8 py-12 text-center">
          <BrandMark compact className="justify-center" />
          <div className="mt-6 font-display text-4xl font-semibold text-(--foreground-hero)">Giỏ hàng đang trống</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-(--muted)">
            Chọn một vài đôi trong catalog, sau đó quay lại đây để hoàn tất checkout bằng shipping method, promotion và address đã lưu.
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
    <div className="section-shell py-12">
      <div className="page-frame space-y-8">
        <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="surface-strong rounded-[2.5rem] p-8">
            <div className="space-y-4">
              <Badge>Luồng thanh toán</Badge>
              <h1 className="display-hero max-w-4xl">
                Hoàn tất đơn hàng bằng một luồng rõ, nhẹ và đáng tin.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-(--muted-strong)">
                Checkout mới tách giỏ hàng, địa chỉ, shipping method và promotion thành các lớp dễ quét. Đây là nơi glass phải hỗ trợ clarity, không che nó đi.
              </p>
            </div>

            {checkoutGuardCopy ? (
              <div className="mt-6 rounded-[1.6rem] border border-amber-300/50 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="warning">Checkout tạm khóa</Badge>
                  <span>{checkoutGuardCopy}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Địa chỉ đã lưu", "Áp địa chỉ mặc định vào form chỉ với một chạm."],
                ["Lớp giao hàng", "Hiển thị ETA và phí ship ngay trong decision zone."],
                ["Contract ưu đãi", "Ưu đãi chạy qua API riêng, không hard-code trong UI."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[1.6rem] border border-(--line) bg-white/62 p-4">
                  <div className="font-semibold text-(--foreground-hero)">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-(--muted)">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-admin rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="utility-label">Tóm tắt</div>
                <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">
                  {formatVnd(total)}
                </div>
              </div>
              <Badge variant="secondary">{items.length} dòng sản phẩm</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={`${item.shoeSlug}-${item.sizeLabel}`} className="rounded-[1.6rem] border border-(--line) bg-white/62 p-4">
                  <div className="flex gap-4">
                    <Image
                      src={item.primaryImage}
                      alt={item.shoeName}
                      width={160}
                      height={160}
                      sizes="80px"
                      className="h-20 w-20 rounded-[1.2rem] object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-xl font-semibold text-(--foreground-hero)">{item.shoeName}</div>
                      <div className="mt-1 text-sm text-(--muted)">
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
                          <div className="flex h-10 min-w-12 items-center justify-center rounded-2xl border border-(--line) bg-white/70 px-3 text-sm font-semibold text-(--foreground-hero)">
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
                        <div className="text-sm text-(--muted)">{formatVnd(item.price)} / đôi</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-4">
                      <div className="text-right font-semibold text-(--foreground-hero)">
                        {formatVnd(item.price * item.quantity)}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.shoeSlug, item.sizeLabel)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-(--line) bg-white/58 p-5">
              <div className="flex items-center justify-between text-sm text-(--muted)">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-(--muted)">
                <span>Phí giao hàng</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-(--muted)">
                <span>Giảm giá</span>
                <span>-{formatVnd(discountAmount)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-lg font-semibold text-(--foreground-hero)">
                <span>Tổng thanh toán</span>
                <span>{formatVnd(total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <div className="surface-admin rounded-[2.3rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="utility-label">Sổ địa chỉ</div>
                <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">
                  {isAuthenticated ? "Địa chỉ đã lưu" : "Checkout của khách"}
                </div>
              </div>
              {savedAddresses.length > 0 ? <Badge variant="secondary">{savedAddresses.length} địa chỉ</Badge> : null}
            </div>

            {savedAddresses.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {savedAddresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      form.setValue("customerName", address.recipientName);
                      form.setValue("phone", address.phone);
                      form.setValue("addressLine", address.addressLine);
                      form.setValue("city", address.city);
                    }}
                    className="rounded-[1.7rem] border border-(--line) bg-white/62 p-4 text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-(--foreground-hero)">{address.label}</div>
                      {address.defaultAddress ? <Badge>Mặc định</Badge> : null}
                    </div>
                    <div className="mt-2 text-sm text-(--muted)">
                      {address.recipientName} • {address.phone}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-(--muted)">
                      {address.addressLine}, {address.city}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.7rem] border border-(--line) bg-white/58 p-5 text-sm leading-7 text-(--muted)">
                {isAuthenticated
                  ? "Chưa có địa chỉ nào được lưu. Bạn vẫn có thể hoàn tất đơn bằng cách nhập tay ở form bên phải."
                  : "Bạn có thể đặt hàng như khách. Đăng nhập hoặc đăng ký để lưu địa chỉ cho những lần mua sau."}
              </div>
            )}

            <div className="mt-6 rounded-[1.7rem] border border-(--line) bg-white/58 p-5">
              <div className="text-sm font-semibold text-(--foreground-hero)">Phương thức giao hàng</div>
              {shippingMethods.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`rounded-3xl border p-4 transition ${
                        selectedShipping?.slug === method.slug
                          ? "border-(--line-strong) bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(244,248,255,0.7))]"
                          : "border-(--line) bg-white/62"
                      }`}
                    >
                      <input type="radio" value={method.slug} {...form.register("shippingMethodSlug")} className="sr-only" />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-(--foreground-hero)">{method.name}</div>
                          <div className="mt-1 text-sm leading-6 text-(--muted)">{method.description}</div>
                          <div className="mt-2 text-sm text-(--muted)">{method.etaLabel}</div>
                        </div>
                        <div className="text-sm font-semibold text-(--foreground-hero)">{formatVnd(method.fee)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-dashed border-(--line) bg-white/62 p-4 text-sm leading-7 text-(--muted)">
                  Chưa thể tải phương thức giao hàng từ backend. Khi dữ liệu sẵn sàng, các lựa chọn giao hàng sẽ xuất hiện tại đây.
                </div>
              )}
            </div>

            {promotions.length > 0 ? (
              <div className="mt-6 rounded-[1.7rem] border border-(--line) bg-white/58 p-5">
                <div className="text-sm font-semibold text-(--foreground-hero)">Ưu đãi</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {promotions.map((promotion) => (
                    <button
                      key={promotion.id}
                      type="button"
                      onClick={() => form.setValue("promotionCode", promotion.code)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedPromotion?.code === promotion.code
                          ? "border-transparent bg-[linear-gradient(135deg,var(--brand-gold),#efc57e,var(--brand-rose))] text-(--brand-ink)"
                          : "border-(--line) bg-white/70 text-foreground"
                      }`}
                    >
                      {promotion.code}
                    </button>
                  ))}
                </div>
                {selectedPromotion ? (
                  <div className="mt-4 rounded-[1.4rem] border border-(--line) bg-white/70 p-4">
                    <div className="font-medium text-(--foreground-hero)">{selectedPromotion.title}</div>
                    <div className="mt-1 text-sm leading-6 text-(--muted)">{selectedPromotion.description}</div>
                    <div className="mt-3">
                      <Badge variant="warning">{selectedPromotion.discountLabel}</Badge>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : checkoutIsDegraded ? (
              <div className="mt-6 rounded-[1.7rem] border border-(--line) bg-white/58 p-5 text-sm leading-7 text-(--muted)">
                Promotion đang tạm ẩn vì frontend chưa nhận được contract ưu đãi từ backend. Khi hệ thống phục hồi, khu vực này sẽ hiển thị lại bình thường.
              </div>
            ) : null}
          </div>

          <div className="surface-strong rounded-[2.3rem] p-6">
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Họ và tên</Label>
                  <Input id="customerName" {...form.register("customerName")} />
                  {form.formState.errors.customerName ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.customerName.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.email.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" {...form.register("phone")} />
                  {form.formState.errors.phone ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.phone.message}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh / Thành phố</Label>
                  <Input id="city" {...form.register("city")} />
                  {form.formState.errors.city ? (
                    <div className="text-sm text-rose-500">{form.formState.errors.city.message}</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine">Địa chỉ nhận hàng</Label>
                <Input id="addressLine" {...form.register("addressLine")} />
                {form.formState.errors.addressLine ? (
                  <div className="text-sm text-rose-500">{form.formState.errors.addressLine.message}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú giao hàng</Label>
                <Textarea id="notes" {...form.register("notes")} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." />
                {form.formState.errors.notes ? (
                  <div className="text-sm text-rose-500">{form.formState.errors.notes.message}</div>
                ) : null}
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-(--foreground-hero)">Phương thức thanh toán</legend>
                <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Phương thức thanh toán">
                  {USER_FACING_PAYMENT_METHODS.map((value) => {
                    const isSelected = paymentMethod === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          form.setValue("paymentMethod", value, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        className={`group relative rounded-3xl border p-4 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-(--ring) ${
                          isSelected
                            ? "border-(--line-strong) bg-[linear-gradient(135deg,rgba(255,255,255,0.93),rgba(232,244,255,0.86))] shadow-[0_12px_26px_rgba(77,114,160,0.16)]"
                            : "border-(--line) bg-white/62 hover:bg-white/78"
                        }`}
                      >
                        <div
                          className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-(--accent) bg-(--accent) text-white"
                              : "border-(--line-strong) bg-white/86 text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>

                        <div className="flex items-center gap-2 pr-7 font-medium text-(--foreground-hero)">
                          {value === "COD" ? <Truck /> : <CreditCard />}
                          {PAYMENT_METHOD_LABELS[value]}
                        </div>
                        <div className="mt-2 text-(--muted)">
                          {value === "COD" && "COD vẫn có chỗ đứng, nhưng được trình bày như một option chính thức chứ không phải note phụ."}
                          {value === "BANK_QR" && "Thanh toán qua cổng VNPay. Sau khi xác nhận đơn, hệ thống sẽ chuyển sang màn hình theo dõi thanh toán realtime."}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.paymentMethod ? (
                  <div className="text-sm text-rose-500">{form.formState.errors.paymentMethod.message}</div>
                ) : null}
              </fieldset>

              <div className="rounded-[1.7rem] border border-(--line) bg-white/58 p-4 text-sm text-(--muted)">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 text-(--accent)" />
                  <span>Checkout này được thiết kế theo operational glass: surface sáng hơn, blur nhẹ hơn và mọi thông tin quan trọng phải đọc được ngay.</span>
                </div>
              </div>

              {orderCode ? (
                <div className="rounded-3xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Đơn hàng đã được tạo thành công. Mã đơn: <strong>{orderCode}</strong>.
                </div>
              ) : null}

              {checkoutGuardCopy ? (
                <div className="rounded-3xl border border-amber-300/50 bg-amber-50/80 px-4 py-3 text-sm leading-7 text-amber-950">
                  {checkoutGuardCopy}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                {!isAuthenticated ? (
                  <div className="text-sm text-(--muted)">
                    Muốn lưu lịch sử mua và địa chỉ?{" "}
                    <Link href="/dang-nhap" className="text-(--foreground-hero) underline decoration-(--line-strong) underline-offset-4">
                      Đăng nhập ngay
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="text-sm text-(--muted)">Đơn này sẽ xuất hiện cùng địa chỉ và lịch sử mua trong khu tài khoản.</div>
                )}

                <Button type="submit" disabled={isPending || !isCheckoutReadyForSubmit}>
                  {isPending
                    ? "Đang gửi đơn..."
                    : checkoutDependencyMode === "loading"
                      ? "Đang tải phương thức..."
                      : isCheckoutReadyForSubmit
                        ? paymentMethod === "BANK_QR"
                          ? "Tiếp tục tới thanh toán"
                          : "Xác nhận đặt hàng"
                        : "Tạm khóa xác nhận đơn"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

