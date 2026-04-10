"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Minus, Plus, ShieldCheck, Trash2, Truck } from "@/components/icons";
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
  PAYMENT_METHOD_LABELS,
  confirmMockPayment,
  createPaymentSession,
  getMyAddresses,
  getPromotions,
  getShippingMethods,
  submitOrder,
} from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { fallbackPromotions, fallbackShippingMethods, isStorefrontDemoFallbackEnabled } from "@/lib/storefront-fallback";
import type { PaymentMethod, PaymentSessionData, Promotion, ShippingMethod, UserAddress } from "@/lib/types";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().min(9, "Số điện thoại không hợp lệ."),
  city: z.string().min(2, "Vui lòng nhập tỉnh/thành."),
  addressLine: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ."),
  notes: z.string().max(500, "Ghi chú quá dài.").optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "CARD", "BANK_QR", "EWALLET"]),
  shippingMethodSlug: z.string().optional(),
  promotionCode: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type CheckoutDependencyMode = "loading" | "live" | "demo-fallback" | "unavailable";

const ONLINE_PAYMENT_METHODS: PaymentMethod[] = ["CARD", "BANK_QR", "EWALLET"];

function isOnlinePaymentMethod(method: PaymentMethod): boolean {
  return ONLINE_PAYMENT_METHODS.includes(method);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, removeItem, updateQuantity } = useCart();
  const { user, isAuthenticated, isAdmin, isReady, getAccessToken } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paymentSession, setPaymentSession] = useState<PaymentSessionData | null>(null);
  const [isPaymentConfirming, setIsPaymentConfirming] = useState(false);
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
      paymentMethod: "COD",
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
              paymentMethod: values.paymentMethod as PaymentMethod,
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

          setOrderCode(response.orderCode);
          setPaymentSession(null);
          clearCart();

          if (isOnlinePaymentMethod(values.paymentMethod as PaymentMethod)) {
            try {
              const session = await createPaymentSession({ orderCode: response.orderCode });
              setPaymentSession(session);
              toast.success("Đơn hàng đã tạo. Tiếp tục hoàn tất thanh toán online.", {
                description: `Mã đơn ${response.orderCode} đang chờ xác nhận thanh toán.`,
              });
            } catch (sessionError) {
              toast.warning("Đơn hàng đã tạo nhưng chưa khởi tạo được phiên thanh toán online.", {
                description: sessionError instanceof Error ? sessionError.message : `Mã đơn ${response.orderCode}.`,
              });
            }
            return;
          }

          toast.success("Đặt hàng thành công.", {
            description: `Mã đơn của bạn là ${response.orderCode}.`,
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể tạo đơn hàng lúc này.");
        }
      })();
    });
  }

  async function handleConfirmMockPayment() {
    if (!paymentSession?.canConfirmMock) {
      return;
    }

    setIsPaymentConfirming(true);
    try {
      const updatedSession = await confirmMockPayment({
        orderCode: paymentSession.orderCode,
        referenceToken: paymentSession.referenceToken,
      });
      setPaymentSession(updatedSession);
      toast.success("Đã xác nhận thanh toán online.", {
        description: `Đơn ${updatedSession.orderCode} đã chuyển sang trạng thái đã thanh toán.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận thanh toán.");
    } finally {
      setIsPaymentConfirming(false);
    }
  }

  if (isReady && isAuthenticated && isAdmin) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center py-20">
        <div className="surface-strong mx-auto max-w-4xl rounded-[2.4rem] px-8 py-12 text-center">
          <BrandMark compact className="justify-center" />
          <div className="mt-6 font-display text-4xl font-semibold text-[var(--foreground-hero)]">Tài khoản quản trị không hỗ trợ mua hàng</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
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
          <div className="mt-6 font-display text-4xl font-semibold text-[var(--foreground-hero)]">Giỏ hàng đang trống</div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
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
              <p className="max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
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
                <div key={title} className="rounded-[1.6rem] border border-[var(--line)] bg-white/62 p-4">
                  <div className="font-semibold text-[var(--foreground-hero)]">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-admin rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="utility-label">Tóm tắt</div>
                <div className="mt-2 font-display text-3xl font-semibold text-[var(--foreground-hero)]">
                  {formatVnd(total)}
                </div>
              </div>
              <Badge variant="secondary">{items.length} dòng sản phẩm</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={`${item.shoeSlug}-${item.sizeLabel}`} className="rounded-[1.6rem] border border-[var(--line)] bg-white/62 p-4">
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
                      <div className="font-display text-xl font-semibold text-[var(--foreground-hero)]">{item.shoeName}</div>
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
                          <div className="flex h-10 min-w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/70 px-3 text-sm font-semibold text-[var(--foreground-hero)]">
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
                      <div className="text-right font-semibold text-[var(--foreground-hero)]">
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

            <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-5">
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Phí giao hàng</span>
                <span>{formatVnd(shippingFee)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Giảm giá</span>
                <span>-{formatVnd(discountAmount)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-lg font-semibold text-[var(--foreground-hero)]">
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
                <div className="mt-2 font-display text-3xl font-semibold text-[var(--foreground-hero)]">
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
                    className="rounded-[1.7rem] border border-[var(--line)] bg-white/62 p-4 text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[var(--foreground-hero)]">{address.label}</div>
                      {address.defaultAddress ? <Badge>Mặc định</Badge> : null}
                    </div>
                    <div className="mt-2 text-sm text-[var(--muted)]">
                      {address.recipientName} • {address.phone}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {address.addressLine}, {address.city}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-5 text-sm leading-7 text-[var(--muted)]">
                {isAuthenticated
                  ? "Chưa có địa chỉ nào được lưu. Bạn vẫn có thể hoàn tất đơn bằng cách nhập tay ở form bên phải."
                  : "Bạn có thể đặt hàng như khách. Đăng nhập hoặc đăng ký để lưu địa chỉ cho những lần mua sau."}
              </div>
            )}

            <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-5">
              <div className="text-sm font-semibold text-[var(--foreground-hero)]">Phương thức giao hàng</div>
              {shippingMethods.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`rounded-[1.5rem] border p-4 transition ${
                        selectedShipping?.slug === method.slug
                          ? "border-[var(--line-strong)] bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(244,248,255,0.7))]"
                          : "border-[var(--line)] bg-white/62"
                      }`}
                    >
                      <input type="radio" value={method.slug} {...form.register("shippingMethodSlug")} className="sr-only" />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[var(--foreground-hero)]">{method.name}</div>
                          <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{method.description}</div>
                          <div className="mt-2 text-sm text-[var(--muted)]">{method.etaLabel}</div>
                        </div>
                        <div className="text-sm font-semibold text-[var(--foreground-hero)]">{formatVnd(method.fee)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/62 p-4 text-sm leading-7 text-[var(--muted)]">
                  Chưa thể tải phương thức giao hàng từ backend. Khi dữ liệu sẵn sàng, các lựa chọn giao hàng sẽ xuất hiện tại đây.
                </div>
              )}
            </div>

            {promotions.length > 0 ? (
              <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-5">
                <div className="text-sm font-semibold text-[var(--foreground-hero)]">Ưu đãi</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {promotions.map((promotion) => (
                    <button
                      key={promotion.id}
                      type="button"
                      onClick={() => form.setValue("promotionCode", promotion.code)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedPromotion?.code === promotion.code
                          ? "border-transparent bg-[linear-gradient(135deg,var(--brand-gold),#efc57e,var(--brand-rose))] text-[var(--brand-ink)]"
                          : "border-[var(--line)] bg-white/70 text-[var(--foreground)]"
                      }`}
                    >
                      {promotion.code}
                    </button>
                  ))}
                </div>
                {selectedPromotion ? (
                  <div className="mt-4 rounded-[1.4rem] border border-[var(--line)] bg-white/70 p-4">
                    <div className="font-medium text-[var(--foreground-hero)]">{selectedPromotion.title}</div>
                    <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{selectedPromotion.description}</div>
                    <div className="mt-3">
                      <Badge variant="warning">{selectedPromotion.discountLabel}</Badge>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : checkoutIsDegraded ? (
              <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-5 text-sm leading-7 text-[var(--muted)]">
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

              <div className="space-y-3">
                <div className="text-sm font-semibold text-[var(--foreground-hero)]">Phương thức thanh toán</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                    <label
                      key={value}
                      className={`rounded-[1.5rem] border p-4 text-sm transition ${
                        paymentMethod === value
                          ? "border-[var(--line-strong)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(244,248,255,0.74))]"
                          : "border-[var(--line)] bg-white/62"
                      }`}
                    >
                      <input type="radio" value={value} {...form.register("paymentMethod")} className="sr-only" />
                      <div className="flex items-center gap-2 font-medium text-[var(--foreground-hero)]">
                        {value === "COD" ? <Truck /> : <CreditCard />}
                        {label}
                      </div>
                      <div className="mt-2 text-[var(--muted)]">
                        {value === "COD" && "COD vẫn có chỗ đứng, nhưng được trình bày như một option chính thức chứ không phải note phụ."}
                        {value === "BANK_TRANSFER" && "Chuyển khoản thủ công phù hợp khi đối soát theo batch với fulfillment."}
                        {value === "CARD" && "Thanh toán thẻ online qua phiên checkout bảo mật, phù hợp luồng mua nhanh."}
                        {value === "BANK_QR" && "Quét QR ngân hàng để chuyển khoản tức thì với nội dung đối soát tự động."}
                        {value === "EWALLET" && "Thanh toán qua ví điện tử, giữ trải nghiệm mobile-first cho khách hàng."}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-[var(--line)] bg-white/58 p-4 text-sm text-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 text-[var(--accent)]" />
                  <span>Checkout này được thiết kế theo operational glass: surface sáng hơn, blur nhẹ hơn và mọi thông tin quan trọng phải đọc được ngay.</span>
                </div>
              </div>

              {orderCode ? (
                <div className="rounded-[1.5rem] border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Đơn hàng đã được tạo thành công. Mã đơn: <strong>{orderCode}</strong>.
                </div>
              ) : null}

              {paymentSession ? (
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Phiên thanh toán online</div>
                      <div className="mt-1 font-semibold text-[var(--foreground-hero)]">
                        {PAYMENT_METHOD_LABELS[paymentSession.method]} • {formatVnd(paymentSession.amount)}
                      </div>
                    </div>
                    <Badge variant={paymentSession.status === "PAID" ? "success" : "warning"}>
                      {paymentSession.status === "PAID" ? "Đã thanh toán" : "Đang chờ thanh toán"}
                    </Badge>
                  </div>

                  {paymentSession.instruction ? (
                    <div className="mt-3 text-sm leading-7 text-[var(--muted)]">{paymentSession.instruction}</div>
                  ) : null}

                  {paymentSession.qrImageUrl ? (
                    <div className="mt-4">
                      <Image
                        src={paymentSession.qrImageUrl}
                        alt="Mã QR thanh toán"
                        width={220}
                        height={220}
                        className="rounded-2xl border border-[var(--line)] bg-white p-2"
                      />
                    </div>
                  ) : null}

                  {paymentSession.qrPayload ? (
                    <div className="mt-3 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 text-xs text-[var(--foreground-dim)]">
                      Nội dung chuyển khoản: {paymentSession.qrPayload}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {paymentSession.checkoutUrl ? (
                      <Button asChild type="button" variant="secondary" size="sm">
                        <a href={paymentSession.checkoutUrl} target="_blank" rel="noreferrer">
                          Mở trang thanh toán
                        </a>
                      </Button>
                    ) : null}

                    {paymentSession.walletDeepLink ? (
                      <Button asChild type="button" variant="secondary" size="sm">
                        <a href={paymentSession.walletDeepLink} target="_blank" rel="noreferrer">
                          Mở ứng dụng ví
                        </a>
                      </Button>
                    ) : null}

                    {paymentSession.canConfirmMock ? (
                      <Button type="button" size="sm" disabled={isPaymentConfirming} onClick={() => void handleConfirmMockPayment()}>
                        {isPaymentConfirming ? "Đang xác nhận..." : "Tôi đã thanh toán"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {checkoutGuardCopy ? (
                <div className="rounded-[1.5rem] border border-amber-300/50 bg-amber-50/80 px-4 py-3 text-sm leading-7 text-amber-950">
                  {checkoutGuardCopy}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                {!isAuthenticated ? (
                  <div className="text-sm text-[var(--muted)]">
                    Muốn lưu lịch sử mua và địa chỉ?{" "}
                    <Link href="/dang-nhap" className="text-[var(--foreground-hero)] underline decoration-[var(--line-strong)] underline-offset-4">
                      Đăng nhập ngay
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="text-sm text-[var(--muted)]">Đơn này sẽ xuất hiện cùng địa chỉ và lịch sử mua trong khu tài khoản.</div>
                )}

                <Button type="submit" disabled={isPending || !isCheckoutReadyForSubmit}>
                  {isPending
                    ? "Đang gửi đơn..."
                    : checkoutDependencyMode === "loading"
                      ? "Đang tải phương thức..."
                      : isCheckoutReadyForSubmit
                        ? "Xác nhận đặt hàng"
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
