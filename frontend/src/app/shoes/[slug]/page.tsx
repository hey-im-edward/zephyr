import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoaderCircle, Palette, Sparkles, Truck } from "@/components/icons";

import { MotionReveal } from "@/components/motion-reveal";
import { PurchaseBox } from "@/components/purchase-box";
import { ReviewComposer } from "@/components/review-composer";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { WishlistToggle } from "@/components/wishlist-toggle";
import { Badge } from "@/components/ui/badge";
import { getRecommendations, getShoe, getShoeReviews } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { formatDateTime } from "@/lib/presentation";

type ShoePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ShoePage({ params }: ShoePageProps) {
  const { slug } = await params;
  const [shoe, reviews, recommendations] = await Promise.all([
    getShoe(slug).catch(() => null),
    getShoeReviews(slug).catch(() => []),
    getRecommendations(slug).catch(() => []),
  ]);

  if (!shoe) {
    notFound();
  }

  const gallery = [shoe.primaryImage, shoe.secondaryImage, ...(shoe.galleryImages ?? [])].filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );
  const accentColors = shoe.accentColors ?? [];
  const highlights = shoe.highlights ?? [];
  const sizeStocks = shoe.sizeStocks ?? [];
  const averageRating = shoe.averageRating ?? 0;
  const reviewCount = shoe.reviewCount ?? 0;

  return (
    <div className="page-shell py-10">
      <div className="page-frame space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <MotionReveal className="space-y-5">
            <div className="surface-strong overflow-hidden rounded-[2.8rem] p-4">
              <div className="space-y-4">
                <div className="flex min-h-[22rem] gap-3 lg:min-h-[31rem]">
                  {gallery.slice(0, 3).map((image, index) => (
                    <div
                      key={image}
                      className={`group relative min-w-0 flex-1 overflow-hidden rounded-[2rem] border border-white/56 transition-[flex,transform,box-shadow] duration-300 ${
                        index === 0 ? "lg:flex-[1.45]" : ""
                      } hover:-translate-y-1 lg:hover:flex-[1.8] hover:shadow-[0_24px_54px_rgba(11,24,42,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_48%,rgba(121,216,255,0.12)_100%)]" />
                      <Image
                        src={image}
                        alt={shoe.name}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 62vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.2),transparent_34%,rgba(121,216,255,0.12)_74%,rgba(215,193,255,0.18)),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.12))]" />
                      {index === 0 ? (
                        <div className="absolute inset-x-5 top-5 flex flex-wrap gap-2">
                          {shoe.featured ? <Badge>Zephyr select</Badge> : null}
                          {shoe.newArrival ? <Badge variant="secondary">New arrival</Badge> : null}
                          {shoe.bestSeller ? <Badge variant="success">Best seller</Badge> : null}
                          {shoe.campaignBadge ? <Badge variant="warning">{shoe.campaignBadge}</Badge> : null}
                        </div>
                      ) : null}
                      <div className="absolute inset-x-3 bottom-3 rounded-[1.2rem] border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-3 text-xs leading-5 text-white/90 backdrop-blur-[18px]">
                        {index === 0
                          ? "Main shot · hover để mở rộng ngay trong shell kính."
                          : index === 1
                            ? "Detail shot · đổi focus bằng hover."
                            : "Material shot · giữ media nổi nhưng không phá decision zone."}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="surface-panel rounded-[2rem] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{shoe.categoryName}</Badge>
                      <Badge>{shoe.silhouette}</Badge>
                    </div>
                    <div className="mt-4 font-display text-[2.8rem] font-extrabold leading-[0.92] tracking-[-0.05em] text-[var(--foreground-hero)]">
                      {shoe.name}
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                      Fit, stock, delivery và social proof phải đứng cùng một decision plane với gallery thay vì bị tách khỏi nơi mua.
                    </p>
                  </div>

                  <div className="surface-panel rounded-[2rem] p-5">
                    <div className="utility-label">Rating snapshot</div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <div className="font-display text-5xl font-extrabold tracking-[-0.05em] text-[var(--foreground-hero)]">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-[var(--muted)]">{reviewCount} review công khai</div>
                      </div>
                      <div className="rounded-full border border-white/58 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] px-4 py-2 text-sm text-[var(--foreground)]">
                        {shoe.inStock ? "Còn hàng" : "Tạm hết hàng"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-glass rounded-[2.5rem] p-7 md:p-8">
              <StorefrontSectionHeading eyebrow={shoe.categoryName} title={shoe.name} description={shoe.description} />

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-white/78 bg-white/30 px-3 py-1">{shoe.brand}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-3 py-1">{shoe.silhouette}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-3 py-1">{formatVnd(shoe.price)}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-3 py-1">SKU {shoe.sku}</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="surface-panel-muted rounded-[1.6rem] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Fit note</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {shoe.fitNote ?? "Form mang hằng ngày cân bằng, ưu tiên chọn true-to-size."}
                  </div>
                </div>
                <div className="surface-panel-muted rounded-[1.6rem] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Delivery</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {shoe.deliveryNote ?? "Miễn phí giao nhanh nội thành cho đơn flagship và hỗ trợ đổi size còn tồn."}
                  </div>
                </div>
                <div className="surface-panel-muted rounded-[1.6rem] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Media slot</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {shoe.videoUrl ? "PDP này đã có slot cho video sản phẩm." : "Thiết kế đã mở chỗ cho video campaign hoặc material close-up."}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <MotionReveal delay={0.06} className="surface-panel rounded-[2.2rem] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--foreground-hero)]">Bảng màu</div>
                  <Palette className="text-[var(--foreground-dim)]" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {accentColors.map((color) => (
                    <div key={color} className="space-y-2">
                      <div
                        className="h-12 w-12 rounded-full border border-white/80 shadow-[0_12px_30px_rgba(84,110,148,0.12)]"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--foreground-dim)]">{color}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {highlights.map((highlight, index) => (
                    <div
                      key={`${highlight}-${index}`}
                      className="rounded-[1.3rem] border border-white/78 bg-white/30 px-4 py-3 text-sm leading-6 text-[var(--muted)]"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </MotionReveal>

              <MotionReveal delay={0.08} className="surface-admin rounded-[2.2rem] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--foreground-hero)]">Tồn kho theo size</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-dim)]">Live stock</div>
                </div>
                <div className="space-y-3">
                  {sizeStocks.map((size) => (
                    <div
                      key={size.sizeLabel}
                      className="flex items-center justify-between rounded-[1.25rem] border border-white/82 bg-white/36 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-[var(--foreground)]">
                        <LoaderCircle className="text-[var(--accent)]" />
                        <span>EU {size.sizeLabel}</span>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {size.stockQuantity > 0 ? `Còn ${size.stockQuantity}` : "Hết hàng"}
                      </div>
                    </div>
                  ))}
                </div>
              </MotionReveal>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="space-y-5 xl:sticky xl:top-28">
            <PurchaseBox shoe={shoe} />
            <div className="surface-admin rounded-[2rem] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="utility-label">Wishlist + trust</div>
                  <div className="mt-2 font-display text-[2rem] font-extrabold tracking-[-0.05em] text-[var(--foreground-hero)]">
                    Giữ đôi này trong shortlist
                  </div>
                </div>
                <WishlistToggle shoeSlug={shoe.slug} />
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 text-[var(--accent)]" />
                  <span>Wishlist là lớp lưu ý định mua, tách khỏi cart để người dùng quay lại mà không làm bẩn checkout.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 text-[var(--accent)]" />
                  <span>PDP phải luôn nhắc người dùng về stock, shipping và review thay vì chỉ mô tả hình ảnh.</span>
                </div>
              </div>
            </div>
          </MotionReveal>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
          <MotionReveal className="surface-glass rounded-[2.5rem] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="utility-label">Reviews</div>
                <div className="mt-2 font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[var(--foreground-hero)]">
                  Feedback từ người mua thật
                </div>
              </div>
              <Badge variant="secondary">{reviews.length} review hiển thị</Badge>
            </div>

            <div className="mt-6 grid gap-4">
              {reviews.length === 0 ? (
                <div className="rounded-[1.7rem] border border-white/82 bg-white/34 p-6 text-sm leading-7 text-[var(--muted)]">
                  Chưa có review công khai cho sản phẩm này. Đây là chỗ để social proof sống cùng PDP thay vì bị tách sang một route khác.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.7rem] border border-white/82 bg-white/34 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[var(--foreground-hero)]">{review.title}</div>
                        <div className="mt-1 text-sm text-[var(--muted)]">
                          {review.customerName} • {formatDateTime(review.createdAt)}
                        </div>
                      </div>
                      <Badge>{review.rating}/5</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{review.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-[1.9rem] border border-white/82 bg-white/30 p-5">
              <div className="font-display text-[1.8rem] font-extrabold tracking-[-0.04em] text-[var(--foreground-hero)]">
                Viết review
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Người dùng đăng nhập có thể gửi review; hệ thống moderation giữ cho phần này sạch và đáng tin.
              </p>
              <div className="mt-5">
                <ReviewComposer shoeSlug={shoe.slug} />
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="space-y-5">
            <div className="surface-admin rounded-[2.4rem] p-6">
              <div className="utility-label">Recommendation rail</div>
              <div className="mt-2 font-display text-[2.4rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[var(--foreground-hero)]">
                Những đôi nên đứng cạnh sản phẩm này
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Recommendation slot là lớp merchandising thấp hơn hero nhưng cao hơn grid ngẫu nhiên.
              </p>
            </div>

            <div className="grid gap-4">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/shoes/${item.shoeSlug}`}
                  className="surface-panel flex gap-4 rounded-[1.8rem] p-4 transition hover:-translate-y-1"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.4rem]">
                    <Image src={item.primaryImage} alt={item.shoeName} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary">{item.reasonLabel}</Badge>
                    <div className="mt-3 font-display text-[1.8rem] font-extrabold leading-[0.96] tracking-[-0.04em] text-[var(--foreground-hero)]">
                      {item.shoeName}
                    </div>
                    <div className="text-sm text-[var(--muted)]">{item.brand}</div>
                    <div className="mt-3 text-sm font-bold text-[var(--foreground-hero)]">{formatVnd(item.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </MotionReveal>
        </section>
      </div>
    </div>
  );
}
