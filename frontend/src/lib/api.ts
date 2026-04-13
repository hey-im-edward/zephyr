import type {
  AddressInput,
  AdminDashboard,
  AdminRole,
  AdminRoleInput,
  AuditLog,
  AuthResponse,
  BannerSlot,
  BannerSlotInput,
  Campaign,
  CampaignInput,
  CatalogData,
  CatalogQuery,
  Category,
  CategoryInput,
  ChangePasswordPayload,
  CollectionInput,
  CurrentUserResponse,
  ChatbotCompletionRequest,
  ChatbotCompletionResponse,
  GoogleLoginPayload,
  HomeData,
  LoginPayload,
  MediaAsset,
  MediaAssetInput,
  MerchCollection,
  OrderDetail,
  OrderListData,
  OrderPayload,
  OrderResponse,
  PaymentConfirmRequest,
  PaymentMethod,
  PaymentSessionData,
  PaymentSessionRequest,
  ProfileUpdatePayload,
  Promotion,
  PromotionInput,
  Recommendation,
  RegisterPayload,
  Review,
  ReviewInput,
  ReviewStatus,
  ShippingMethod,
  ShippingMethodInput,
  ShoeCard,
  ShoeDetail,
  ShoeInput,
  UserAddress,
  WishlistInput,
  WishlistItem,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
const DEFAULT_API_TIMEOUT_MS = 12_000;

const parsedApiTimeoutMs = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "");
const API_REQUEST_TIMEOUT_MS = Number.isFinite(parsedApiTimeoutMs) && parsedApiTimeoutMs > 0
  ? parsedApiTimeoutMs
  : DEFAULT_API_TIMEOUT_MS;

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
  revalidate?: number;
};

function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  return query.toString();
}

async function request<T>(path: string, { token, revalidate, headers, ...init }: RequestOptions = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort("request-timeout");
  }, API_REQUEST_TIMEOUT_MS);

  if (init.signal) {
    if (init.signal.aborted) {
      timeoutController.abort(init.signal.reason);
    } else {
      init.signal.addEventListener(
        "abort",
        () => {
          timeoutController.abort(init.signal?.reason);
        },
        { once: true },
      );
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: timeoutController.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Hết thời gian chờ API. Vui lòng thử lại.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await readProblemMessage(response);
    throw new ApiError(message.detail, response.status, message.fields);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readProblemMessage(
  response: Response,
): Promise<{ detail: string; fields?: Record<string, string> }> {
  try {
    const body = (await response.json()) as { detail?: string; title?: string; fields?: Record<string, string> };
    return {
      detail: body.detail ?? body.title ?? "Có lỗi xảy ra khi gọi API.",
      fields: body.fields,
    };
  } catch {
    return { detail: "Có lỗi xảy ra khi gọi API." };
  }
}

export async function getHomeData(): Promise<HomeData> {
  const data = await request<HomeData>("/home", { revalidate: 60 });
  return {
    ...data,
    categories: ensureArray(data?.categories),
    featured: ensureArray(data?.featured),
    newArrivals: ensureArray(data?.newArrivals),
    promoBanners: ensureArray(data?.promoBanners),
    featuredCollections: ensureArray(data?.featuredCollections).map((collection) => ({
      ...collection,
      items: ensureArray(collection?.items),
    })),
  };
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories", { revalidate: 300 });
}

export async function getCatalog(query: CatalogQuery = {}): Promise<CatalogData> {
  const qs = buildQuery(query);
  const data = await request<CatalogData>(`/catalog${qs ? `?${qs}` : ""}`, { revalidate: 60 });
  return {
    ...data,
    items: ensureArray(data?.items),
    featuredCollections: ensureArray(data?.featuredCollections).map((collection) => ({
      ...collection,
      items: ensureArray(collection?.items),
    })),
    facets: {
      categories: ensureArray(data?.facets?.categories),
      brands: ensureArray(data?.facets?.brands),
      silhouettes: ensureArray(data?.facets?.silhouettes),
      sizes: ensureArray(data?.facets?.sizes),
      priceRange: {
        min: data?.facets?.priceRange?.min ?? 0,
        max: data?.facets?.priceRange?.max ?? 0,
      },
    },
  };
}

export async function listShoes(filters?: {
  category?: string;
  featured?: boolean;
  query?: string;
}): Promise<ShoeCard[]> {
  const catalog = await getCatalog({
    category: filters?.category,
    query: filters?.query,
    sort: filters?.featured ? "featured" : undefined,
    pageSize: 24,
  });

  return filters?.featured ? catalog.items.filter((item) => item.featured) : catalog.items;
}

export async function getShoe(slug: string): Promise<ShoeDetail> {
  const data = await request<ShoeDetail>(`/shoes/${slug}`, { revalidate: 60 });
  return {
    ...data,
    availableSizes: ensureArray(data?.availableSizes),
    sizeStocks: ensureArray(data?.sizeStocks),
    accentColors: ensureArray(data?.accentColors),
    highlights: ensureArray(data?.highlights),
    galleryImages: ensureArray(data?.galleryImages),
  };
}

export async function getShoeReviews(slug: string): Promise<Review[]> {
  const data = await request<Review[]>(`/shoes/${slug}/reviews`, { revalidate: 30 });
  return ensureArray(data);
}

export async function submitReview(token: string, slug: string, payload: ReviewInput): Promise<Review> {
  return request<Review>(`/shoes/${slug}/reviews`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function getRecommendations(slug: string): Promise<Recommendation[]> {
  const data = await request<Recommendation[]>(`/shoes/${slug}/recommendations`, { revalidate: 60 });
  return ensureArray(data);
}

export async function getCampaigns(): Promise<Campaign[]> {
  const data = await request<Campaign[]>("/campaigns", { revalidate: 60 });
  return ensureArray(data);
}

export async function getCampaignByPlacement(placement: string): Promise<Campaign | null> {
  const qs = buildQuery({ placement });
  return request<Campaign | null>(`/campaigns?${qs}`, { revalidate: 60 });
}

export async function getBannerSlots(): Promise<BannerSlot[]> {
  const data = await request<BannerSlot[]>("/banner-slots", { revalidate: 60 });
  return ensureArray(data);
}

export async function getBannerSlotByKey(slotKey: string): Promise<BannerSlot | null> {
  const qs = buildQuery({ slotKey });
  return request<BannerSlot | null>(`/banner-slots?${qs}`, { revalidate: 60 });
}

export async function getCollections(): Promise<MerchCollection[]> {
  const data = await request<MerchCollection[]>("/collections", { revalidate: 60 });
  return ensureArray(data).map((collection) => ({
    ...collection,
    items: ensureArray(collection?.items),
  }));
}

export async function getCollection(slug: string): Promise<MerchCollection> {
  const data = await request<MerchCollection>(`/collections/${slug}`, { revalidate: 60 });
  return {
    ...data,
    items: ensureArray(data?.items),
  };
}

export async function getPromotions(): Promise<Promotion[]> {
  const data = await request<Promotion[]>("/promotions", { revalidate: 60 });
  return ensureArray(data);
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const data = await request<ShippingMethod[]>("/shipping-methods", { revalidate: 300 });
  return ensureArray(data);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export async function googleLogin(payload: GoogleLoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/google", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export async function refreshAuth(): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
}

export async function logout(): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getCurrentUser(token: string): Promise<CurrentUserResponse> {
  return request<CurrentUserResponse>("/auth/me", { token });
}

export async function updateProfile(token: string, payload: ProfileUpdatePayload) {
  return request<CurrentUserResponse["user"]>("/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function changePassword(token: string, payload: ChangePasswordPayload): Promise<void> {
  return request<void>("/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function submitOrder(payload: OrderPayload, token?: string | null): Promise<OrderResponse> {
  return request<OrderResponse>("/orders", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function createPaymentSession(payload: PaymentSessionRequest): Promise<PaymentSessionData> {
  return request<PaymentSessionData>("/payments/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPaymentSessionStatus(orderCode: string, referenceToken: string): Promise<PaymentSessionData> {
  const qs = buildQuery({ orderCode, referenceToken });
  return request<PaymentSessionData>(`/payments/sessions/status${qs ? `?${qs}` : ""}`);
}

export async function confirmMockPayment(payload: PaymentConfirmRequest): Promise<PaymentSessionData> {
  return request<PaymentSessionData>("/payments/mock/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestChatbotCompletion(payload: ChatbotCompletionRequest): Promise<ChatbotCompletionResponse> {
  return request<ChatbotCompletionResponse>("/chatbot/completions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMyOrders(token: string, page = 1, pageSize = 10): Promise<OrderListData> {
  const qs = buildQuery({ page, pageSize });
  const data = await request<OrderListData>(`/account/orders${qs ? `?${qs}` : ""}`, { token });
  return {
    ...data,
    items: ensureArray(data?.items),
    pagination: {
      page: data?.pagination?.page ?? 1,
      pageSize: data?.pagination?.pageSize ?? pageSize,
      totalItems: data?.pagination?.totalItems ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
    },
  };
}

export async function getMyOrder(token: string, orderId: number): Promise<OrderDetail> {
  return request<OrderDetail>(`/account/orders/${orderId}`, { token });
}

export async function getMyAddresses(token: string): Promise<UserAddress[]> {
  const data = await request<UserAddress[]>("/account/addresses", { token });
  return ensureArray(data);
}

export async function createAddress(token: string, payload: AddressInput): Promise<UserAddress> {
  return request<UserAddress>("/account/addresses", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(token: string, id: number, payload: AddressInput): Promise<UserAddress> {
  return request<UserAddress>(`/account/addresses/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(token: string, id: number): Promise<void> {
  return request<void>(`/account/addresses/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getWishlist(token: string): Promise<WishlistItem[]> {
  const data = await request<WishlistItem[]>("/account/wishlist", { token });
  return ensureArray(data);
}

export async function addWishlistItem(token: string, payload: WishlistInput): Promise<WishlistItem> {
  return request<WishlistItem>("/account/wishlist", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function removeWishlistItem(token: string, shoeSlug: string): Promise<void> {
  return request<void>(`/account/wishlist/${shoeSlug}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminDashboard(token: string): Promise<AdminDashboard> {
  return request<AdminDashboard>("/admin/dashboard", { token });
}

export async function getAdminShoes(token: string): Promise<ShoeDetail[]> {
  const data = await request<ShoeDetail[]>("/admin/shoes", { token });
  return ensureArray(data).map((shoe) => ({
    ...shoe,
    availableSizes: ensureArray(shoe?.availableSizes),
    sizeStocks: ensureArray(shoe?.sizeStocks),
    accentColors: ensureArray(shoe?.accentColors),
    highlights: ensureArray(shoe?.highlights),
    galleryImages: ensureArray(shoe?.galleryImages),
  }));
}

export async function createAdminShoe(token: string, payload: ShoeInput): Promise<ShoeDetail> {
  return request<ShoeDetail>("/admin/shoes", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...payload,
      accentColors: payload.accentColors.join("|"),
      highlights: payload.highlights.join("|"),
    }),
  });
}

export async function updateAdminShoe(token: string, shoeId: number, payload: ShoeInput): Promise<ShoeDetail> {
  return request<ShoeDetail>(`/admin/shoes/${shoeId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      ...payload,
      accentColors: payload.accentColors.join("|"),
      highlights: payload.highlights.join("|"),
    }),
  });
}

export async function deleteAdminShoe(token: string, shoeId: number): Promise<void> {
  return request<void>(`/admin/shoes/${shoeId}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminCategories(token: string): Promise<Category[]> {
  const data = await request<Category[]>("/admin/categories", { token });
  return ensureArray(data);
}

export async function createAdminCategory(token: string, payload: CategoryInput): Promise<Category> {
  return request<Category>("/admin/categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(token: string, categoryId: number, payload: CategoryInput): Promise<Category> {
  return request<Category>(`/admin/categories/${categoryId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCategory(token: string, categoryId: number): Promise<void> {
  return request<void>(`/admin/categories/${categoryId}`, {
    method: "DELETE",
    token,
  });
}

export async function listAdminOrders(
  token: string,
  params: {
    status?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<OrderListData> {
  const qs = buildQuery(params);
  const data = await request<OrderListData>(`/admin/orders${qs ? `?${qs}` : ""}`, { token });
  return {
    ...data,
    items: ensureArray(data?.items),
    pagination: {
      page: data?.pagination?.page ?? 1,
      pageSize: data?.pagination?.pageSize ?? (params.pageSize ?? 20),
      totalItems: data?.pagination?.totalItems ?? 0,
      totalPages: data?.pagination?.totalPages ?? 1,
    },
  };
}

export async function getAdminOrder(token: string, orderId: number): Promise<OrderDetail> {
  return request<OrderDetail>(`/admin/orders/${orderId}`, { token });
}

export async function updateAdminOrderStatus(token: string, orderId: number, status: string): Promise<OrderDetail> {
  return request<OrderDetail>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export async function getAdminCampaigns(token: string): Promise<Campaign[]> {
  const data = await request<Campaign[]>("/admin/campaigns", { token });
  return ensureArray(data);
}

export async function createAdminCampaign(token: string, payload: CampaignInput): Promise<Campaign> {
  return request<Campaign>("/admin/campaigns", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCampaign(token: string, id: number, payload: CampaignInput): Promise<Campaign> {
  return request<Campaign>(`/admin/campaigns/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCampaign(token: string, id: number): Promise<void> {
  return request<void>(`/admin/campaigns/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminBannerSlots(token: string): Promise<BannerSlot[]> {
  const data = await request<BannerSlot[]>("/admin/banner-slots", { token });
  return ensureArray(data);
}

export async function createAdminBannerSlot(token: string, payload: BannerSlotInput): Promise<BannerSlot> {
  return request<BannerSlot>("/admin/banner-slots", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBannerSlot(token: string, id: number, payload: BannerSlotInput): Promise<BannerSlot> {
  return request<BannerSlot>(`/admin/banner-slots/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBannerSlot(token: string, id: number): Promise<void> {
  return request<void>(`/admin/banner-slots/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminCollections(token: string): Promise<MerchCollection[]> {
  const data = await request<MerchCollection[]>("/admin/collections", { token });
  return ensureArray(data).map((collection) => ({
    ...collection,
    items: ensureArray(collection?.items),
  }));
}

export async function createAdminCollection(token: string, payload: CollectionInput): Promise<MerchCollection> {
  return request<MerchCollection>("/admin/collections", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCollection(token: string, id: number, payload: CollectionInput): Promise<MerchCollection> {
  return request<MerchCollection>(`/admin/collections/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCollection(token: string, id: number): Promise<void> {
  return request<void>(`/admin/collections/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminPromotions(token: string): Promise<Promotion[]> {
  const data = await request<Promotion[]>("/admin/promotions", { token });
  return ensureArray(data);
}

export async function createAdminPromotion(token: string, payload: PromotionInput): Promise<Promotion> {
  return request<Promotion>("/admin/promotions", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPromotion(token: string, id: number, payload: PromotionInput): Promise<Promotion> {
  return request<Promotion>(`/admin/promotions/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPromotion(token: string, id: number): Promise<void> {
  return request<void>(`/admin/promotions/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminShippingMethods(token: string): Promise<ShippingMethod[]> {
  const data = await request<ShippingMethod[]>("/admin/shipping-methods", { token });
  return ensureArray(data);
}

export async function createAdminShippingMethod(token: string, payload: ShippingMethodInput): Promise<ShippingMethod> {
  return request<ShippingMethod>("/admin/shipping-methods", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminShippingMethod(
  token: string,
  id: number,
  payload: ShippingMethodInput,
): Promise<ShippingMethod> {
  return request<ShippingMethod>(`/admin/shipping-methods/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminShippingMethod(token: string, id: number): Promise<void> {
  return request<void>(`/admin/shipping-methods/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminMediaAssets(token: string): Promise<MediaAsset[]> {
  const data = await request<MediaAsset[]>("/admin/media-assets", { token });
  return ensureArray(data);
}

export async function createAdminMediaAsset(token: string, payload: MediaAssetInput): Promise<MediaAsset> {
  return request<MediaAsset>("/admin/media-assets", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminMediaAsset(token: string, id: number, payload: MediaAssetInput): Promise<MediaAsset> {
  return request<MediaAsset>(`/admin/media-assets/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminMediaAsset(token: string, id: number): Promise<void> {
  return request<void>(`/admin/media-assets/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminReviews(token: string): Promise<Review[]> {
  const data = await request<Review[]>("/admin/reviews", { token });
  return ensureArray(data);
}

export async function updateAdminReviewStatus(token: string, id: number, status: ReviewStatus): Promise<Review> {
  return request<Review>(`/admin/reviews/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export async function getAdminRoles(token: string): Promise<AdminRole[]> {
  const data = await request<AdminRole[]>("/admin/admin-roles", { token });
  return ensureArray(data);
}

export async function createAdminRole(token: string, payload: AdminRoleInput): Promise<AdminRole> {
  return request<AdminRole>("/admin/admin-roles", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminRole(token: string, id: number, payload: AdminRoleInput): Promise<AdminRole> {
  return request<AdminRole>(`/admin/admin-roles/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminRole(token: string, id: number): Promise<void> {
  return request<void>(`/admin/admin-roles/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminAuditLogs(token: string): Promise<AuditLog[]> {
  const data = await request<AuditLog[]>("/admin/audit-logs", { token });
  return ensureArray(data);
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng (thủ công)",
  CARD: "Thẻ tín dụng / ghi nợ",
  BANK_QR: "Chuyển khoản ngân hàng (VNPay QR)",
  EWALLET: "Ví điện tử",
};
