import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoaderCircle, Palette, Sparkles, Truck } from "@/components/icons";

import { MotionReveal } from "@/components/motion-reveal";
import { PurchaseBox } from "@/components/purchase-box";
import { RevealAfterCta } from "@/components/reveal-after-cta";
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
    <div className="page-shell py-6 sm:py-8 lg:py-10">
      <div className="page-frame space-y-6 sm:space-y-8">
        <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <MotionReveal className="order-2 space-y-4 sm:space-y-5 xl:order-1">
            <div className="surface-strong overflow-hidden rounded-[2rem] p-3 sm:rounded-[2.4rem] sm:p-4">
              <div className="space-y-4">
                <div className="flex min-h-[14.5rem] gap-2 sm:min-h-[19rem] sm:gap-3 lg:min-h-[31rem]">
                  {gallery.slice(0, 3).map((image, index) => (
                    <div
                      key={image}
                      className={`group relative min-w-0 flex-1 overflow-hidden rounded-[1.35rem] border border-white/56 transition-[flex,transform,box-shadow] duration-300 sm:rounded-[2rem] ${
                        index === 0 ? "lg:flex-[1.45]" : ""
                      } ${index > 0 ? "max-[420px]:hidden" : ""} hover:-translate-y-1 lg:hover:flex-[1.8] hover:shadow-[0_24px_54px_rgba(11,24,42,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]`}
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
                        <div className="absolute inset-x-4 top-4 flex flex-wrap gap-1.5 sm:inset-x-5 sm:top-5 sm:gap-2">
                          {shoe.featured ? <Badge>Zephyr select</Badge> : null}
                          {shoe.newArrival ? <Badge variant="secondary">New arrival</Badge> : null}
                          {shoe.bestSeller ? <Badge variant="success">Best seller</Badge> : null}
                          {shoe.campaignBadge ? <Badge variant="warning">{shoe.campaignBadge}</Badge> : null}
                        </div>
                      ) : null}
                      <div className="absolute inset-x-3 bottom-3 rounded-[1.2rem] border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-3 text-xs leading-5 text-white/90 backdrop-blur-[18px] max-[420px]:hidden">
                        {index === 0
                          ? "Main shot · hover để mở rộng ngay trong shell kính."
                          : index === 1
                            ? "Detail shot · đổi focus bằng hover."
                            : "Material shot · giữ media nổi nhưng không phá decision zone."}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="surface-panel rounded-[1.8rem] p-4 sm:rounded-[2rem] sm:p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{shoe.categoryName}</Badge>
                      <Badge>{shoe.silhouette}</Badge>
                    </div>
                    <div className="mt-3 font-display text-[1.95rem] font-extrabold leading-[0.92] tracking-[-0.05em] text-[var(--foreground-hero)] sm:mt-4 sm:text-[2.35rem] md:text-[2.8rem]">
                      {shoe.name}
                    </div>
                    <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--muted)] sm:mt-3 sm:text-sm sm:leading-7">
                      Fit, stock, delivery và social proof phải đứng cùng một decision plane với gallery thay vì bị tách khỏi nơi mua.
                    </p>
                  </div>

                  <div className="surface-panel rounded-[1.8rem] p-4 sm:rounded-[2rem] sm:p-5">
                    <div className="utility-label">Rating snapshot</div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <div className="font-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--foreground-hero)] sm:text-5xl">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-[var(--muted)] sm:text-sm">{reviewCount} review công khai</div>
                      </div>
                      <div className="rounded-full border border-white/58 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] px-3 py-1.5 text-xs text-[var(--foreground)] sm:px-4 sm:py-2 sm:text-sm">
                        {shoe.inStock ? "Còn hàng" : "Tạm hết hàng"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-glass rounded-[2rem] p-4 sm:p-5 md:rounded-[2.5rem] md:p-8">
              <StorefrontSectionHeading eyebrow={shoe.categoryName} title={shoe.name} description={shoe.description} />

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] sm:mt-5 sm:gap-3 sm:text-sm">
                <span className="rounded-full border border-white/78 bg-white/30 px-2.5 py-1 sm:px-3">{shoe.brand}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-2.5 py-1 sm:px-3">{shoe.silhouette}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-2.5 py-1 sm:px-3">{formatVnd(shoe.price)}</span>
                <span className="rounded-full border border-white/78 bg-white/30 px-2.5 py-1 sm:px-3">SKU {shoe.sku}</span>
              </div>

              <div className="mt-4 grid gap-3 min-[560px]:grid-cols-2 md:mt-6 md:gap-4 md:grid-cols-3">
                <div className="surface-panel-muted rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-dim)] sm:text-[11px] sm:tracking-[0.18em]">Fit note</div>
                  <div className="mt-1.5 text-xs leading-6 text-[var(--muted)] sm:mt-2 sm:text-sm sm:leading-7">
                    {shoe.fitNote ?? "Form mang hằng ngày cân bằng, ưu tiên chọn true-to-size."}
                  </div>
                </div>
                <div className="surface-panel-muted rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-dim)] sm:text-[11px] sm:tracking-[0.18em]">Delivery</div>
                  <div className="mt-1.5 text-xs leading-6 text-[var(--muted)] sm:mt-2 sm:text-sm sm:leading-7">
                    {shoe.deliveryNote ?? "Miễn phí giao nhanh nội thành cho đơn flagship và hỗ trợ đổi size còn tồn."}
                  </div>
                </div>
                <div className="surface-panel-muted rounded-[1.4rem] p-3 max-[420px]:hidden sm:rounded-[1.6rem] sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-dim)] sm:text-[11px] sm:tracking-[0.18em]">Media slot</div>
                  <div className="mt-1.5 text-xs leading-6 text-[var(--muted)] sm:mt-2 sm:text-sm sm:leading-7">
                    {shoe.videoUrl ? "PDP này đã có slot cho video sản phẩm." : "Thiết kế đã mở chỗ cho video campaign hoặc material close-up."}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <MotionReveal delay={0.06} className="surface-panel rounded-[1.8rem] p-4 sm:rounded-[2rem] sm:p-5 md:rounded-[2.2rem] md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--foreground-hero)]">Bảng màu</div>
                  <Palette className="text-[var(--foreground-dim)]" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {accentColors.map((color) => (
                    <div key={color} className="space-y-2">
                      <div
                        className="h-10 w-10 rounded-full border border-white/80 shadow-[0_12px_30px_rgba(84,110,148,0.12)] sm:h-12 sm:w-12"
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
                      className={`rounded-[1.3rem] border border-white/78 bg-white/30 px-4 py-3 text-xs leading-5 text-[var(--muted)] sm:text-sm sm:leading-6 ${
                        index > 1 ? "max-[420px]:hidden" : ""
                      }`}
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </MotionReveal>

              <MotionReveal delay={0.08} className="surface-admin rounded-[1.8rem] p-4 sm:rounded-[2rem] sm:p-5 md:rounded-[2.2rem] md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--foreground-hero)]">Tồn kho theo size</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-dim)]">Live stock</div>
                </div>
                <div className="grid grid-cols-2 gap-2 min-[500px]:grid-cols-3 md:grid-cols-1 md:gap-3">
                  {sizeStocks.map((size) => (
                    <div
                      key={size.sizeLabel}
                      className="flex items-center justify-between gap-2 rounded-[1rem] border border-white/82 bg-white/36 px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <div className="flex items-center gap-2 text-xs text-[var(--foreground)] sm:text-sm">
                        <LoaderCircle className="text-[var(--accent)]" />
                        <span>EU {size.sizeLabel}</span>
                      </div>
                      <div className="text-xs text-[var(--muted)] sm:text-sm">
                        {size.stockQuantity > 0 ? `Còn ${size.stockQuantity}` : "Hết hàng"}
                      </div>
                    </div>
                  ))}
                </div>
              </MotionReveal>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="order-1 space-y-3 sm:space-y-4 xl:order-2 xl:sticky xl:top-28">
            <PurchaseBox shoe={shoe} />
            <div className="surface-admin rounded-[1.7rem] p-4 sm:rounded-[2rem] sm:p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="utility-label">Wishlist + trust</div>
                  <div className="mt-2 font-display text-[1.4rem] font-extrabold tracking-[-0.05em] text-[var(--foreground-hero)] sm:text-[1.75rem] md:text-[2rem]">
                    Giữ đôi này trong shortlist
                  </div>
                </div>
                <WishlistToggle shoeSlug={shoe.slug} />
              </div>
              <div className="mt-3 space-y-2.5 text-xs leading-6 text-[var(--muted)] sm:mt-4 sm:space-y-3 sm:text-sm sm:leading-7">
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

        <section className="grid gap-4 sm:gap-5 xl:grid-cols-[1.04fr_0.96fr]">
          <MotionReveal className="surface-glass rounded-[2rem] p-4 sm:p-5 md:rounded-[2.5rem] md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="utility-label">Reviews</div>
                <div className="mt-2 font-display text-[1.85rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[var(--foreground-hero)] sm:text-[2.2rem] md:text-[2.6rem]">
                  Feedback từ người mua thật
                </div>
              </div>
              <Badge variant="secondary">{reviews.length} review hiển thị</Badge>
            </div>

            <div className="mt-6 grid gap-4">
              {reviews.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/82 bg-white/34 p-4 text-xs leading-6 text-[var(--muted)] sm:rounded-[1.7rem] sm:p-6 sm:text-sm sm:leading-7">
                  Chưa có review công khai cho sản phẩm này. Đây là chỗ để social proof sống cùng PDP thay vì bị tách sang một route khác.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.5rem] border border-white/82 bg-white/34 p-4 sm:rounded-[1.7rem] sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[var(--foreground-hero)]">{review.title}</div>
                        <div className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                          {review.customerName} • {formatDateTime(review.createdAt)}
                        </div>
                      </div>
                      <Badge>{review.rating}/5</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[var(--muted)] sm:mt-3 sm:text-sm sm:leading-7">{review.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-white/82 bg-white/30 p-4 sm:rounded-[1.9rem] sm:p-5">
              <div className="font-display text-[1.5rem] font-extrabold tracking-[-0.04em] text-[var(--foreground-hero)] sm:text-[1.8rem]">
                Viết review
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--muted)] sm:text-sm sm:leading-7">
                Chỉ người mua đã nhận hàng mới có thể gửi đánh giá; mọi nội dung mới hoặc chỉnh sửa đều phải qua duyệt.
              </p>
              <div className="mt-4 sm:mt-5">
                <ReviewComposer shoeSlug={shoe.slug} />
              </div>
            </div>
          </MotionReveal>

          <RevealAfterCta ctaSelector="#pdp-cta-zone">
            <MotionReveal delay={0.08} className="space-y-4 sm:space-y-5">
              <div className="surface-admin rounded-[1.9rem] p-4 sm:rounded-[2.2rem] sm:p-5 md:rounded-[2.4rem] md:p-6">
                <div className="utility-label">Recommendation rail</div>
                <div className="mt-2 font-display text-[1.8rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[var(--foreground-hero)] sm:text-[2.1rem] md:text-[2.4rem]">
                  Những đôi nên đứng cạnh sản phẩm này
                </div>
                <p className="mt-2 text-xs leading-6 text-[var(--muted)] sm:mt-3 sm:text-sm sm:leading-7">
                  Recommendation slot là lớp merchandising thấp hơn hero nhưng cao hơn grid ngẫu nhiên.
                </p>
              </div>

              <div className="grid gap-4">
                {recommendations.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shoes/${item.shoeSlug}`}
                    className="surface-panel flex gap-3 rounded-[1.35rem] p-3 transition hover:-translate-y-1 sm:gap-4 sm:rounded-[1.8rem] sm:p-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.1rem] sm:h-24 sm:w-24 sm:rounded-[1.4rem]">
                      <Image src={item.primaryImage} alt={item.shoeName} fill sizes="96px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variant="secondary">{item.reasonLabel}</Badge>
                      <div className="mt-2 font-display text-[1.25rem] font-extrabold leading-[0.96] tracking-[-0.04em] text-[var(--foreground-hero)] sm:mt-3 sm:text-[1.55rem] md:text-[1.8rem]">
                        {item.shoeName}
                      </div>
                      <div className="text-xs text-[var(--muted)] sm:text-sm">{item.brand}</div>
                      <div className="mt-2 text-xs font-bold text-[var(--foreground-hero)] sm:mt-3 sm:text-sm">{formatVnd(item.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </MotionReveal>
          </RevealAfterCta>
        </section>
      </div>
    </div>
  );
}
