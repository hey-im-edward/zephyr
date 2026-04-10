import { Eye, Search } from "@/components/icons";

import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { ORDER_STATUS_OPTIONS } from "@/features/admin/admin-constants";
import { formatVnd } from "@/lib/currency";
import { formatDateTime } from "@/lib/presentation";
import type { OrderPagination, OrderResponse } from "@/lib/types";

type AdminOrdersPanelProps = {
  orders: OrderResponse[];
  orderQuery: string;
  orderStatusFilter: string;
  orderPagination: OrderPagination;
  isPending: boolean;
  onOrderQueryChange: (value: string) => void;
  onOrderStatusFilterChange: (value: string) => void;
  onFilter: () => void;
  onOpenDetail: (orderId: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function AdminOrdersPanel({
  orders,
  orderQuery,
  orderStatusFilter,
  orderPagination,
  isPending,
  onOrderQueryChange,
  onOrderStatusFilterChange,
  onFilter,
  onOpenDetail,
  onPreviousPage,
  onNextPage,
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
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={orderQuery}
              onChange={(event) => onOrderQueryChange(event.target.value)}
              placeholder="Tìm theo mã đơn, tên khách hoặc email"
              className="pl-11"
            />
          </div>
          <div className="relative w-full">
            <select
              value={orderStatusFilter}
              onChange={(event) => onOrderStatusFilterChange(event.target.value)}
              className="flex h-11 w-full appearance-none rounded-2xl border border-(--line) bg-white/72 px-4 py-2 text-sm font-medium text-(--foreground-hero) shadow-sm outline-none transition-colors focus:border-brand hover:bg-white/90"
            >
              <option value="" className="bg-white">
                Tất cả trạng thái
              </option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value} className="bg-white">
                  {status.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          <Button type="button" onClick={onFilter} disabled={isPending} className="min-w-36 shadow-md transition-transform hover:-translate-y-0.5">
            {isPending ? "Đang lọc..." : "Lọc đơn"}
          </Button>
        </div>

        <div className="rounded-[1.6rem] border border-(--line) bg-white/48 p-2">
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
                    <TableCell className="font-medium text-(--foreground-hero)">{order.orderCode}</TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-sm text-(--foreground-dim)">{order.email}</div>
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 pb-2">
            <div className="text-sm text-(--muted)">
              Trang <span className="font-semibold text-(--foreground-hero)">{orderPagination.page}</span> / {orderPagination.totalPages}
              {" "}
              • Tổng <span className="font-semibold text-(--foreground-hero)">{orderPagination.totalItems}</span> đơn
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending || orderPagination.page <= 1}
                onClick={onPreviousPage}
              >
                Trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending || orderPagination.page >= orderPagination.totalPages}
                onClick={onNextPage}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      </AdminPanelBody>
    </AdminPanel>
  );
}

