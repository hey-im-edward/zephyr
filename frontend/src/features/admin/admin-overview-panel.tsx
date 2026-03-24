import {
  Box,
  Package,
  Sparkles,
  TrendingUp,
} from "@/components/icons";

import { MetricCard } from "@/components/admin/metric-card";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import type { AdminDashboard, OrderResponse, ShoeDetail } from "@/lib/types";

export function AdminOverviewPanel({
  dashboard,
  shoes,
  orders,
}: {
  dashboard: AdminDashboard | null;
  shoes: ShoeDetail[];
  orders: OrderResponse[];
}) {
  const items = [
    {
      label: "Tồn kho tổng",
      value: shoes.reduce((sum, shoe) => sum + shoe.totalStock, 0),
      note: "Tổng số đôi đang sẵn sàng trên tất cả size.",
      icon: Box,
      tint: "sky" as const,
    },
    {
      label: "Sản phẩm nổi bật",
      value: shoes.filter((shoe) => shoe.featured).length,
      note: "Danh sách được ưu tiên hiển thị trong storefront.",
      icon: Sparkles,
      tint: "amber" as const,
    },
    {
      label: "Đơn đang mở",
      value: orders.filter((order) => order.status !== "DELIVERED" && order.status !== "CANCELLED").length,
      note: "Cần theo dõi trước khi chuyển sang nhập kho tiếp theo.",
      icon: Package,
      tint: "rose" as const,
    },
    {
      label: "Doanh thu hợp lệ",
      value: dashboard?.totalRevenue ?? 0,
      note: "Không tính các đơn đã hủy.",
      icon: TrendingUp,
      tint: "emerald" as const,
      currency: true,
    },
  ];

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Tổng quan vận hành"
        description="Bộ quy tắc ưu tiên của ZEPHYR: xử lý đơn treo trước, giữ tồn kho cân bằng và chỉ đẩy các mẫu xứng đáng lên storefront."
      />
      <AdminPanelBody className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            icon={item.icon}
            tint={item.tint}
            currency={item.currency}
          />
        ))}
      </AdminPanelBody>
    </AdminPanel>
  );
}
