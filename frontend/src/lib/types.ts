export type UserRole = "ADMIN" | "USER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "BANK_TRANSFER";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  heroTone: string;
};

export type SizeStock = {
  sizeLabel: string;
  stockQuantity: number;
  available: boolean;
};

export type ShoeCard = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  silhouette: string;
  shortDescription: string;
  price: number;
  primaryImage: string;
  secondaryImage: string;
  categorySlug: string;
  categoryName: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
};

export type ShoeDetail = ShoeCard & {
  sku: string;
  description: string;
  availableSizes: string[];
  sizeStocks: SizeStock[];
  accentColors: string[];
  highlights: string[];
  totalStock: number;
  inStock: boolean;
};

export type HomeData = {
  headline: string;
  subheadline: string;
  spotlightLabel: string;
  categories: Category[];
  featured: ShoeCard[];
  newArrivals: ShoeCard[];
};

export type CartItem = {
  shoeSlug: string;
  shoeName: string;
  brand: string;
  price: number;
  primaryImage: string;
  sizeLabel: string;
  quantity: number;
};

export type OrderPayload = {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: Array<{
    shoeSlug: string;
    sizeLabel: string;
    quantity: number;
  }>;
};

export type OrderResponse = {
  id: number;
  orderCode: string;
  customerName: string;
  email: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
};

export type OrderItem = {
  shoeSlug: string;
  shoeName: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type OrderDetail = OrderResponse & {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  notes?: string | null;
  updatedAt: string | null;
  items: OrderItem[];
};

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type ProfileUpdatePayload = {
  fullName: string;
  phone: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type AdminDashboard = {
  categoryCount: number;
  shoeCount: number;
  userCount: number;
  orderCount: number;
  pendingOrderCount: number;
  totalRevenue: number;
};

export type ShoeInput = {
  sku: string;
  name: string;
  brand: string;
  silhouette: string;
  shortDescription: string;
  description: string;
  price: number;
  primaryImage: string;
  secondaryImage: string;
  sizeStocks: Array<{
    sizeLabel: string;
    stockQuantity: number;
  }>;
  accentColors: string[];
  highlights: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  categorySlug: string;
};

export type CategoryInput = {
  name: string;
  description: string;
  heroTone: string;
};
