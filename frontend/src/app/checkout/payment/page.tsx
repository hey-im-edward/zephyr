"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmMockPayment, createPaymentSession, getPaymentSessionStatus, PAYMENT_METHOD_LABELS } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import type { PaymentSessionData, PaymentStatus } from "@/lib/types";

const POLLING_INTERVAL_MS = 5000;

const VNPAY_PLACEHOLDER_TMN_CODES = new Set(["TESTTMNCODE", "DEMO", "SAMPLE"]);

function getStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "PENDING_ACTION":
      return "Đang chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED":
      return "Thanh toán thất bại";
    case "EXPIRED":
      return "Phiên đã hết hạn";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function getStatusBadgeClass(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "border-emerald-300/50 bg-emerald-50 text-emerald-700";
    case "FAILED":
    case "EXPIRED":
    case "CANCELLED":
      return "border-rose-300/50 bg-rose-50 text-rose-700";
    case "PENDING_ACTION":
    default:
      return "border-amber-300/50 bg-amber-50 text-amber-900";
  }
}

function getCheckoutTmnCode(checkoutUrl: string | null | undefined) {
  if (!checkoutUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(checkoutUrl);
    const tmnCode = parsedUrl.searchParams.get("vnp_TmnCode");
    return tmnCode?.trim() ? tmnCode.trim() : null;
  } catch {
    return null;
  }
}

function isPlaceholderTmnCode(tmnCode: string | null) {
  if (!tmnCode) {
    return true;
  }

  return VNPAY_PLACEHOLDER_TMN_CODES.has(tmnCode.toUpperCase());
}

function CheckoutPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderCode = (searchParams.get("orderCode") ?? "").trim();
  const initialReferenceToken = (searchParams.get("referenceToken") ?? "").trim();
  const gatewayResult = (searchParams.get("gatewayResult") ?? "").trim();
  const gatewayResponseCode = (searchParams.get("responseCode") ?? "").trim();
  const gatewayTransactionStatus = (searchParams.get("transactionStatus") ?? "").trim();

  const [session, setSession] = useState<PaymentSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmingDemo, setIsConfirmingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollingRef = useRef(false);
  const paidToastRef = useRef(false);
  const gatewayToastRef = useRef<string | null>(null);

  const syncUrlReference = useCallback(
    (nextReferenceToken: string) => {
      if (!orderCode || !nextReferenceToken) return;

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("orderCode", orderCode);
      nextParams.set("referenceToken", nextReferenceToken);
      router.replace(`/checkout/payment?${nextParams.toString()}`);
    },
    [orderCode, router, searchParams],
  );

  const refreshSession = useCallback(
    async (mode: "bootstrap" | "manual" | "poll") => {
      if (!orderCode) {
        setErrorMessage("Thiếu mã đơn hàng. Hãy quay lại checkout để tạo phiên thanh toán mới.");
        setIsLoading(false);
        return;
      }

      if (mode === "bootstrap") {
        setIsLoading(true);
      }

      if (mode === "manual") {
        setIsRefreshing(true);
      }

      try {
        setErrorMessage(null);

        const currentReference = session?.referenceToken ?? initialReferenceToken;
        let nextSession: PaymentSessionData | null = null;

        if (currentReference) {
          try {
            nextSession = await getPaymentSessionStatus(orderCode, currentReference);
          } catch {
            if (mode !== "poll") {
              nextSession = await createPaymentSession({ orderCode });
            }
          }
        } else {
          nextSession = await createPaymentSession({ orderCode });
        }

        if (!nextSession) {
          return;
        }

        const previousStatus = session?.status;
        setSession(nextSession);

        if (nextSession.referenceToken && nextSession.referenceToken !== currentReference) {
          syncUrlReference(nextSession.referenceToken);
        }

        if (mode === "manual") {
          if (!previousStatus) {
            toast.success("Đã đồng bộ trạng thái thanh toán mới.");
          } else if (previousStatus !== nextSession.status) {
            toast.success("Trạng thái thanh toán đã thay đổi.", {
              description: `${getStatusLabel(previousStatus)} -> ${getStatusLabel(nextSession.status)}`,
            });
          } else if (nextSession.status === "PENDING_ACTION") {
            toast.message("Chưa nhận xác nhận thanh toán từ VNPay.", {
              description: "Hãy hoàn tất thanh toán trên cổng VNPay rồi bấm kiểm tra lại.",
            });
          } else {
            toast.message("Trạng thái thanh toán không đổi.", {
              description: `Hiện tại: ${getStatusLabel(nextSession.status)}.`,
            });
          }
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không thể tải phiên thanh toán.");
      } finally {
        if (mode === "bootstrap") {
          setIsLoading(false);
        }

        if (mode === "manual") {
          setIsRefreshing(false);
        }
      }
    },
    [initialReferenceToken, orderCode, session?.referenceToken, session?.status, syncUrlReference],
  );

  useEffect(() => {
    void refreshSession("bootstrap");
  }, [refreshSession]);

  useEffect(() => {
    if (!session || session.status !== "PENDING_ACTION") {
      return;
    }

    const timer = setInterval(() => {
      if (pollingRef.current) {
        return;
      }

      pollingRef.current = true;
      void refreshSession("poll").finally(() => {
        pollingRef.current = false;
      });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [refreshSession, session]);

  useEffect(() => {
    if (!session || session.status !== "PAID" || paidToastRef.current) {
      return;
    }

    paidToastRef.current = true;
    toast.success("Thanh toán đã được xác nhận.", {
      description: `Mã đơn ${session.orderCode} đã nhận tiền thành công.`,
    });
  }, [session]);

  useEffect(() => {
    if (!gatewayResult) {
      return;
    }

    const toastKey = [gatewayResult, gatewayResponseCode, gatewayTransactionStatus].join("|");
    if (gatewayToastRef.current === toastKey) {
      return;
    }

    gatewayToastRef.current = toastKey;

    if (gatewayResult === "success") {
      toast.success("Đã quay về từ cổng VNPay.", {
        description: "Hệ thống đang đồng bộ trạng thái đơn hàng trên website.",
      });
    } else {
      toast.warning("VNPay chưa xác nhận thanh toán thành công.", {
        description: gatewayResponseCode
          ? `responseCode=${gatewayResponseCode}, transactionStatus=${gatewayTransactionStatus || "N/A"}.`
          : "Bạn có thể mở cổng VNPay lại hoặc tạo phiên mới.",
      });
    }
  }, [gatewayResponseCode, gatewayResult, gatewayTransactionStatus]);

  const paymentStatus = session?.status;
  const isPendingPayment = paymentStatus === "PENDING_ACTION";
  const qrPayload = session?.qrPayload ?? session?.checkoutUrl ?? null;

  const qrImageUrl = useMemo(() => {
    if (!qrPayload) {
      return null;
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);

  const checkoutTmnCode = useMemo(() => getCheckoutTmnCode(session?.checkoutUrl), [session?.checkoutUrl]);
  const hasPlaceholderTmnCode = isPlaceholderTmnCode(checkoutTmnCode);

  const checkoutBlockingError = useMemo(() => {
    if (!session?.checkoutUrl) {
      return "Phiên thanh toán chưa có checkoutUrl hợp lệ. Hãy bấm 'Kiểm tra ngay' hoặc tạo lại phiên.";
    }

    return null;
  }, [session?.checkoutUrl]);

  const checkoutConfigWarning = useMemo(() => {
    if (hasPlaceholderTmnCode) {
      return "TMN Code hiện đang là placeholder. Cần cấu hình APP_PAYMENT_VNPAY_TMN_CODE và APP_PAYMENT_VNPAY_HASH_SECRET thật của sandbox để tránh lỗi code=72.";
    }

    return null;
  }, [hasPlaceholderTmnCode]);

  const instruction = useMemo(() => {
    if (!session?.instruction) {
      return "Nhấn mở cổng VNPay để thanh toán. Hệ thống sẽ tự động kiểm tra trạng thái nhận tiền realtime.";
    }
    return session.instruction;
  }, [session?.instruction]);

  const qrShareValue = session?.checkoutUrl ?? qrPayload ?? null;

  const canConfirmLocalDemo = Boolean(
    session
      && session.provider === "VNPAY"
      && session.status === "PENDING_ACTION"
      && hasPlaceholderTmnCode,
  );

  if (!orderCode) {
    return (
      <div className="section-shell py-16">
        <div className="page-frame">
          <div className="surface-strong mx-auto max-w-3xl rounded-[2.2rem] p-8 text-center">
            <BrandMark compact className="justify-center" />
            <div className="mt-6 font-display text-4xl font-semibold text-(--foreground-hero)">Thiếu mã đơn hàng</div>
            <p className="mt-4 text-sm leading-7 text-(--muted)">
              Trang này cần tham số orderCode. Hãy quay lại checkout để tạo đơn và mở phiên thanh toán mới.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/checkout">Quay lại checkout</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/catalog">Mở catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-12">
      <div className="page-frame space-y-8">
        <section className="surface-strong rounded-[2.4rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge>Bước 2/2</Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold text-(--foreground-hero)">
                Hoàn tất thanh toán để xác nhận đơn hàng
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-(--muted-strong)">
                Đơn đã được tạo ở trạng thái chờ. Chỉ khi hệ thống nhận xác nhận thanh toán thành công thì đơn mới được coi là hoàn tất.
              </p>
            </div>
            <div className="rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--muted)">
              <div>Mã đơn: <span className="font-semibold text-(--foreground-hero)">{orderCode}</span></div>
              {session?.referenceToken ? <div className="mt-1">Mã phiên: <span className="font-semibold text-(--foreground-hero)">{session.referenceToken}</span></div> : null}
            </div>
          </div>
        </section>

        {gatewayResult ? (
          <section className="rounded-2xl border border-sky-300/45 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            <div className="font-semibold">Phiên quay về từ VNPay đã được ghi nhận</div>
            <div className="mt-1 leading-7">
              {gatewayResult === "success"
                ? "Bạn đã rời cổng VNPay và quay lại website. Bấm 'Kiểm tra ngay' nếu muốn đồng bộ trạng thái tức thì."
                : "VNPay trả về trạng thái chưa thành công. Bạn có thể mở lại cổng hoặc tạo phiên mới."}
            </div>
            {gatewayResponseCode ? (
              <div className="mt-1 text-xs text-sky-700">
                responseCode={gatewayResponseCode}; transactionStatus={gatewayTransactionStatus || "N/A"}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <div className="surface-admin rounded-[2.2rem] p-6">
            <div className="utility-label">Dịch vụ thanh toán</div>
            <div className="mt-3 font-display text-3xl font-semibold text-(--foreground-hero)">Chọn cổng thanh toán</div>

            <button
              type="button"
              className="mt-5 w-full rounded-3xl border border-(--line-strong) bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(228,241,255,0.88))] p-5 text-left shadow-[0_14px_28px_rgba(58,94,136,0.16)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-(--foreground-hero)">VNPay</div>
                  <div className="mt-1 text-sm text-(--muted)">Thanh toán qua QR / app ngân hàng / thẻ ngay trên cổng VNPay.</div>
                </div>
                <Badge variant="secondary">Đang hỗ trợ</Badge>
              </div>
            </button>

            <div className="mt-5 rounded-2xl border border-(--line) bg-white/62 p-4 text-sm leading-7 text-(--muted)">
              {instruction}
            </div>

            {session?.channel === "BANK_QR" && isPendingPayment ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-(--line) bg-white/66 p-4 sm:grid-cols-[auto_1fr]">
                <div className="mx-auto w-full max-w-47.5 overflow-hidden rounded-2xl border border-(--line-strong) bg-white p-2">
                  {qrImageUrl ? (
                    <Image
                      src={qrImageUrl}
                      alt="QR thanh toán VNPay"
                      width={320}
                      height={320}
                      className="h-auto w-full"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-47.5 items-center justify-center text-center text-xs text-(--muted)">
                      Chưa có dữ liệu QR khả dụng cho phiên hiện tại.
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm leading-7 text-(--muted)">
                  <div className="font-semibold text-(--foreground-hero)">Quét QR để mở nhanh phiên thanh toán VNPay</div>
                  <p>
                    Khi quét bằng app ngân hàng, bạn sẽ được chuyển trực tiếp đến cổng VNPay cho đúng đơn hàng này. Nếu app không mở được,
                    hãy dùng nút &quot;Mở cổng VNPay&quot;.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (!qrShareValue) {
                          toast.error("Phiên chưa có link thanh toán để sao chép.");
                          return;
                        }

                        void navigator.clipboard.writeText(qrShareValue).then(
                          () => toast.success("Đã sao chép link thanh toán."),
                          () => toast.error("Không thể sao chép link thanh toán."),
                        );
                      }}
                    >
                      Sao chép link thanh toán
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {checkoutBlockingError || checkoutConfigWarning ? (
              <div className="mt-5 rounded-2xl border border-amber-300/45 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                {checkoutBlockingError ?? checkoutConfigWarning}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={!session?.checkoutUrl || !isPendingPayment || isLoading}
                onClick={() => {
                  if (checkoutBlockingError) {
                    toast.error(checkoutBlockingError);
                    return;
                  }

                  if (checkoutConfigWarning) {
                    toast.warning(checkoutConfigWarning, {
                      description: "Hệ thống vẫn mở cổng để bạn kiểm tra, nhưng giao dịch sandbox có thể trả code=72 cho tới khi cập nhật đúng TMN/secret.",
                    });
                  }

                  if (!session?.checkoutUrl) {
                    toast.error("Phiên hiện tại chưa có checkoutUrl hợp lệ.");
                    return;
                  }
                  window.open(session.checkoutUrl, "_blank", "noopener,noreferrer");
                  toast.message("Đã mở cổng VNPay ở tab mới.", {
                    description: "Sau khi thanh toán trên sandbox, dùng nút quay về website để về trang trạng thái đơn.",
                  });
                }}
              >
                Mở cổng VNPay
              </Button>

              <Button type="button" variant="secondary" disabled={isRefreshing || isLoading} onClick={() => void refreshSession("manual")}>
                {isRefreshing ? "Đang kiểm tra..." : "Kiểm tra ngay"}
              </Button>

              {canConfirmLocalDemo ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isConfirmingDemo || isLoading || !session}
                  onClick={() => {
                    if (!session) {
                      return;
                    }

                    setIsConfirmingDemo(true);
                    void confirmMockPayment({
                      orderCode: session.orderCode,
                      referenceToken: session.referenceToken,
                    })
                      .then((nextSession) => {
                        setSession(nextSession);
                        toast.success("Đã xác nhận demo thanh toán local.", {
                          description: "Bây giờ bạn có thể bấm 'Xem đơn hàng của tôi' để kiểm tra lịch sử đơn và trạng thái.",
                        });
                      })
                      .catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Không thể xác nhận demo local lúc này.");
                      })
                      .finally(() => {
                        setIsConfirmingDemo(false);
                      });
                  }}
                >
                  {isConfirmingDemo ? "Đang xác nhận demo..." : "Xác nhận demo local"}
                </Button>
              ) : null}
            </div>

            {canConfirmLocalDemo ? (
              <div className="mt-5 rounded-2xl border border-sky-300/45 bg-sky-50 p-4 text-sm leading-7 text-sky-800">
                Bạn đang dùng TMN placeholder nên sandbox có thể trả lỗi code=72. Nếu muốn test luồng demo như thật trên local,
                bấm <strong>Xác nhận demo local</strong> để mô phỏng callback thành công và kiểm tra cập nhật lịch sử đơn ngay.
              </div>
            ) : null}
          </div>

          <div className="surface-strong rounded-[2.2rem] p-6">
            <div className="utility-label">Realtime status</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="font-display text-3xl font-semibold text-(--foreground-hero)">Trạng thái thanh toán</div>
              {paymentStatus ? (
                <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusBadgeClass(paymentStatus)}`}>
                  {getStatusLabel(paymentStatus)}
                </span>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-5 rounded-2xl border border-(--line) bg-white/62 p-4 text-sm text-(--muted)">
                Đang khởi tạo phiên thanh toán...
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-rose-300/50 bg-rose-50 p-4 text-sm leading-7 text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {session ? (
              <div className="mt-5 space-y-3 rounded-2xl border border-(--line) bg-white/62 p-4 text-sm">
                <div className="flex items-center justify-between gap-3 text-(--muted)">
                  <span>Phương thức</span>
                  <span className="font-semibold text-(--foreground-hero)">{PAYMENT_METHOD_LABELS[session.method]}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-(--muted)">
                  <span>Số tiền</span>
                  <span className="font-semibold text-(--foreground-hero)">{formatVnd(session.amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-(--muted)">
                  <span>Cổng xử lý</span>
                  <span className="font-semibold text-(--foreground-hero)">{session.provider}</span>
                </div>
                {session.expiresAt ? (
                  <div className="flex items-center justify-between gap-3 text-(--muted)">
                    <span>Hạn thanh toán</span>
                    <span className="font-semibold text-(--foreground-hero)">{new Date(session.expiresAt).toLocaleString("vi-VN")}</span>
                  </div>
                ) : null}
                {session.paidAt ? (
                  <div className="flex items-center justify-between gap-3 text-(--muted)">
                    <span>Đã thanh toán lúc</span>
                    <span className="font-semibold text-(--foreground-hero)">{new Date(session.paidAt).toLocaleString("vi-VN")}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {paymentStatus === "PAID" ? (
              <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Thanh toán thành công. Đơn hàng đã được xác nhận hoàn tất theo đúng luồng online payment.
              </div>
            ) : null}

            {paymentStatus && ["FAILED", "EXPIRED", "CANCELLED"].includes(paymentStatus) ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" onClick={() => void refreshSession("manual")}>Tạo lại phiên thanh toán</Button>
                <Button asChild variant="secondary">
                  <Link href="/checkout">Quay lại checkout</Link>
                </Button>
              </div>
            ) : null}

            {paymentStatus === "PAID" ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/tai-khoan?focusOrderCode=${encodeURIComponent(orderCode)}`}>Xem đơn hàng của tôi</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/catalog">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function CheckoutPaymentFallback() {
  return (
    <div className="section-shell py-16">
      <div className="page-frame">
        <div className="surface-strong mx-auto max-w-3xl rounded-[2.2rem] p-8 text-center">
          <BrandMark compact className="justify-center" />
          <div className="mt-6 font-display text-4xl font-semibold text-(--foreground-hero)">Đang tải phiên thanh toán</div>
          <p className="mt-4 text-sm leading-7 text-(--muted)">Vui lòng đợi trong giây lát để hệ thống đồng bộ trạng thái thanh toán realtime.</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<CheckoutPaymentFallback />}>
      <CheckoutPaymentPageContent />
    </Suspense>
  );
}
