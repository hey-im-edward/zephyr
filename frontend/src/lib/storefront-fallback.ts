import type {
  BannerSlot,
  Campaign,
  CatalogData,
  CatalogQuery,
  Category,
  HomeData,
  MerchCollection,
  Promotion,
  ShippingMethod,
  ShoeCard,
} from "@/lib/types";

const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Running",
    slug: "running",
    description: "Nhịp chạy êm, gọn và sáng cho buổi tập lẫn ngày thường.",
    heroTone: "#89bbff",
  },
  {
    id: 2,
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Giữ mood thời trang trong khi vẫn còn đủ độ êm để mang cả ngày.",
    heroTone: "#d9b789",
  },
  {
    id: 3,
    name: "Court",
    slug: "court",
    description: "Form thấp, sạch, phù hợp nhịp đi từ sân tới phố.",
    heroTone: "#ef9f65",
  },
  {
    id: 4,
    name: "Trail",
    slug: "trail",
    description: "Bám chắc hơn, giàu texture hơn và hợp những route ngoài phố.",
    heroTone: "#8fc09a",
  },
];

const fallbackShoes: ShoeCard[] = [
  {
    id: 101,
    name: "On Cloudmonster Mist",
    slug: "on-cloudmonster-mist",
    brand: "On",
    silhouette: "Hiệu năng đa dụng",
    shortDescription: "Đệm đàn hồi đặc trưng của On trong một tổng thể tối giản và cao cấp.",
    price: 4990000,
    primaryImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
    categorySlug: "running",
    categoryName: "Running",
    featured: true,
    newArrival: true,
    bestSeller: false,
    campaignBadge: "Launch edit",
    averageRating: 4.8,
    reviewCount: 18,
  },
  {
    id: 102,
    name: "Salomon XA Pro Ridge",
    slug: "salomon-xa-pro-ridge",
    brand: "Salomon",
    silhouette: "Trail kỹ thuật",
    shortDescription: "Quick-lace, bám địa hình và đủ sắc để đi thẳng từ trail vào phố.",
    price: 4690000,
    primaryImage:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
    categorySlug: "trail",
    categoryName: "Trail",
    featured: true,
    newArrival: false,
    bestSeller: true,
    campaignBadge: "Trail focus",
    averageRating: 4.7,
    reviewCount: 12,
  },
  {
    id: 103,
    name: "Nike Vomero 18 Ember",
    slug: "nike-vomero-18-ember",
    brand: "Nike",
    silhouette: "Running đệm dày",
    shortDescription: "Đệm mềm và dày hơn để chạy recovery nhưng vẫn hợp đi hàng ngày.",
    price: 4190000,
    primaryImage:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
    categorySlug: "running",
    categoryName: "Running",
    featured: true,
    newArrival: false,
    bestSeller: false,
    campaignBadge: "Pace edit",
    averageRating: 4.6,
    reviewCount: 9,
  },
  {
    id: 104,
    name: "Adidas Samba Pearl",
    slug: "adidas-samba-pearl",
    brand: "Adidas",
    silhouette: "Court cổ điển",
    shortDescription: "Biểu tượng low-profile với chất da mềm và để đi mỗi ngày.",
    price: 2890000,
    primaryImage:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80",
    categorySlug: "court",
    categoryName: "Court",
    featured: false,
    newArrival: false,
    bestSeller: true,
    campaignBadge: "Low profile",
    averageRating: 4.5,
    reviewCount: 15,
  },
  {
    id: 105,
    name: "New Balance 9060 Drift Sand",
    slug: "new-balance-9060-drift-sand",
    brand: "New Balance",
    silhouette: "Lifestyle đế dày",
    shortDescription: "Một profile lifestyle có độ dày đế và độ mềm đúng nhịp seasonal edit.",
    price: 4390000,
    primaryImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80&sat=-20",
    secondaryImage:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1200&q=80&sat=-20",
    categorySlug: "lifestyle",
    categoryName: "Lifestyle",
    featured: false,
    newArrival: true,
    bestSeller: false,
    campaignBadge: "Soft neutral",
    averageRating: 4.4,
    reviewCount: 7,
  },
  {
    id: 106,
    name: "ASICS Gel Kayano Skyline",
    slug: "asics-gel-kayano-skyline",
    brand: "ASICS",
    silhouette: "Running trợ lực",
    shortDescription: "Một đôi chạy ổn định cho người chạy nhiều nhưng vẫn muốn ngoại hình nổi bật.",
    price: 3890000,
    primaryImage:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
    categorySlug: "running",
    categoryName: "Running",
    featured: false,
    newArrival: false,
    bestSeller: false,
    campaignBadge: "Support edit",
    averageRating: 4.3,
    reviewCount: 11,
  },
];

const fallbackHeroCampaign: Campaign = {
  id: 401,
  title: "Transparent overlay launch",
  slug: "transparent-overlay-launch",
  placement: "HOME_HERO",
  eyebrow: "Transparent overlay hybrid",
  headline: "Scene thật, lớp kính trong và product focus đủ mạnh để mở storefront.",
  description:
    "ZEPHYR V3 đặt product và lifestyle trong cùng một bố cục editorial, còn glass chỉ làm lớp điều hướng ánh nhìn.",
  ctaLabel: "Mở bộ sưu tập",
  ctaHref: "/catalog",
  backgroundImage:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1700&q=80",
  focalImage:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  heroTone:
    "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(121,216,255,0.26) 34%, rgba(140,127,255,0.18) 64%, rgba(255,255,255,0.14))",
  active: true,
  sortOrder: 1,
};

const fallbackPromotion: Promotion = {
  id: 501,
  code: "SKYGLASS",
  title: "Sky Glass Launch",
  description: "Ưu đãi mở đầu cho storefront V3 với transparent glass rõ hơn và product focus sạch hơn.",
  badge: "Launch benefit",
  discountLabel: "Giảm 8% cho đơn đầu",
  heroTone: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(121,216,255,0.22), rgba(140,127,255,0.2))",
  active: true,
  featured: true,
};

const fallbackBanners: BannerSlot[] = [
  {
    id: 601,
    slotKey: "seasonal-drop",
    badge: "Seasonal drop",
    title: "Early morning glass",
    description: "Một lớp launch benefit để nối hero sang collection và PDP mà không phá mood chính.",
    ctaLabel: "Xem collection",
    ctaHref: "/catalog?sort=featured",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    tone: "linear-gradient(135deg, rgba(255,255,255,0.24), rgba(121,216,255,0.24), rgba(255,212,152,0.2))",
    active: true,
    sortOrder: 1,
  },
  {
    id: 602,
    slotKey: "checkout-trust",
    badge: "Trust layer",
    title: "Shipping đọc được ngay",
    description: "Decision surfaces sáng, rõ, ít blur hơn để giữ conversion.",
    ctaLabel: "Mở checkout",
    ctaHref: "/checkout",
    imageUrl: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80",
    tone: "linear-gradient(135deg, rgba(255,255,255,0.26), rgba(180,205,255,0.22), rgba(255,255,255,0.14))",
    active: true,
    sortOrder: 2,
  },
  {
    id: 603,
    slotKey: "account-shell",
    badge: "Member access",
    title: "Tài khoản nối liền",
    description: "Wishlist, order history và address book được kéo vào cùng một brand shell.",
    ctaLabel: "Mở tài khoản",
    ctaHref: "/tai-khoan",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
    tone: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(192,245,237,0.24), rgba(140,127,255,0.16))",
    active: true,
    sortOrder: 3,
  },
];

const fallbackCollections: MerchCollection[] = [
  {
    id: 701,
    name: "Airy Lifestyle Stack",
    slug: "airy-lifestyle-stack",
    description: "Neutral layers, da lộn mềm và visual đủ ấm để đặt giữa hero và product grid.",
    featureLabel: "Lifestyle edit",
    heroTone: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(223,190,149,0.26), rgba(121,216,255,0.12))",
    coverImage: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1400&q=80",
    active: true,
    sortOrder: 1,
    items: fallbackShoes.slice(3, 6).map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      slug: shoe.slug,
      brand: shoe.brand,
      silhouette: shoe.silhouette,
      shortDescription: shoe.shortDescription,
      price: shoe.price,
      primaryImage: shoe.primaryImage,
      categoryName: shoe.categoryName,
    })),
  },
  {
    id: 702,
    name: "Pace Builder Running",
    slug: "pace-builder-running",
    description: "Một nhóm chạy êm và trợ lực vừa đủ để chiếm decision zone mà vẫn đọc được ngay.",
    featureLabel: "Running edit",
    heroTone: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(121,216,255,0.24), rgba(140,127,255,0.16))",
    coverImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1400&q=80",
    active: true,
    sortOrder: 2,
    items: fallbackShoes.slice(0, 3).map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      slug: shoe.slug,
      brand: shoe.brand,
      silhouette: shoe.silhouette,
      shortDescription: shoe.shortDescription,
      price: shoe.price,
      primaryImage: shoe.primaryImage,
      categoryName: shoe.categoryName,
    })),
  },
  {
    id: 703,
    name: "Low-profile Court",
    slug: "low-profile-court",
    description: "Court silhouettes được hạ xuống tầng bridge giữa collection và grid.",
    featureLabel: "Court bridge",
    heroTone: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,212,152,0.22), rgba(255,255,255,0.12))",
    coverImage: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1400&q=80",
    active: true,
    sortOrder: 3,
    items: fallbackShoes.slice(2, 5).map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      slug: shoe.slug,
      brand: shoe.brand,
      silhouette: shoe.silhouette,
      shortDescription: shoe.shortDescription,
      price: shoe.price,
      primaryImage: shoe.primaryImage,
      categoryName: shoe.categoryName,
    })),
  },
];

export const fallbackShippingMethods: ShippingMethod[] = [
  {
    id: 801,
    name: "Giao tiêu chuẩn",
    slug: "standard",
    description: "Giao hàng toàn quốc trong nhịp ổn định cho phần lớn đơn hàng.",
    fee: 30000,
    etaLabel: "2-4 ngày",
    active: true,
    priority: 1,
  },
  {
    id: 802,
    name: "Giao nhanh nội thành",
    slug: "express-city",
    description: "Ưu tiên nội thành với thời gian rút ngắn cho các đôi flagship.",
    fee: 60000,
    etaLabel: "Trong ngày",
    active: true,
    priority: 2,
  },
  {
    id: 803,
    name: "Nhận tại studio",
    slug: "pickup",
    description: "Đặt trước online và nhận tại điểm trải nghiệm của ZEPHYR.",
    fee: 0,
    etaLabel: "Đặt lịch nhận",
    active: true,
    priority: 3,
  },
];

export const fallbackPromotions: Promotion[] = [
  fallbackPromotion,
  {
    ...fallbackPromotion,
    id: 502,
    code: "RUNCLUB",
    title: "Run club welcome",
    badge: "Community perk",
    discountLabel: "Tặng ship nội thành",
    featured: false,
  },
];

export const fallbackHomeData: HomeData = {
  headline: "Scene thật, lớp kính trong và product focus đủ mạnh để mở storefront.",
  subheadline:
    "ZEPHYR dùng transparent glass như một lớp điều hướng ánh nhìn: nâng scene, giữ product focus và mở đường cho quyết định mua rõ ràng hơn.",
  spotlightLabel: "Transparent overlay hybrid",
  categories: fallbackCategories,
  featured: fallbackShoes.slice(0, 3),
  newArrivals: fallbackShoes.filter((shoe) => shoe.newArrival),
  heroCampaign: fallbackHeroCampaign,
  promoBanners: fallbackBanners,
  featuredCollections: fallbackCollections,
  activePromotion: fallbackPromotion,
};

function includesLoose(value: string, query?: string) {
  return !query || value.toLowerCase().includes(query.toLowerCase());
}

export function getFallbackCatalog(query: CatalogQuery = {}): CatalogData {
  const filteredItems = fallbackShoes.filter((shoe) => {
    const matchesCategory = !query.category || shoe.categorySlug === query.category || shoe.categoryName === query.category;
    const matchesBrand = !query.brand || shoe.brand === query.brand;
    const matchesSilhouette = !query.silhouette || shoe.silhouette === query.silhouette;
    const matchesQuery =
      !query.query ||
      [shoe.name, shoe.brand, shoe.silhouette, shoe.categoryName].some((value) => includesLoose(value, query.query));
    const matchesMinPrice = query.minPrice === undefined || shoe.price >= query.minPrice;
    const matchesMaxPrice = query.maxPrice === undefined || shoe.price <= query.maxPrice;
    return matchesCategory && matchesBrand && matchesSilhouette && matchesQuery && matchesMinPrice && matchesMaxPrice;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (query.sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "newest":
        return Number(b.newArrival) - Number(a.newArrival);
      case "featured":
      default:
        return Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller);
    }
  });

  const pageSize = query.pageSize ?? 9;
  const page = Math.max(1, query.page ?? 1);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = sortedItems.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: pageItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
    facets: {
      categories: fallbackCategories.map((category) => category.slug),
      brands: [...new Set(fallbackShoes.map((shoe) => shoe.brand))],
      silhouettes: [...new Set(fallbackShoes.map((shoe) => shoe.silhouette))],
      sizes: ["39", "40", "41", "42", "43", "44"],
      priceRange: {
        min: Math.min(...fallbackShoes.map((shoe) => shoe.price)),
        max: Math.max(...fallbackShoes.map((shoe) => shoe.price)),
      },
    },
    heroCampaign: {
      ...fallbackHeroCampaign,
      placement: "CATALOG_HERO",
      title: "Catalog transparent overlay",
      headline: "Lọc nhanh nhưng storefront vẫn còn mood.",
      description:
        "Filter rail, promo bridge và product grid được đưa vào một hệ trong suốt hơn, không còn form panel khô.",
    },
    activePromotion: fallbackPromotion,
    featuredCollections: fallbackCollections,
  };
}
