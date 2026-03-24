"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag } from "@/components/icons";
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
    <div className="surface-strong space-y-6 rounded-[2rem] p-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{shoe.brand}</Badge>
          {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
          {shoe.newArrival ? <Badge>Vừa lên kệ</Badge> : null}
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold text-white">{shoe.name}</h2>
          <div className="mt-3 text-3xl font-semibold text-[var(--brand-gold)]">{formatVnd(shoe.price)}</div>
        </div>
        <p className="text-sm leading-7 text-[var(--muted)]">{shoe.shortDescription}</p>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(9,11,18,0.52)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Chọn size</div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">Tồn kho: {shoe.totalStock}</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                className={`rounded-2xl border px-3 py-3 text-sm transition ${
                  active
                    ? "border-transparent bg-[linear-gradient(135deg,var(--brand-gold),#dbc395,var(--brand-rose))] text-[var(--brand-ink)]"
                    : size.stockQuantity > 0
                      ? "border-white/12 bg-white/6 text-white hover:border-white/28 hover:bg-white/10"
                      : "cursor-not-allowed border-white/8 bg-white/4 text-white/28 line-through"
                }`}
              >
                EU {size.sizeLabel}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-white/58">
          {isAvailable
            ? `Còn ${selectedStock?.stockQuantity} đôi cho size EU ${selectedSize}.`
            : `Size EU ${selectedSize} tạm hết hàng, vui lòng chọn size khác.`}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(9,11,18,0.52)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Số lượng</div>
          <div className="text-sm text-white/55">Tạm tính: {formatVnd(lineTotal)}</div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus />
          </Button>
          <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-4 text-lg font-semibold text-white">
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

      <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-[var(--muted)]">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 text-[var(--success)]" />
          <span>Thanh toán COD hoặc chuyển khoản ngân hàng.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 text-[var(--success)]" />
          <span>Đơn hàng đã đăng nhập sẽ được lưu trong khu tài khoản.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 text-[var(--success)]" />
          <span>SKU: {shoe.sku}</span>
        </div>
      </div>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/checkout">Mở thanh toán</Link>
      </Button>
    </div>
  );
}
