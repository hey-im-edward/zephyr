export type UserRole = "ADMIN" | "USER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type ReviewStatus = "PUBLISHED" | "PENDING" | "HIDDEN";

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
  campaignBadge?: string | null;
  averageRating: number;
  reviewCount: number;
};

export type ShoeDetail = ShoeCard & {
  sku: string;
  description: string;
  availableSizes: string[];
  sizeStocks: SizeStock[];
  accentColors: string[];
  highlights: string[];
  galleryImages: string[];
  videoUrl?: string | null;
  fitNote?: string | null;
  deliveryNote?: string | null;
  totalStock: number;
  inStock: boolean;
};

export type Campaign = {
  id: number;
  title: string;
  slug: string;
  placement: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage: string;
  focalImage: string;
  heroTone: string;
  active: boolean;
  sortOrder: number;
};

export type BannerSlot = {
  id: number;
  slotKey: string;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  tone: string;
  active: boolean;
  sortOrder: number;
};

export type Promotion = {
  id: number;
  code: string;
  title: string;
  description: string;
  badge: string;
  discountLabel: string;
  heroTone: string;
  active: boolean;
  featured: boolean;
};

export type CollectionItemPreview = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  silhouette: string;
  shortDescription: string;
  price: number;
  primaryImage: string;
  categoryName: string;
};

export type MerchCollection = {
  id: number;
  name: string;
  slug: string;
  description: string;
  featureLabel: string;
  heroTone: string;
  coverImage: string;
  active: boolean;
  sortOrder: number;
  items: CollectionItemPreview[];
};

export type CatalogPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CatalogFacets = {
  categories: string[];
  brands: string[];
  silhouettes: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

export type CatalogData = {
  items: ShoeCard[];
  pagination: CatalogPagination;
  facets: CatalogFacets;
  heroCampaign: Campaign | null;
  activePromotion: Promotion | null;
  featuredCollections: MerchCollection[];
};

export type HomeData = {
  headline: string;
  subheadline: string;
  spotlightLabel: string;
  categories: Category[];
  featured: ShoeCard[];
  newArrivals: ShoeCard[];
  heroCampaign: Campaign | null;
  promoBanners: BannerSlot[];
  featuredCollections: MerchCollection[];
  activePromotion: Promotion | null;
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

export type ShippingMethod = {
  id: number;
  name: string;
  slug: string;
  description: string;
  fee: number;
  etaLabel: string;
  active: boolean;
  priority: number;
};

export type UserAddress = {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  defaultAddress: boolean;
};

export type WishlistItem = {
  id: number;
  shoeId: number;
  shoeSlug: string;
  shoeName: string;
  brand: string;
  silhouette: string;
  primaryImage: string;
  price: number;
  categoryName: string;
  inStock: boolean;
};

export type Recommendation = {
  id: number;
  reasonLabel: string;
  shoeId: number;
  shoeSlug: string;
  shoeName: string;
  brand: string;
  silhouette: string;
  primaryImage: string;
  price: number;
  categoryName: string;
};

export type Review = {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string | null;
};

export type OrderPayload = {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  shippingMethodSlug?: string;
  promotionCode?: string;
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
  shippingMethodName?: string | null;
  promotionCode?: string | null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  deliveryWindow?: string | null;
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

export type AddressInput = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  defaultAddress: boolean;
};

export type WishlistInput = {
  shoeSlug: string;
};

export type ReviewInput = {
  rating: number;
  title: string;
  body: string;
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

export type CampaignInput = {
  title: string;
  placement: string;
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage: string;
  focalImage: string;
  heroTone: string;
  active: boolean;
  sortOrder: number;
};

export type BannerSlotInput = {
  slotKey: string;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  tone: string;
  active: boolean;
  sortOrder: number;
};

export type CollectionInput = {
  name: string;
  description: string;
  featureLabel: string;
  heroTone: string;
  coverImage: string;
  active: boolean;
  sortOrder: number;
  shoeIds: number[];
};

export type MediaAsset = {
  id: number;
  name: string;
  mediaKind: string;
  url: string;
  altText: string;
  dominantTone: string;
  tags: string;
  createdAt: string;
};

export type MediaAssetInput = {
  name: string;
  mediaKind: string;
  url: string;
  altText: string;
  dominantTone: string;
  tags: string;
};

export type PromotionInput = {
  code: string;
  title: string;
  description: string;
  badge: string;
  discountLabel: string;
  heroTone: string;
  active: boolean;
  featured: boolean;
};

export type ShippingMethodInput = {
  name: string;
  description: string;
  fee: number;
  etaLabel: string;
  active: boolean;
  priority: number;
};

export type AdminRole = {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
};

export type AdminRoleInput = {
  code: string;
  name: string;
  description: string;
  active: boolean;
};

export type AuditLog = {
  id: number;
  actorName: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  message: string;
  createdAt: string;
};

export type CatalogQuery = {
  category?: string;
  brand?: string;
  silhouette?: string;
  size?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "name-asc" | "newest";
  page?: number;
  pageSize?: number;
};
