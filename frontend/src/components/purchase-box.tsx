"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag, Truck } from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/currency";
import type { ShoeDetail } from "@/lib/types";

export function PurchaseBox({ shoe }: { shoe: ShoeDetail }) {
  const router = useRouter();
  const { isAdmin, isReady } = useAuth();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    shoe.sizeStocks.find((size) => size.stockQuantity > 0)?.sizeLabel ?? shoe.sizeStocks[0]?.sizeLabel ?? "40",
  );
  const [quantity, setQuantity] = useState(1);

  const selectedStock = useMemo(
    () => shoe.sizeStocks.find((size) => size.sizeLabel === selectedSize),
    [selectedSize, shoe.sizeStocks],
  );

  const isAvailable = (selectedStock?.stockQuantity ?? 0) > 0;
  const isPurchaseBlocked = isReady && isAdmin;
  const lineTotal = shoe.price * quantity;

  function commitAddToCart(redirectToCheckout = false) {
    if (isPurchaseBlocked) {
      toast.error("Tài khoản quản trị không được phép mua hàng.");
      return;
    }

    if (!selectedStock || !isAvailable) {
      toast.error("Size bạn chọn đã hết hàng.");
      return;
    }

    addItem(
      {
        shoeSlug: shoe.slug,
        shoeName: shoe.name,
        brand: shoe.brand,
        price: shoe.price,
        primaryImage: shoe.primaryImage,
        sizeLabel: selectedStock.sizeLabel,
      },
      quantity,
    );

    toast.success("Đã thêm vào giỏ hàng.", {
      description: `${shoe.name} - size EU ${selectedStock.sizeLabel} x${quantity}`,
    });

    if (redirectToCheckout) {
      router.push("/checkout");
    }
  }

  return (
    <div className="surface-strong space-y-4 rounded-[2rem] p-4 sm:space-y-5 sm:p-5 lg:space-y-6 lg:rounded-[2.3rem] lg:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge variant="secondary">{shoe.brand}</Badge>
          {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
          {shoe.newArrival ? <Badge>Vừa lên kệ</Badge> : null}
          {shoe.campaignBadge ? <Badge variant="warning">{shoe.campaignBadge}</Badge> : null}
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          <h2 className="font-display text-[2rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[var(--foreground-hero)] sm:text-[2.4rem] lg:text-4xl">
            {shoe.name}
          </h2>
          <div className="text-[1.7rem] font-bold text-[var(--foreground-hero)] sm:text-[2rem]">{formatVnd(shoe.price)}</div>
          <p className="text-xs leading-6 text-[var(--muted)] sm:text-sm sm:leading-7">{shoe.shortDescription}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-white/82 bg-white/34 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:space-y-4 sm:rounded-[1.8rem] sm:p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--foreground-hero)]">Chọn size</div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--foreground-dim)] sm:text-xs sm:tracking-[0.18em]">Tổng tồn {shoe.totalStock}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-4">
          {shoe.sizeStocks.map((size) => {
            const active = selectedSize === size.sizeLabel;
            return (
              <button
                key={size.sizeLabel}
                type="button"
                disabled={size.stockQuantity <= 0}
                onClick={() => {
                  setSelectedSize(size.sizeLabel);
                  setQuantity(1);
                }}
                className={`rounded-[1rem] border px-2.5 py-2.5 text-xs transition sm:rounded-[1.2rem] sm:px-3 sm:py-3 sm:text-sm ${
                  active
                    ? "border-white/62 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0.12)),linear-gradient(135deg,rgba(121,216,255,0.32),rgba(180,183,255,0.22),rgba(215,193,255,0.26))] font-semibold text-[var(--foreground-hero)] shadow-[0_14px_28px_rgba(14,26,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)]"
                    : size.stockQuantity > 0
                      ? "border-white/56 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] text-[var(--foreground)] hover:border-white/76"
                      : "cursor-not-allowed border-white/56 bg-white/18 text-[var(--foreground-dim)] line-through"
                }`}
              >
                EU {size.sizeLabel}
              </button>
            );
          })}
        </div>
        <div className="text-xs leading-6 text-[var(--muted)] sm:text-sm">
          {isAvailable
            ? `Còn ${selectedStock?.stockQuantity} đôi cho size EU ${selectedSize}.`
            : `Size EU ${selectedSize} tạm hết hàng, vui lòng chọn size khác.`}
        </div>
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-white/82 bg-white/34 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:space-y-4 sm:rounded-[1.8rem] sm:p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--foreground-hero)]">Số lượng</div>
          <div className="text-xs text-[var(--muted)] sm:text-sm">Tạm tính: {formatVnd(lineTotal)}</div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus />
          </Button>
          <div className="flex h-10 min-w-14 items-center justify-center rounded-2xl border border-white/78 bg-white/42 px-3 text-base font-bold text-[var(--foreground-hero)] sm:h-11 sm:min-w-16 sm:px-4 sm:text-lg">
            {quantity}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={!selectedStock || quantity >= selectedStock.stockQuantity}
            onClick={() =>
              setQuantity((current) => Math.min(selectedStock?.stockQuantity ?? current, current + 1))
            }
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div id="pdp-cta-zone" className="grid gap-2.5 sm:gap-3">
        <Button type="button" disabled={!isAvailable || isPurchaseBlocked} onClick={() => commitAddToCart(false)}>
          <ShoppingBag />
          Thêm vào giỏ
        </Button>
        <Button type="button" variant="secondary" disabled={!isAvailable || isPurchaseBlocked} onClick={() => commitAddToCart(true)}>
          Mua ngay
        </Button>
        {isPurchaseBlocked ? (
          <p className="rounded-[1.1rem] border border-white/78 bg-white/34 px-3 py-2 text-xs leading-6 text-[var(--muted)]">
            Tài khoản quản trị chỉ dành cho vận hành, không hỗ trợ thao tác mua hàng.
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5 rounded-[1.5rem] border border-white/82 bg-white/34 p-3 text-xs text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:space-y-3 sm:rounded-[1.8rem] sm:p-4 sm:text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 text-[var(--success)]" />
          <span>Thanh toán COD hoặc chuyển khoản ngân hàng.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 text-[var(--success)]" />
          <span>{shoe.fitNote ?? "Phom mang hằng ngày cân bằng, ưu tiên chọn true-to-size."}</span>
        </div>
        <div className="flex items-start gap-2">
          <Truck className="mt-0.5 text-[var(--accent)]" />
          <span>{shoe.deliveryNote ?? "Miễn phí giao nhanh nội thành cho đơn flagship và hỗ trợ đổi size còn tồn."}</span>
        </div>
      </div>
    </div>
  );
}
