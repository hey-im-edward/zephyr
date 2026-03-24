import type {
  AdminDashboard,
  AuthResponse,
  Category,
  CategoryInput,
  ChangePasswordPayload,
  CurrentUserResponse,
  HomeData,
  LoginPayload,
  OrderDetail,
  OrderPayload,
  OrderResponse,
  PaymentMethod,
  ProfileUpdatePayload,
  RegisterPayload,
  ShoeCard,
  ShoeDetail,
  ShoeInput,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

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

async function request<T>(path: string, { token, revalidate, headers, ...init }: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

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
  return request<HomeData>("/home", { revalidate: 60 });
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories", { revalidate: 300 });
}

export async function listShoes(filters?: {
  category?: string;
  featured?: boolean;
  query?: string;
}): Promise<ShoeCard[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.featured !== undefined) params.set("featured", String(filters.featured));
  if (filters?.query) params.set("query", filters.query);
  const suffix = params.size > 0 ? `?${params}` : "";
  return request<ShoeCard[]>(`/shoes${suffix}`, { revalidate: 60 });
}

export async function getShoe(slug: string): Promise<ShoeDetail> {
  return request<ShoeDetail>(`/shoes/${slug}`, { revalidate: 60 });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshAuth(refreshToken: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(refreshToken: string): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
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

export async function listMyOrders(token: string): Promise<OrderResponse[]> {
  return request<OrderResponse[]>("/account/orders", { token });
}

export async function getMyOrder(token: string, orderId: number): Promise<OrderDetail> {
  return request<OrderDetail>(`/account/orders/${orderId}`, { token });
}

export async function getAdminDashboard(token: string): Promise<AdminDashboard> {
  return request<AdminDashboard>("/admin/dashboard", { token });
}

export async function getAdminShoes(token: string): Promise<ShoeDetail[]> {
  return request<ShoeDetail[]>("/admin/shoes", { token });
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
  return request<Category[]>("/admin/categories", { token });
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

export async function listAdminOrders(token: string, status?: string, query?: string): Promise<OrderResponse[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query) params.set("query", query);
  const suffix = params.size > 0 ? `?${params}` : "";
  return request<OrderResponse[]>(`/admin/orders${suffix}`, { token });
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

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};
