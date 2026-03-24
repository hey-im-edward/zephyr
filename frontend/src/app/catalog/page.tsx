import Link from "next/link";
import { Filter, Search } from "@/components/icons";

import { EmptyState } from "@/components/empty-state";
import { MotionReveal } from "@/components/motion-reveal";
import { ShoeCard } from "@/components/shoe-card";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { Button } from "@/components/ui/button";
import { getCategories, listShoes } from "@/lib/api";

type CatalogPageProps = {
  searchParams: Promise<{
    category?: string;
    query?: string;
    featured?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const featured = params.featured === "true" ? true : undefined;
  const [categories, shoes] = await Promise.all([
    getCategories(),
    listShoes({ category: params.category, query: params.query, featured }),
  ]);

  return (
    <div className="page-shell py-14">
      <div className="page-frame grid gap-8 lg:grid-cols-[1fr_0.36fr] lg:items-start">
        <MotionReveal className="space-y-8">
          <StorefrontSectionHeading
            eyebrow="Zephyr catalog"
            title="Tìm đúng đôi, đúng size và đúng bối cảnh sử dụng."
            description="Catalog được giữ rõ ràng để anh có thể lọc nhanh, quét nhanh và ra quyết định mua mà không bị cản bởi hiệu ứng thị giác."
          />

          <form className="flex flex-col gap-3 sm:flex-row" action="/catalog">
            {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
            {params.featured === "true" ? <input type="hidden" name="featured" value="true" /> : null}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                name="query"
                defaultValue={params.query}
                placeholder="Tìm theo tên mẫu, thương hiệu hoặc dòng giày"
                className="h-12 w-full rounded-full border border-white/10 bg-white/6 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/28"
              />
            </div>
            <Button type="submit">
              <Filter />
              Tìm kiếm
            </Button>
          </form>

          <MotionReveal className="flex flex-wrap gap-3">
            <Button asChild variant={!params.category && params.featured !== "true" ? "default" : "secondary"} size="sm">
              <Link href="/catalog">Tất cả</Link>
            </Button>
            <Button asChild variant={params.featured === "true" ? "default" : "secondary"} size="sm">
              <Link href="/catalog?featured=true">Zephyr edit</Link>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.slug}
                asChild
                variant={params.category === category.slug ? "default" : "secondary"}
                size="sm"
              >
                <Link
                  href={`/catalog?category=${category.slug}${params.query ? `&query=${encodeURIComponent(params.query)}` : ""}${params.featured === "true" ? "&featured=true" : ""}`}
                >
                  {category.name}
                </Link>
              </Button>
            ))}
          </MotionReveal>

          <MotionReveal className="surface-glass flex items-center justify-between gap-4 rounded-[1.5rem] px-4 py-3">
            <div className="text-sm text-[var(--muted)]">
              Đang hiển thị <span className="font-semibold text-white">{shoes.length}</span> sản phẩm
              {params.query ? ` cho từ khóa “${params.query}”` : ""}
            </div>
            {(params.category || params.query || params.featured === "true") && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/catalog">Xóa bộ lọc</Link>
              </Button>
            )}
          </MotionReveal>
        </MotionReveal>

        <MotionReveal className="surface-admin rounded-[2rem] p-5">
          <div className="utility-label">Cách duyệt nhanh</div>
          <div className="mt-4 space-y-3">
            {[
              "Lọc theo danh mục nếu anh đang đi tìm đúng ngữ cảnh sử dụng.",
              "Dùng từ khóa để đi thẳng vào brand hoặc dòng giày cụ thể.",
              "Mỗi đôi đều có trang chi tiết với size stock hiển thị ngay.",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/8 bg-[rgba(8,11,19,0.58)] p-4 text-sm leading-6 text-[var(--muted)]"
              >
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/35">0{index + 1}</div>
                {item}
              </div>
            ))}
          </div>
        </MotionReveal>
      </div>

      <div className="page-frame">
        {shoes.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Không tìm thấy mẫu giày phù hợp"
              description="Thử đổi từ khóa, bỏ bớt bộ lọc hoặc quay về catalog tổng để xem thêm lựa chọn."
              actionHref="/catalog"
              actionLabel="Xem toàn bộ catalog"
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shoes.map((shoe) => (
              <ShoeCard key={shoe.slug} shoe={shoe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
