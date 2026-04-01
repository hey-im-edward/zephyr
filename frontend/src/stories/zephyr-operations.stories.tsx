import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricCard } from "@/components/admin/metric-card";
import { AlertTriangle, FolderOpen, Package, Users } from "@/components/icons";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "ZEPHYR/Operations",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminWorkbench: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--page-background)] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Danh mục" value={4} note="Nhóm sản phẩm đang hiển thị." icon={FolderOpen} tint="amber" />
          <MetricCard label="Sản phẩm" value={18} note="SKU đang được merchandising." icon={Package} tint="rose" />
          <MetricCard label="Người dùng" value={246} note="Khách hàng và tài khoản nội bộ." icon={Users} tint="sky" />
          <MetricCard label="Đơn treo" value={3} note="Nhóm phải xử lý trước." icon={AlertTriangle} tint="emerald" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <AdminPanel>
            <AdminPanelHeader title="Shipping methods" description="Khu operational form phải sáng, chắc và ít blur hơn storefront." />
            <AdminPanelBody className="space-y-4">
              <Input placeholder="Tên phương thức giao hàng" />
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Phí ship" />
                <Input placeholder="ETA label" />
              </div>
              <Textarea placeholder="Mô tả rõ ràng để checkout không cần suy đoán." />
              <div className="flex gap-3">
                <Button>Lưu phương thức</Button>
                <Button variant="secondary">Tạo nháp</Button>
              </div>
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="Moderation rail" description="Review, promotion và destructive action phải có contrast cao và trạng thái rõ." />
            <AdminPanelBody className="space-y-4">
              {[
                ["Review pending", "PENDING", "Người dùng muốn nhận thêm ảnh close-up phần đế trước khi quyết định."],
                ["Promo limited", "ACTIVE", "SPRING10 đang chạy trên catalog, checkout và promo strip."],
              ].map(([title, status, copy]) => (
                <div key={title} className="rounded-[1.5rem] border border-[var(--line)] bg-white/62 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[var(--foreground-hero)]">{title}</div>
                    <Badge variant={status === "ACTIVE" ? "success" : "warning"}>{status}</Badge>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy}</div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="secondary">
                      Hide
                    </Button>
                    <Button size="sm" variant="destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </AdminPanelBody>
          </AdminPanel>
        </div>
      </div>
    </div>
  ),
};
