"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { AlertTriangle, FolderOpen, Package, Plus, RefreshCw, ShoppingBag, Sparkles, TrendingUp, Users } from "@/components/icons";
import { toast } from "sonner";

import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { MetricCard } from "@/components/admin/metric-card";
import { ShoeFormDialog } from "@/components/admin/shoe-form-dialog";
import { useAuth } from "@/components/auth-provider";
import { MotionReveal } from "@/components/motion-reveal";
import { OrderDetailDialog } from "@/components/order-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminForbiddenState, AdminLoadingState, AdminLoginRequiredState } from "@/features/admin/admin-access-state";
import { AdminCategoriesPanel } from "@/features/admin/admin-categories-panel";
import { ORDER_STATUS_OPTIONS } from "@/features/admin/admin-constants";
import { AdminOrdersPanel } from "@/features/admin/admin-orders-panel";
import { AdminOverviewPanel } from "@/features/admin/admin-overview-panel";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { AdminProductsPanel } from "@/features/admin/admin-products-panel";
import {
  createAdminCampaign,
  createAdminCategory,
  createAdminPromotion,
  createAdminRole,
  createAdminShippingMethod,
  createAdminShoe,
  deleteAdminCategory,
  deleteAdminPromotion,
  deleteAdminRole,
  deleteAdminShippingMethod,
  deleteAdminShoe,
  getAdminAuditLogs,
  getAdminBannerSlots,
  getAdminCampaigns,
  getAdminCategories,
  getAdminCollections,
  getAdminDashboard,
  getAdminMediaAssets,
  getAdminOrder,
  getAdminPromotions,
  getAdminReviews,
  getAdminRoles,
  getAdminShippingMethods,
  getAdminShoes,
  listAdminOrders,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminPromotion,
  updateAdminReviewStatus,
  updateAdminRole,
  updateAdminShippingMethod,
  updateAdminShoe,
} from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { formatDateTime } from "@/lib/presentation";
import type {
  AdminDashboard,
  AdminRole,
  AdminRoleInput,
  AuditLog,
  Campaign,
  CampaignInput,
  Category,
  CategoryInput,
  OrderDetail,
  OrderPagination,
  OrderResponse,
  OrderStatus,
  Promotion,
  PromotionInput,
  Review,
  ReviewStatus,
  ShippingMethod,
  ShippingMethodInput,
  ShoeDetail,
  ShoeInput,
} from "@/lib/types";

const ADMIN_ORDER_PAGE_SIZE = 20;

const emptyCampaignDraft: CampaignInput = {
  title: "",
  placement: "HOME_HERO",
  eyebrow: "",
  headline: "",
  description: "",
  ctaLabel: "",
  ctaHref: "/catalog",
  backgroundImage: "",
  focalImage: "",
  heroTone: "linear-gradient(135deg, rgba(130,168,255,0.22), rgba(240,168,180,0.16))",
  active: true,
  sortOrder: 0,
};

const emptyPromotionDraft: PromotionInput = {
  code: "",
  title: "",
  description: "",
  badge: "",
  discountLabel: "",
  heroTone: "#d79f4c",
  active: true,
  featured: false,
};

const emptyShippingDraft: ShippingMethodInput = {
  name: "",
  description: "",
  fee: 0,
  etaLabel: "",
  active: true,
  priority: 0,
};

const emptyRoleDraft: AdminRoleInput = {
  code: "",
  name: "",
  description: "",
  active: true,
};

function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="group relative flex cursor-pointer items-center gap-3 select-none">
      <div className="relative flex h-5 w-5 items-center justify-center rounded-md border border-(--line-strong) bg-white/50 transition-colors group-hover:border-brand aria-checked:border-brand aria-checked:bg-brand" aria-checked={checked}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(event) => onChange(event.target.checked)} 
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        {checked && (
          <svg className="pointer-events-none absolute h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-(--foreground-dim) transition-colors group-hover:text-(--foreground-hero)">{label}</span>
    </label>
  );
}

export default function AdminPage() {
  const { isReady, isAuthenticated, isAdmin, getAccessToken } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shoes, setShoes] = useState<ShoeDetail[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [orderPagination, setOrderPagination] = useState<OrderPagination>({
    page: 1,
    pageSize: ADMIN_ORDER_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [bannerCount, setBannerCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [mediaAssetCount, setMediaAssetCount] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isShoeDialogOpen, setIsShoeDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingShoe, setEditingShoe] = useState<ShoeDetail | null>(null);
  const [hasLoadedWorkspace, setHasLoadedWorkspace] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [campaignDraft, setCampaignDraft] = useState<CampaignInput>(emptyCampaignDraft);
  const [promotionDraft, setPromotionDraft] = useState<PromotionInput>(emptyPromotionDraft);
  const [shippingDraft, setShippingDraft] = useState<ShippingMethodInput>(emptyShippingDraft);
  const [roleDraft, setRoleDraft] = useState<AdminRoleInput>(emptyRoleDraft);
  const [editingPromotionId, setEditingPromotionId] = useState<number | null>(null);
  const [editingShippingId, setEditingShippingId] = useState<number | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const fetchToken = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("Phiên đăng nhập admin đã hết hạn.");
    return token;
  }, [getAccessToken]);

  const loadWorkspace = useCallback(async (status = orderStatusFilter, query = orderQuery, page = 1) => {
    const token = await fetchToken();
    const [
      dashboardData,
      categoryData,
      shoeData,
      orderData,
      campaignData,
      bannerData,
      collectionData,
      promotionData,
      shippingData,
      mediaData,
      reviewData,
      roleData,
      auditData,
    ] = await Promise.all([
      getAdminDashboard(token),
      getAdminCategories(token),
      getAdminShoes(token),
      listAdminOrders(token, {
        status: status || undefined,
        query: query || undefined,
        page,
        pageSize: ADMIN_ORDER_PAGE_SIZE,
      }),
      getAdminCampaigns(token),
      getAdminBannerSlots(token),
      getAdminCollections(token),
      getAdminPromotions(token),
      getAdminShippingMethods(token),
      getAdminMediaAssets(token),
      getAdminReviews(token),
      getAdminRoles(token),
      getAdminAuditLogs(token),
    ]);

    setDashboard(dashboardData);
    setCategories(categoryData);
    setShoes(shoeData);
    setOrders(orderData.items);
    setOrderPagination(orderData.pagination);
    setCampaigns(campaignData);
    setPromotions(promotionData);
    setShippingMethods(shippingData);
    setReviews(reviewData);
    setAdminRoles(roleData);
    setAuditLogs(auditData);
    setBannerCount(bannerData.length);
    setCollectionCount(collectionData.length);
    setMediaAssetCount(mediaData.length);
  }, [fetchToken, orderQuery, orderStatusFilter]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !isAdmin || hasLoadedWorkspace) return;
    let active = true;

    startTransition(() => {
      void loadWorkspace()
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu quản trị.");
        })
        .finally(() => {
          if (active) {
            setHasLoadedWorkspace(true);
          }
        });
    });
    return () => {
      active = false;
    };
  }, [isAdmin, isAuthenticated, isReady, loadWorkspace, startTransition, hasLoadedWorkspace]);

  async function refreshWorkspace(message = "Đã đồng bộ dữ liệu quản trị.", page = orderPagination.page) {
    try {
      await loadWorkspace(orderStatusFilter, orderQuery, page);
      toast.success(message);
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
    await refreshWorkspace("Đã làm mới danh mục.");
    setEditingCategory(null);
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!window.confirm("Xóa danh mục này?")) return;
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          await deleteAdminCategory(token, categoryId);
          await refreshWorkspace("Đã xóa danh mục.");
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
    await refreshWorkspace("Đã làm mới sản phẩm.");
    setEditingShoe(null);
  }

  async function handleDeleteShoe(shoeId: number) {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          await deleteAdminShoe(token, shoeId);
          await refreshWorkspace("Đã xóa sản phẩm.");
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
      void refreshWorkspace("Đã lọc danh sách đơn.", 1);
    });
  }

  function handleOrderPageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > orderPagination.totalPages || nextPage === orderPagination.page) {
      return;
    }

    startTransition(() => {
      void loadWorkspace(orderStatusFilter, orderQuery, nextPage).catch((error) => {
        toast.error(error instanceof Error ? error.message : "Không thể tải trang đơn hàng.");
      });
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
          await refreshWorkspace("Đã cập nhật trạng thái đơn.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn.");
        }
      })();
    });
  }

  function savePromotion() {
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          if (editingPromotionId) {
            await updateAdminPromotion(token, editingPromotionId, promotionDraft);
            toast.success("Đã cập nhật promotion.");
          } else {
            await createAdminPromotion(token, promotionDraft);
            toast.success("Đã tạo promotion.");
          }
          setPromotionDraft(emptyPromotionDraft);
          setEditingPromotionId(null);
          await refreshWorkspace("Đã làm mới promotions.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể lưu promotion.");
        }
      })();
    });
  }

  function saveShippingMethod() {
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          if (editingShippingId) {
            await updateAdminShippingMethod(token, editingShippingId, shippingDraft);
            toast.success("Đã cập nhật shipping method.");
          } else {
            await createAdminShippingMethod(token, shippingDraft);
            toast.success("Đã tạo shipping method.");
          }
          setShippingDraft(emptyShippingDraft);
          setEditingShippingId(null);
          await refreshWorkspace("Đã làm mới shipping methods.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể lưu shipping method.");
        }
      })();
    });
  }

  function saveRole() {
    startTransition(() => {
      void (async () => {
        try {
          const token = await fetchToken();
          if (editingRoleId) {
            await updateAdminRole(token, editingRoleId, roleDraft);
            toast.success("Đã cập nhật role.");
          } else {
            await createAdminRole(token, roleDraft);
            toast.success("Đã tạo role.");
          }
          setRoleDraft(emptyRoleDraft);
          setEditingRoleId(null);
          await refreshWorkspace("Đã làm mới admin roles.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể lưu role.");
        }
      })();
    });
  }

  const isLoading = !isReady || (isAuthenticated && isAdmin && !hasLoadedWorkspace);

  if (isLoading) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminLoginRequiredState />;
  if (!isAdmin) return <AdminForbiddenState />;

  const topMetrics = [
    { label: "Danh mục", value: dashboard?.categoryCount ?? 0, note: "Nhịp nhóm sản phẩm đang hiển thị.", icon: FolderOpen, tint: "amber" as const },
    { label: "Sản phẩm", value: dashboard?.shoeCount ?? 0, note: "Tổng số mẫu đang vận hành.", icon: ShoppingBag, tint: "rose" as const },
    { label: "Người dùng", value: dashboard?.userCount ?? 0, note: "Khách hàng và tài khoản quản trị.", icon: Users, tint: "sky" as const },
    { label: "Đơn chờ xác nhận", value: dashboard?.pendingOrderCount ?? 0, note: "Nhóm cần ưu tiên xử lý trước.", icon: Package, tint: "emerald" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <MotionReveal className="surface-strong rounded-[2.4rem] p-7">
          <Badge variant="secondary" className="border-(--line) bg-white/62">ZEPHYR operations</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-none text-(--foreground-hero)">
            Điều khiển storefront, merchandising và vận hành từ cùng một shell.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-(--muted)">
            Admin mới gom catalog, operations, merchandising và governance vào cùng một lớp vận hành sáng, đọc rõ và tiết chế blur.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => { setEditingShoe(null); setIsShoeDialogOpen(true); }} className="min-w-44">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
            <Button type="button" variant="secondary" className="min-w-44" onClick={() => { setEditingCategory(null); setIsCategoryDialogOpen(true); }}>
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
            <MetricCard key={metric.label} label={metric.label} value={metric.value} note={metric.note} icon={metric.icon} tint={metric.tint} />
          ))}
        </MotionReveal>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <MotionReveal className="surface-admin rounded-[1.8rem] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-(--line) bg-white/74 text-(--foreground-hero)">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div className="font-display text-2xl font-semibold text-(--foreground-hero)">Nhịp ưu tiên của ca vận hành</div>
              <p className="text-sm leading-7 text-(--muted)">
                Xử lý đơn treo trước, giữ promotion và shipping methods luôn đúng, sau đó mới tinh chỉnh campaign và surface merchandising.
              </p>
            </div>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="rounded-[1.8rem] border border-[rgba(220,87,109,0.16)] bg-[rgba(220,87,109,0.06)] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(220,87,109,0.2)] bg-white/62 text-(--danger)">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div className="font-display text-2xl font-semibold text-(--foreground-hero)">Vùng thao tác nhạy cảm</div>
              <p className="text-sm leading-7 text-(--muted)">
                Trạng thái đơn, review moderation và governance actions phải ưu tiên độ rõ hơn hiệu ứng thị giác.
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto!">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="merchandising">Merchandising</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <AdminOverviewPanel dashboard={dashboard} shoes={shoes} orders={orders} />
            <div className="grid gap-5 xl:grid-cols-3">
              <AdminPanel>
                <AdminPanelHeader title="Campaigns live" description="Hero campaign và slots đang chạy." />
                <AdminPanelBody className="space-y-3">
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Campaigns</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{campaigns.length}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Banner slots</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{bannerCount}</div>
                  </div>
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Merchandising assets" description="Collections và media hiện có trong hệ." />
                <AdminPanelBody className="space-y-3">
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Collections</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{collectionCount}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Media assets</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{mediaAssetCount}</div>
                  </div>
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Governance" description="Review moderation, admin roles và audit." />
                <AdminPanelBody className="space-y-3">
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Reviews</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{reviews.length}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Admin roles</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{adminRoles.length}</div>
                  </div>
                </AdminPanelBody>
              </AdminPanel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="space-y-6">
            <AdminProductsPanel
              shoes={shoes}
              onCreate={() => { setEditingShoe(null); setIsShoeDialogOpen(true); }}
              onEdit={(shoe) => { setEditingShoe(shoe); setIsShoeDialogOpen(true); }}
              onDelete={(shoeId) => void handleDeleteShoe(shoeId)}
            />

            <AdminCategoriesPanel
              categories={categories}
              onCreate={() => { setEditingCategory(null); setIsCategoryDialogOpen(true); }}
              onEdit={(category) => { setEditingCategory(category); setIsCategoryDialogOpen(true); }}
              onDelete={(categoryId) => void handleDeleteCategory(categoryId)}
            />
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="space-y-6">
            <AdminOrdersPanel
              orders={orders}
              orderQuery={orderQuery}
              orderStatusFilter={orderStatusFilter}
              orderPagination={orderPagination}
              isPending={isPending}
              onOrderQueryChange={setOrderQuery}
              onOrderStatusFilterChange={setOrderStatusFilter}
              onFilter={handleFilterOrders}
              onOpenDetail={(orderId) => void openOrderDetail(orderId)}
              onPreviousPage={() => handleOrderPageChange(orderPagination.page - 1)}
              onNextPage={() => handleOrderPageChange(orderPagination.page + 1)}
            />

            <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
              <AdminPanel>
                <AdminPanelHeader title="Shipping methods" description="Các lựa chọn giao hàng dùng trong checkout." />
                <AdminPanelBody className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-name">Tên phương thức</Label>
                      <Input id="shipping-name" value={shippingDraft.name} onChange={(event) => setShippingDraft((current) => ({ ...current, name: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-fee">Phí ship</Label>
                      <Input id="shipping-fee" type="number" value={shippingDraft.fee} onChange={(event) => setShippingDraft((current) => ({ ...current, fee: Number(event.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-eta">ETA label</Label>
                      <Input id="shipping-eta" value={shippingDraft.etaLabel} onChange={(event) => setShippingDraft((current) => ({ ...current, etaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-priority">Priority</Label>
                      <Input id="shipping-priority" type="number" value={shippingDraft.priority} onChange={(event) => setShippingDraft((current) => ({ ...current, priority: Number(event.target.value) }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-description">Mô tả</Label>
                    <Textarea id="shipping-description" value={shippingDraft.description} onChange={(event) => setShippingDraft((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <CheckboxField checked={shippingDraft.active} onChange={(next) => setShippingDraft((current) => ({ ...current, active: next }))} label="Phương thức đang active" />
                  <div className="flex gap-3">
                    <Button type="button" onClick={saveShippingMethod} disabled={isPending}>
                      {editingShippingId ? "Cập nhật shipping" : "Tạo shipping"}
                    </Button>
                    {editingShippingId ? (
                      <Button type="button" variant="ghost" onClick={() => { setShippingDraft(emptyShippingDraft); setEditingShippingId(null); }}>
                        Hủy chỉnh sửa
                      </Button>
                    ) : null}
                  </div>
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Review moderation" description="Kiểm soát review trước khi lên PDP." />
                <AdminPanelBody className="grid gap-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-3xl border border-(--line) bg-white/56 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-(--foreground-hero)">{review.title}</div>
                          <div className="mt-1 text-sm text-(--muted)">
                            {review.customerName} • {review.rating}/5
                          </div>
                        </div>
                        <Badge variant={review.status === "PUBLISHED" ? "success" : review.status === "HIDDEN" ? "danger" : "warning"}>
                          {review.status}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-(--muted)">{review.body}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(["PUBLISHED", "PENDING", "HIDDEN"] as ReviewStatus[]).map((status) => (
                          <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={review.status === status ? "default" : "secondary"}
                            onClick={() => {
                              startTransition(() => {
                                void (async () => {
                                  try {
                                    const token = await fetchToken();
                                    await updateAdminReviewStatus(token, review.id, status);
                                    await refreshWorkspace("Đã cập nhật trạng thái review.");
                                  } catch (error) {
                                    toast.error(error instanceof Error ? error.message : "Không thể cập nhật review.");
                                  }
                                })();
                              });
                            }}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </AdminPanelBody>
              </AdminPanel>
            </div>

            <AdminPanel>
              <AdminPanelHeader title="Shipping roster" description="Danh sách phương thức đang hiển thị ra storefront và checkout." />
              <AdminPanelBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {shippingMethods.length === 0 ? (
                  <div className="rounded-3xl border border-(--line) bg-white/56 p-4 text-sm leading-7 text-(--muted)">
                    Chưa có shipping method nào. Tạo ít nhất một phương thức để checkout hiển thị đúng.
                  </div>
                ) : (
                  shippingMethods.map((method) => (
                    <div key={method.id} className="rounded-3xl border border-(--line) bg-white/56 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-(--foreground-hero)">{method.name}</div>
                          <div className="mt-1 text-sm text-(--muted)">{method.slug}</div>
                        </div>
                        <Badge variant={method.active ? "success" : "secondary"}>{method.active ? "Active" : "Off"}</Badge>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-(--muted)">{method.description}</div>
                      <div className="mt-3 text-sm text-(--muted)">
                        {method.etaLabel} • {formatVnd(method.fee)}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingShippingId(method.id);
                            setShippingDraft({
                              name: method.name,
                              description: method.description,
                              fee: method.fee,
                              etaLabel: method.etaLabel,
                              active: method.active,
                              priority: method.priority,
                            });
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (!window.confirm("Xóa shipping method này?")) return;
                            startTransition(() => {
                              void (async () => {
                                try {
                                  const token = await fetchToken();
                                  await deleteAdminShippingMethod(token, method.id);
                                  await refreshWorkspace("Đã xóa shipping method.");
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Không thể xóa shipping method.");
                                }
                              })();
                            });
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </AdminPanelBody>
            </AdminPanel>
          </div>
        </TabsContent>

        <TabsContent value="merchandising">
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-2">
              <AdminPanel>
                <AdminPanelHeader title="Campaigns" description="Hero shell cho home, catalog hoặc các surface editorial." />
                <AdminPanelBody className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-title">Tiêu đề</Label>
                      <Input id="campaign-title" value={campaignDraft.title} onChange={(event) => setCampaignDraft((current) => ({ ...current, title: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-placement">Placement</Label>
                      <Input id="campaign-placement" value={campaignDraft.placement} onChange={(event) => setCampaignDraft((current) => ({ ...current, placement: event.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-headline">Headline</Label>
                    <Textarea id="campaign-headline" value={campaignDraft.headline} onChange={(event) => setCampaignDraft((current) => ({ ...current, headline: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-description">Description</Label>
                    <Textarea id="campaign-description" value={campaignDraft.description} onChange={(event) => setCampaignDraft((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-cta-label">CTA label</Label>
                      <Input id="campaign-cta-label" value={campaignDraft.ctaLabel} onChange={(event) => setCampaignDraft((current) => ({ ...current, ctaLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-cta-href">CTA href</Label>
                      <Input id="campaign-cta-href" value={campaignDraft.ctaHref} onChange={(event) => setCampaignDraft((current) => ({ ...current, ctaHref: event.target.value }))} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      startTransition(() => {
                        void (async () => {
                          try {
                            const token = await fetchToken();
                            await createAdminCampaign(token, campaignDraft);
                            setCampaignDraft(emptyCampaignDraft);
                            await refreshWorkspace("Đã tạo campaign.");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Không thể lưu campaign.");
                          }
                        })();
                      });
                    }}
                    disabled={isPending}
                  >
                    Tạo campaign
                  </Button>
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Promotions" description="Promo code hiển thị trên catalog và checkout." />
                <AdminPanelBody className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="promotion-code">Code</Label>
                      <Input id="promotion-code" value={promotionDraft.code} onChange={(event) => setPromotionDraft((current) => ({ ...current, code: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promotion-badge">Badge</Label>
                      <Input id="promotion-badge" value={promotionDraft.badge} onChange={(event) => setPromotionDraft((current) => ({ ...current, badge: event.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotion-title">Tiêu đề</Label>
                    <Input id="promotion-title" value={promotionDraft.title} onChange={(event) => setPromotionDraft((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotion-description">Description</Label>
                    <Textarea id="promotion-description" value={promotionDraft.description} onChange={(event) => setPromotionDraft((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="promotion-discount">Discount label</Label>
                      <Input id="promotion-discount" value={promotionDraft.discountLabel} onChange={(event) => setPromotionDraft((current) => ({ ...current, discountLabel: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promotion-tone">Tone</Label>
                      <Input id="promotion-tone" value={promotionDraft.heroTone} onChange={(event) => setPromotionDraft((current) => ({ ...current, heroTone: event.target.value }))} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <CheckboxField checked={promotionDraft.active} onChange={(next) => setPromotionDraft((current) => ({ ...current, active: next }))} label="Promotion active" />
                    <CheckboxField checked={promotionDraft.featured} onChange={(next) => setPromotionDraft((current) => ({ ...current, featured: next }))} label="Promotion featured" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={savePromotion} disabled={isPending}>
                      {editingPromotionId ? "Cập nhật promotion" : "Tạo promotion"}
                    </Button>
                    {editingPromotionId ? (
                      <Button type="button" variant="ghost" onClick={() => { setPromotionDraft(emptyPromotionDraft); setEditingPromotionId(null); }}>
                        Hủy chỉnh sửa
                      </Button>
                    ) : null}
                  </div>
                </AdminPanelBody>
              </AdminPanel>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <AdminPanel>
                <AdminPanelHeader title="Campaign list" description="Danh sách campaign hiện có." />
                <AdminPanelBody className="grid gap-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                      <div className="font-semibold text-(--foreground-hero)">{campaign.title}</div>
                      <div className="mt-1 text-sm text-(--muted)">{campaign.placement}</div>
                    </div>
                  ))}
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Promotion list" description="Các promotion đang tồn tại." />
                <AdminPanelBody className="grid gap-3">
                  {promotions.map((promotion) => (
                    <div key={promotion.id} className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-(--foreground-hero)">{promotion.code}</div>
                        <Badge variant={promotion.active ? "success" : "secondary"}>{promotion.active ? "Active" : "Off"}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-(--muted)">{promotion.title}</div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingPromotionId(promotion.id);
                            setPromotionDraft({
                              code: promotion.code,
                              title: promotion.title,
                              description: promotion.description,
                              badge: promotion.badge,
                              discountLabel: promotion.discountLabel,
                              heroTone: promotion.heroTone,
                              active: promotion.active,
                              featured: promotion.featured,
                            });
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (!window.confirm("Xóa promotion này?")) return;
                            startTransition(() => {
                              void (async () => {
                                try {
                                  const token = await fetchToken();
                                  await deleteAdminPromotion(token, promotion.id);
                                  await refreshWorkspace("Đã xóa promotion.");
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Không thể xóa promotion.");
                                }
                              })();
                            });
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Asset counts" description="Tín hiệu nhanh cho content ops." />
                <AdminPanelBody className="space-y-3">
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Banner slots</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{bannerCount}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Collections</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{collectionCount}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-(--line) bg-white/56 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-(--foreground-dim)">Media assets</div>
                    <div className="mt-2 font-display text-3xl font-semibold text-(--foreground-hero)">{mediaAssetCount}</div>
                  </div>
                </AdminPanelBody>
              </AdminPanel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="governance">
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
              <AdminPanel>
                <AdminPanelHeader title="Admin roles" description="Các role dành cho governance layer." />
                <AdminPanelBody className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role-code">Code</Label>
                      <Input id="role-code" value={roleDraft.code} onChange={(event) => setRoleDraft((current) => ({ ...current, code: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Tên role</Label>
                      <Input id="role-name" value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Mô tả</Label>
                    <Textarea id="role-description" value={roleDraft.description} onChange={(event) => setRoleDraft((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <CheckboxField checked={roleDraft.active} onChange={(next) => setRoleDraft((current) => ({ ...current, active: next }))} label="Role active" />
                  <div className="flex gap-3">
                    <Button type="button" onClick={saveRole} disabled={isPending}>
                      {editingRoleId ? "Cập nhật role" : "Tạo role"}
                    </Button>
                    {editingRoleId ? (
                      <Button type="button" variant="ghost" onClick={() => { setRoleDraft(emptyRoleDraft); setEditingRoleId(null); }}>
                        Hủy chỉnh sửa
                      </Button>
                    ) : null}
                  </div>
                </AdminPanelBody>
              </AdminPanel>

              <AdminPanel>
                <AdminPanelHeader title="Audit logs" description="Ghi nhận hành động gần đây trong quản trị." />
                <AdminPanelBody className="grid gap-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-3xl border border-(--line) bg-white/56 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-semibold text-(--foreground-hero)">{log.actionType} • {log.resourceType}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">{formatDateTime(log.createdAt)}</div>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-(--muted)">{log.message}</div>
                      <div className="mt-2 text-sm text-(--muted)">Actor: {log.actorName}</div>
                    </div>
                  ))}
                </AdminPanelBody>
              </AdminPanel>
            </div>

            <AdminPanel>
              <AdminPanelHeader title="Role list" description="Các vai trò hiện có trong hệ." />
              <AdminPanelBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {adminRoles.map((role) => (
                  <div key={role.id} className="rounded-3xl border border-(--line) bg-white/56 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-(--foreground-hero)">{role.name}</div>
                        <div className="mt-1 text-sm text-(--muted)">{role.code}</div>
                      </div>
                      <Badge variant={role.active ? "success" : "secondary"}>{role.active ? "Active" : "Off"}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-(--muted)">{role.description}</p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingRoleId(role.id);
                          setRoleDraft({
                            code: role.code,
                            name: role.name,
                            description: role.description,
                            active: role.active,
                          });
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!window.confirm("Xóa role này?")) return;
                          startTransition(() => {
                            void (async () => {
                              try {
                                const token = await fetchToken();
                                await deleteAdminRole(token, role.id);
                                await refreshWorkspace("Đã xóa role.");
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Không thể xóa role.");
                              }
                            })();
                          });
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </AdminPanelBody>
            </AdminPanel>
          </div>
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
                <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">Cập nhật vòng đời đơn</div>
                <div className="text-sm text-(--muted)">Đổi trạng thái đúng bước để tồn kho, fulfillment và khách hàng luôn khớp.</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                  className="flex h-11 rounded-2xl border border-(--line) bg-white/74 px-4 py-2 text-sm text-(--foreground) outline-none focus:border-(--line-strong)"
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value} className="bg-white">
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

      <div className="surface-admin mt-6 rounded-3xl px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--line) bg-white/74 text-(--foreground-hero)">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-(--foreground-hero)">Operational rule</div>
            <p className="text-sm leading-7 text-(--muted)">
              Chuyển đơn sang <strong>Đã hủy</strong> sẽ hoàn tồn kho theo size. Layer này giữ cho storefront và dữ liệu bán hàng không lệch nhau.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-(--muted)">
        Cần rà lại storefront công khai?{" "}
        <Link href="/catalog" className="text-(--foreground-hero) underline decoration-[var(--line-strong)] underline-offset-4">
          Mở catalog
        </Link>
        .
      </div>
    </div>
  );
}

