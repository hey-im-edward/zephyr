import Image from "next/image";
import Link from "next/link";

import { CatalogFacetRail, CatalogSearchSortControls } from "@/components/catalog/catalog-controls";
import { EmptyState } from "@/components/empty-state";
import { MotionReveal } from "@/components/motion-reveal";
import { ShoeCard } from "@/components/shoe-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { toSafeImageUrl } from "@/lib/image-safety";
import { getFallbackCatalog, resolveStorefrontData } from "@/lib/storefront-fallback";

type CatalogPageProps = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    silhouette?: string;
    size?: string;
    query?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
};

const sortOptions = [
  { value: "featured", label: "Ưu tiên nổi bật" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "name-asc", label: "Tên A-Z" },
  { value: "newest", label: "Mới nhất" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const sortValueSet = new Set<SortValue>(sortOptions.map((option) => option.value));

function normalizeSort(sort?: string): SortValue {
  if (!sort) {
    return "featured";
  }

  return sortValueSet.has(sort as SortValue) ? (sort as SortValue) : "featured";
}

const fallbackCatalogBackground =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1700&q=80";

function withPage(
  params: Awaited<CatalogPageProps["searchParams"]>,
  page: number,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    query.set(key, value);
  }
  query.set("page", String(page));
  return query.toString();
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const normalizedSort = normalizeSort(params.sort);
  const catalogQuery = {
    category: params.category,
    brand: params.brand,
    silhouette: params.silhouette,
    size: params.size,
    query: params.query,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: normalizedSort,
    page: Number.isNaN(page) ? 1 : page,
    pageSize: 9,
  };
  const catalogResult = await resolveStorefrontData(() => getCatalog(catalogQuery), getFallbackCatalog(catalogQuery));

  if (!catalogResult.data) {
    return (
      <div className="page-shell py-10">
        <div className="page-frame">
          <EmptyState
            title="Catalog tạm gián đoạn"
            description="Không thể tải rail lọc và grid sản phẩm từ hệ thống lúc này. Catalog đang được giữ ở chế độ an toàn để tránh hiển thị dữ liệu demo như dữ liệu thật."
            actionHref="/catalog"
            actionLabel="Thử tải lại catalog"
          />
        </div>
      </div>
    );
  }

  const catalog = catalogResult.data;
  const isDemoFallback = catalogResult.mode === "demo-fallback";
  const safeHeroImage = toSafeImageUrl(
    catalog.heroCampaign?.backgroundImage ?? catalog.featuredCollections[0]?.coverImage,
    fallbackCatalogBackground,
  );
  const safeCollectionCover = toSafeImageUrl(catalog.featuredCollections[0]?.coverImage, fallbackCatalogBackground);

  return (
    <div className="page-shell py-10">
      <div className="page-frame space-y-8">
        {isDemoFallback ? (
          <div className="surface-panel rounded-4xl border border-amber-300/50 bg-amber-50/80 px-5 py-4 text-sm leading-7 text-amber-950">
            <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="warning">Chế độ demo</Badge>
              <span>
                Catalog đang hiển thị dữ liệu demo vì backend storefront chưa phản hồi. Bộ lọc và giá bên dưới chỉ dùng cho review giao diện, không dùng để ra quyết định vận hành.
              </span>
            </div>
          </div>
        ) : null}

        <section>
          <MotionReveal className="surface-strong relative overflow-hidden rounded-[2.8rem] p-5 md:p-7">
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="min-w-0 flex flex-col justify-between rounded-[2.2rem] bg-white/16 p-6">
                <div className="space-y-5">
                  <Badge>{catalog.heroCampaign?.eyebrow ?? "Catalog ZEPHYR"}</Badge>
                  <div className="space-y-4">
                    <h1 className="font-display text-[clamp(2rem,4.2vw,3.55rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-(--foreground-hero)">
                      {catalog.heroCampaign?.headline ?? "Lọc nhanh theo nhu cầu chạy, lifestyle, court hay trail."}
                    </h1>
                    <p className="max-w-xl text-base leading-8 text-(--muted-strong)">
                      {catalog.heroCampaign?.description ??
                        "Catalog mới tách mood, filter rail và product grid thành ba lớp rõ ràng để vừa premium hơn vừa dễ quét hơn."}
                    </p>
                  </div>
                </div>

                <CatalogSearchSortControls
                  key={`catalog-search-sort:${params.query ?? ""}:${normalizedSort}`}
                  baseParams={params}
                  initialQuery={params.query}
                  initialSort={normalizedSort}
                  sortOptions={sortOptions}
                />
              </div>

                <div className="min-w-0 grid gap-4">
                  <div className="surface-panel relative min-h-72 overflow-hidden rounded-[2.3rem]">
                    <Image
                    src={safeHeroImage}
                    alt={catalog.heroCampaign?.title ?? "ZEPHYR catalog"}
                    fill
                    priority
                      sizes="(max-width: 1280px) 100vw, 48vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,17,29,0.08),transparent_38%,rgba(255,255,255,0.28)_78%)]" />
                  {catalog.activePromotion ? (
                    <div className="absolute left-5 top-5 max-w-60 rounded-3xl border border-white/76 bg-white/26 p-4 backdrop-blur-[14px]">
                      <div className="utility-label">{catalog.activePromotion.badge}</div>
                      <div className="mt-2 font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-(--foreground-hero)">
                        {catalog.activePromotion.title}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-(--muted)">
                        {catalog.activePromotion.discountLabel}
                      </div>
                    </div>
                  ) : null}
                </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="surface-panel rounded-[1.9rem] p-5">
                      <div className="utility-label">Thương hiệu</div>
                    <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.04em] text-(--foreground-hero)">
                        {catalog.facets.brands.length}
                      </div>
                    <p className="mt-2 text-sm leading-6 text-(--muted)">
                      Danh sách brand được gói trong cùng một rail lọc thay vì tách ra thành nhiều module rời.
                    </p>
                  </div>
                    <div className="surface-panel rounded-[1.9rem] p-5">
                      <div className="utility-label">Khoảng giá</div>
                    <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.04em] text-(--foreground-hero)">
                        {catalog.facets.sizes.length} size
                      </div>
                    <p className="mt-2 text-sm leading-6 text-(--muted)">
                      Giá đang trải từ {formatVnd(catalog.facets.priceRange.min)} tới {formatVnd(catalog.facets.priceRange.max)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.34fr_0.66fr] xl:items-start">
          <MotionReveal className="surface-admin self-start rounded-[2.2rem] p-6 xl:sticky xl:top-28">
            <CatalogFacetRail
              key={`catalog-facets:${params.category ?? ""}:${params.brand ?? ""}:${params.silhouette ?? ""}:${params.size ?? ""}:${params.query ?? ""}:${params.sort ?? ""}:${params.page ?? ""}`}
              baseParams={params}
              initialDraft={{
                category: params.category,
                brand: params.brand,
                silhouette: params.silhouette,
                size: params.size,
              }}
              facets={catalog.facets}
              totalItems={catalog.pagination.totalItems}
            />
          </MotionReveal>

          <MotionReveal delay={0.08} className="space-y-6">
            {catalog.featuredCollections.length > 0 ? (
              <div className="surface-panel overflow-hidden rounded-4xl p-4">
                <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr]">
                  <div className="relative min-h-56 overflow-hidden rounded-[1.6rem]">
                    <Image
                      src={safeCollectionCover}
                      alt={catalog.featuredCollections[0].name}
                      fill
                      sizes="(max-width: 768px) 100vw, 36vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-4 rounded-[1.6rem] bg-white/18 p-5">
                    <div className="space-y-3">
                      <Badge>{catalog.featuredCollections[0].featureLabel}</Badge>
                      <div className="font-display text-[1.45rem] font-semibold leading-none tracking-[-0.03em] text-(--foreground-hero)">
                        {catalog.featuredCollections[0].name}
                      </div>
                      <p className="text-sm leading-6 text-(--muted)">
                        {catalog.featuredCollections[0].description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(catalog.featuredCollections[0].items ?? []).slice(0, 3).map((item) => (
                        <Badge key={item.id} variant="secondary">
                          {item.brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {catalog.items.length === 0 ? (
              <EmptyState
                title="Không tìm thấy mẫu giày phù hợp"
                description="Thử đổi brand, size, silhouette hoặc bỏ bớt bộ lọc để mở rộng phạm vi hiển thị."
                actionHref="/catalog"
                actionLabel="Xem toàn bộ catalog"
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((shoe) => (
                  <ShoeCard key={shoe.slug} shoe={shoe} />
                ))}
              </div>
            )}

            {catalog.pagination.totalPages > 1 ? (
              <div className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] px-5 py-4">
                <div className="text-sm text-(--muted)">
                  Trang <span className="font-semibold text-(--foreground-hero)">{catalog.pagination.page}</span> / {catalog.pagination.totalPages}
                </div>
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className={catalog.pagination.page <= 1 ? "pointer-events-none opacity-40" : ""}
                  >
                    <Link href={`/catalog?${withPage(params, catalog.pagination.page - 1)}`}>
                      Trang trước
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className={catalog.pagination.page >= catalog.pagination.totalPages ? "pointer-events-none opacity-40" : ""}
                  >
                    <Link href={`/catalog?${withPage(params, catalog.pagination.page + 1)}`}>
                      Trang sau
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </MotionReveal>
        </section>
      </div>
    </div>
  );
}
