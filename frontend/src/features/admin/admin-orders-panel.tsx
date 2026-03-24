import { Eye, Search } from "@/components/icons";

import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { ORDER_STATUS_OPTIONS } from "@/features/admin/admin-constants";
import { formatVnd } from "@/lib/currency";
import { formatDateTime } from "@/lib/presentation";
import type { OrderResponse } from "@/lib/types";

type AdminOrdersPanelProps = {
  orders: OrderResponse[];
  orderQuery: string;
  orderStatusFilter: string;
  isPending: boolean;
  onOrderQueryChange: (value: string) => void;
  onOrderStatusFilterChange: (value: string) => void;
  onFilter: () => void;
  onOpenDetail: (orderId: number) => void;
};

export function AdminOrdersPanel({
  orders,
  orderQuery,
  orderStatusFilter,
  isPending,
  onOrderQueryChange,
  onOrderStatusFilterChange,
  onFilter,
  onOpenDetail,
}: AdminOrdersPanelProps) {
  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Đơn hàng"
        description="Theo dõi vòng đời đơn hàng, tìm theo mã đơn, tên khách hoặc email và cập nhật trạng thái xử lý."
      />
      <AdminPanelBody className="space-y-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_240px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={orderQuery}
              onChange={(event) => onOrderQueryChange(event.target.value)}
              placeholder="Tìm theo mã đơn, tên khách hoặc email"
              className="pl-11"
            />
          </div>
          <select
            value={orderStatusFilter}
            onChange={(event) => onOrderStatusFilterChange(event.target.value)}
            className="flex h-11 w-full rounded-2xl border border-white/12 bg-[#08101d] px-4 py-2 text-sm text-white outline-none focus:border-amber-300/70"
          >
            <option value="" className="bg-slate-950">
              Tất cả trạng thái
            </option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value} className="bg-slate-950">
                {status.label}
              </option>
            ))}
          </select>
          <Button type="button" onClick={onFilter} disabled={isPending} className="min-w-36">
            {isPending ? "Đang lọc..." : "Lọc đơn"}
          </Button>
        </div>

        <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-2">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead className="text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-white">{order.orderCode}</TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-sm text-white/45">{order.email}</div>
                    </TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{formatVnd(order.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" variant="secondary" onClick={() => onOpenDetail(order.id)}>
                        <Eye className="h-4 w-4" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminPanelBody>
    </AdminPanel>
  );
}
