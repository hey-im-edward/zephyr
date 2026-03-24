import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PACKING", label: "Đang đóng gói" },
  { value: "SHIPPING", label: "Đang giao hàng" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];
