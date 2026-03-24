import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/presentation";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === "DELIVERED"
      ? "success"
      : status === "CANCELLED"
        ? "danger"
        : status === "PENDING"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
