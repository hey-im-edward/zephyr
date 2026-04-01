"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag, Truck } from "@/components/icons";
import { toast } from "sonner";

import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/currency";
import type { ShoeDetail } from "@/lib/types";

export function PurchaseBox({ shoe }: { shoe: ShoeDetail }) {
  const router = useRouter();
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
  const lineTotal = shoe.price * quantity;

  function commitAddToCart(redirectToCheckout = false) {
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
    <div className="surface-strong space-y-6 rounded-[2.3rem] p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{shoe.brand}</Badge>
          {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
          {shoe.newArrival ? <Badge>Vừa lên kệ</Badge> : null}
          {shoe.campaignBadge ? <Badge variant="warning">{shoe.campaignBadge}</Badge> : null}
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-[var(--foreground-hero)]">
            {shoe.name}
          </h2>
          <div className="text-[2rem] font-bold text-[var(--foreground-hero)]">{formatVnd(shoe.price)}</div>
          <p className="text-sm leading-7 text-[var(--muted)]">{shoe.shortDescription}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-[1.8rem] border border-white/82 bg-white/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--foreground-hero)]">Chọn size</div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Tổng tồn {shoe.totalStock}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                className={`rounded-[1.2rem] border px-3 py-3 text-sm transition ${
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
        <div className="text-sm text-[var(--muted)]">
          {isAvailable
            ? `Còn ${selectedStock?.stockQuantity} đôi cho size EU ${selectedSize}.`
            : `Size EU ${selectedSize} tạm hết hàng, vui lòng chọn size khác.`}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.8rem] border border-white/82 bg-white/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--foreground-hero)]">Số lượng</div>
          <div className="text-sm text-[var(--muted)]">Tạm tính: {formatVnd(lineTotal)}</div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus />
          </Button>
          <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl border border-white/78 bg-white/42 px-4 text-lg font-bold text-[var(--foreground-hero)]">
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

      <div className="grid gap-3">
        <Button type="button" disabled={!isAvailable} onClick={() => commitAddToCart(false)}>
          <ShoppingBag />
          Thêm vào giỏ
        </Button>
        <Button type="button" variant="secondary" disabled={!isAvailable} onClick={() => commitAddToCart(true)}>
          Mua ngay
        </Button>
      </div>

      <div className="space-y-3 rounded-[1.8rem] border border-white/82 bg-white/34 p-4 text-sm text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
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
