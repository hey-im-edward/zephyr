"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  FolderOpen,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  RefreshCw,
} from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { MetricCard } from "@/components/admin/metric-card";
import { ShoeFormDialog } from "@/components/admin/shoe-form-dialog";
import { MotionReveal } from "@/components/motion-reveal";
import { OrderDetailDialog } from "@/components/order-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminForbiddenState, AdminLoadingState, AdminLoginRequiredState } from "@/features/admin/admin-access-state";
import { AdminCategoriesPanel } from "@/features/admin/admin-categories-panel";
import { ORDER_STATUS_OPTIONS } from "@/features/admin/admin-constants";
import { AdminOrdersPanel } from "@/features/admin/admin-orders-panel";
import { AdminOverviewPanel } from "@/features/admin/admin-overview-panel";
import { AdminProductsPanel } from "@/features/admin/admin-products-panel";
import {
  createAdminCategory,
  createAdminShoe,
  deleteAdminCategory,
  deleteAdminShoe,
  getAdminCategories,
  getAdminDashboard,
  getAdminOrder,
  getAdminShoes,
  listAdminOrders,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminShoe,
} from "@/lib/api";
import type {
  AdminDashboard,
  Category,
  CategoryInput,
  OrderDetail,
  OrderResponse,
  OrderStatus,
  ShoeDetail,
  ShoeInput,
} from "@/lib/types";

export default function AdminPage() {
  const { isReady, isAuthenticated, isAdmin, getAccessToken } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shoes, setShoes] = useState<ShoeDetail[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isShoeDialogOpen, setIsShoeDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingShoe, setEditingShoe] = useState<ShoeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function fetchToken() {
    const token = await getAccessToken();
    if (!token) throw new Error("Phiên đăng nhập admin đã hết hạn.");
    return token;
  }

  async function loadWorkspace(status = orderStatusFilter, query = orderQuery) {
    const token = await fetchToken();
    const [dashboardData, categoryData, shoeData, orderData] = await Promise.all([
      getAdminDashboard(token),
      getAdminCategories(token),
      getAdminShoes(token),
      listAdminOrders(token, status || undefined, query || undefined),
    ]);

    setDashboard(dashboardData);
    setCategories(categoryData);
    setShoes(shoeData);
    setOrders(orderData);
  }

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || !isAdmin) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Phiên đăng nhập admin đã hết hạn.");
        const [dashboardData, categoryData, shoeData, orderData] = await Promise.all([
          getAdminDashboard(token),
          getAdminCategories(token),
          getAdminShoes(token),
          listAdminOrders(token, undefined, undefined),
        ]);

        setDashboard(dashboardData);
        setCategories(categoryData);
        setShoes(shoeData);
        setOrders(orderData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [getAccessToken, isAdmin, isAuthenticated, isReady]);

  async function refreshWorkspace() {
    try {
      await loadWorkspace();
      toast.success("Đã đồng bộ dữ liệu vận hành.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đồng bộ dữ liệu.");
    }
  }

  async function handleCreateOrUpdateCategory(payload: CategoryInput) {
    const token = await fetchToken();
    if (editingCategory) {
      await updateAdminCategory(token, editingCategory.id, payload);
      toast.success("Đã cập nhật danh mục.");
    } else {
      await createAdminCategory(token, payload);
      toast.success("Đã tạo danh mục mới.");
    }

    const data = await getAdminCategories(token);
    setCategories(data);
    setDashboard((current) => (current ? { ...current, categoryCount: data.length } : current));
    setEditingCategory(null);
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!window.confirm("Xóa danh mục này?")) return;

    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          await deleteAdminCategory(token, categoryId);
          const data = await getAdminCategories(token);
          setCategories(data);
          setDashboard((current) => (current ? { ...current, categoryCount: data.length } : current));
          toast.success("Đã xóa danh mục.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể xóa danh mục.");
        }
      })();
    });
  }

  async function handleCreateOrUpdateShoe(payload: ShoeInput) {
    const token = await fetchToken();
    if (editingShoe) {
      await updateAdminShoe(token, editingShoe.id, payload);
      toast.success("Đã cập nhật sản phẩm.");
    } else {
      await createAdminShoe(token, payload);
      toast.success("Đã tạo sản phẩm mới.");
    }

    const data = await getAdminShoes(token);
    setShoes(data);
    setDashboard((current) => (current ? { ...current, shoeCount: data.length } : current));
    setEditingShoe(null);
  }

  async function handleDeleteShoe(shoeId: number) {
    if (!window.confirm("Xóa sản phẩm này?")) return;

    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          await deleteAdminShoe(token, shoeId);
          const data = await getAdminShoes(token);
          setShoes(data);
          setDashboard((current) => (current ? { ...current, shoeCount: data.length } : current));
          toast.success("Đã xóa sản phẩm.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể xóa sản phẩm.");
        }
      })();
    });
  }

  async function openOrderDetail(orderId: number) {
    try {
      const token = await fetchToken();
      const detail = await getAdminOrder(token, orderId);
      setSelectedOrder(detail);
      setSelectedStatus(detail.status);
      setIsOrderDialogOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết đơn.");
    }
  }

  function handleFilterOrders() {
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          const list = await listAdminOrders(token, orderStatusFilter || undefined, orderQuery || undefined);
          setOrders(list);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể lọc danh sách đơn.");
        }
      })();
    });
  }

  async function handleUpdateOrderStatus() {
    if (!selectedOrder) return;

    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          const updatedOrder = await updateAdminOrderStatus(token, selectedOrder.id, selectedStatus);
          setSelectedOrder(updatedOrder);
          await loadWorkspace();
          toast.success("Đã cập nhật trạng thái đơn.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn.");
        }
      })();
    });
  }

  if (!isReady || isLoading) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminLoginRequiredState />;
  if (!isAdmin) return <AdminForbiddenState />;

  const topMetrics = [
    {
      label: "Danh mục",
      value: dashboard?.categoryCount ?? 0,
      note: "Nhịp nhóm sản phẩm đang hiển thị.",
      icon: FolderOpen,
      tint: "amber" as const,
    },
    {
      label: "Sản phẩm",
      value: dashboard?.shoeCount ?? 0,
      note: "Tổng số mẫu đang vận hành.",
      icon: ShoppingBag,
      tint: "rose" as const,
    },
    {
      label: "Người dùng",
      value: dashboard?.userCount ?? 0,
      note: "Khách hàng và tài khoản quản trị.",
      icon: Users,
      tint: "sky" as const,
    },
    {
      label: "Đơn chờ xác nhận",
      value: dashboard?.pendingOrderCount ?? 0,
      note: "Nhóm cần ưu tiên xử lý trước.",
      icon: Package,
      tint: "emerald" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <MotionReveal className="surface-admin-strong rounded-[2.25rem] p-7">
          <Badge variant="secondary" className="border border-white/10 bg-white/8">
            ZEPHYR điều phối
          </Badge>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-none text-white">
            Điều khiển vận hành bằng các bề mặt rõ ràng và các quyết định an toàn.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
            Khu admin của ZEPHYR giữ cùng hệ nhận diện với storefront nhưng ưu tiên tốc độ đọc dữ liệu, tương phản cao
            và phân tách tác vụ theo domain để đội vận hành không phải mò trong một màn hình quá tải.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                setEditingShoe(null);
                setIsShoeDialogOpen(true);
              }}
              className="min-w-44"
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-w-44"
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
            <Button type="button" variant="ghost" onClick={() => void refreshWorkspace()} disabled={isPending}>
              <RefreshCw className="h-4 w-4" />
              Đồng bộ lại
            </Button>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="grid gap-4 sm:grid-cols-2">
          {topMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              icon={metric.icon}
              tint={metric.tint}
            />
          ))}
        </MotionReveal>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <MotionReveal className="surface-admin rounded-[1.8rem] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-amber-300/20 bg-amber-300/10 text-amber-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div className="font-display text-2xl font-semibold text-white">Nhịp ưu tiên của ca vận hành</div>
              <p className="text-sm leading-7 text-white/58">
                Xử lý đơn chờ xác nhận trước, giữ kho size ở mức cân bằng, sau đó mới tinh chỉnh thứ tự hiển thị các
                mẫu nổi bật trên storefront.
              </p>
            </div>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="rounded-[1.8rem] border border-amber-300/16 bg-amber-300/10 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-amber-300/20 bg-black/15 text-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div className="font-display text-2xl font-semibold text-white">Vùng thao tác nhạy cảm</div>
              <p className="text-sm leading-7 text-white/72">
                Các hành động xóa hoặc đổi trạng thái đơn phải rõ ràng, nổi bật và khó bấm nhầm. Về mặt giao diện, độ
                an toàn thao tác được ưu tiên cao hơn hiệu ứng.
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="border-white/8 bg-[#08101d]/92">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewPanel dashboard={dashboard} shoes={shoes} orders={orders} />
        </TabsContent>

        <TabsContent value="products">
          <AdminProductsPanel
            shoes={shoes}
            onCreate={() => {
              setEditingShoe(null);
              setIsShoeDialogOpen(true);
            }}
            onEdit={(shoe) => {
              setEditingShoe(shoe);
              setIsShoeDialogOpen(true);
            }}
            onDelete={(shoeId) => void handleDeleteShoe(shoeId)}
          />
        </TabsContent>

        <TabsContent value="categories">
          <AdminCategoriesPanel
            categories={categories}
            onCreate={() => {
              setEditingCategory(null);
              setIsCategoryDialogOpen(true);
            }}
            onEdit={(category) => {
              setEditingCategory(category);
              setIsCategoryDialogOpen(true);
            }}
            onDelete={(categoryId) => void handleDeleteCategory(categoryId)}
          />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrdersPanel
            orders={orders}
            orderQuery={orderQuery}
            orderStatusFilter={orderStatusFilter}
            isPending={isPending}
            onOrderQueryChange={setOrderQuery}
            onOrderStatusFilterChange={setOrderStatusFilter}
            onFilter={handleFilterOrders}
            onOpenDetail={(orderId) => void openOrderDetail(orderId)}
          />
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={isCategoryDialogOpen}
        onOpenChange={(open) => {
          setIsCategoryDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
        initialValue={editingCategory}
        onSubmit={handleCreateOrUpdateCategory}
      />

      <ShoeFormDialog
        open={isShoeDialogOpen}
        onOpenChange={(open) => {
          setIsShoeDialogOpen(open);
          if (!open) setEditingShoe(null);
        }}
        categories={categories}
        initialValue={editingShoe}
        onSubmit={handleCreateOrUpdateShoe}
      />

      <OrderDetailDialog
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        footer={
          selectedOrder ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">Cập nhật vòng đời đơn</div>
                <div className="text-sm text-white/62">Đổi trạng thái đúng bước để hệ thống hoàn hoặc trừ kho chuẩn xác.</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                  className="flex h-11 rounded-2xl border border-white/12 bg-[#08101d] px-4 py-2 text-sm text-white outline-none focus:border-amber-300/70"
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value} className="bg-slate-950">
                      {status.label}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={() => void handleUpdateOrderStatus()} disabled={isPending} className="min-w-44">
                  {isPending ? "Đang lưu..." : "Cập nhật trạng thái"}
                </Button>
              </div>
            </div>
          ) : null
        }
      />

      <div className="surface-admin mt-6 rounded-[1.5rem] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-amber-100">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Quy tắc kho</div>
            <p className="text-sm leading-7 text-white/58">
              Chuyển đơn sang <strong>Đã hủy</strong> sẽ hoàn tồn kho theo size. Chuyển ngược lại sẽ trừ kho lại nếu đủ số lượng
              trong hệ thống.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-white/45">
        Cần rà lại dữ liệu storefront?{" "}
        <Link href="/catalog" className="text-white underline decoration-white/20 underline-offset-4">
          Mở catalog công khai
        </Link>
        .
      </div>
    </div>
  );
}
