"use client";

import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENT_METHOD_LABELS } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { formatDateTime } from "@/lib/presentation";
import type { OrderDetail } from "@/lib/types";

type OrderDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
  footer?: React.ReactNode;
};

export function OrderDetailDialog({ open, onOpenChange, order, footer }: OrderDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {!order ? null : (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-3">
                <span>Chi tiết đơn {order.orderCode}</span>
                <OrderStatusBadge status={order.status} />
              </DialogTitle>
              <DialogDescription>
                Đặt lúc {formatDateTime(order.createdAt)} • Thanh toán: {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">Khách hàng</div>
                <div className="space-y-2 text-sm text-white/75">
                  <div>{order.customerName}</div>
                  <div>{order.email}</div>
                  <div>{order.phone}</div>
                  <div>{order.addressLine}</div>
                  <div>{order.city}</div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">Tổng quan</div>
                <div className="space-y-2 text-sm text-white/75">
                  <div>Tổng tiền: {formatVnd(order.totalAmount)}</div>
                  <div>Cập nhật lần cuối: {formatDateTime(order.updatedAt)}</div>
                  <div>Ghi chú: {order.notes?.trim() ? order.notes : "Không có"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-white/40">Sản phẩm</div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${item.shoeSlug}-${item.sizeLabel}`}
                    className="rounded-[1.25rem] border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{item.shoeName}</div>
                        <div className="mt-1 text-sm text-white/55">
                          Cỡ EU {item.sizeLabel} • Số lượng {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/50">{formatVnd(item.price)} / đôi</div>
                        <div className="mt-1 font-semibold text-amber-200">{formatVnd(item.lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {footer ? (
              <>
                <Separator />
                <div>{footer}</div>
              </>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
