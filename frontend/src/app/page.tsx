import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";
import { EmptyState } from "@/components/empty-state";
import { MotionReveal } from "@/components/motion-reveal";
import { ShoeCard } from "@/components/shoe-card";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHomeData } from "@/lib/api";
import { formatVnd } from "@/lib/currency";
import { fallbackHomeData, resolveStorefrontData } from "@/lib/storefront-fallback";

const trustPoints = [
  {
    icon: Sparkles,
    title: "Merchandising dẫn nhịp",
    copy: "Hero, collection và promo phải được biên tập như campaign thật thay vì chỉ xếp card vào một cột.",
  },
  {
    icon: ShieldCheck,
    title: "Commerce đọc được ngay",
    copy: "Stock, shipping, rating và giá được đặt gần decision zone để không bị chìm dưới hiệu ứng kính.",
  },
  {
    icon: Truck,
    title: "Luồng mua nối liền",
    copy: "Catalog, PDP, checkout và account nói cùng một ngôn ngữ brand thay vì mỗi nơi một kiểu.",
  },
];

const fallbackHeroBackground =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1700&q=80";
const fallbackHeroFocal =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

export default async function Home() {
  const homeResult = await resolveStorefrontData(() => getHomeData(), fallbackHomeData);

  if (!homeResult.data) {
    return (
      <div className="grid-shell">
        <section className="section-shell py-24">
          <div className="page-frame">
            <EmptyState
              title="Storefront tạm gián đoạn"
              description="Không thể tải hero, collection và sản phẩm từ hệ thống lúc này. Trang chủ đang được giữ ở chế độ an toàn để tránh hiển thị dữ liệu demo như dữ liệu thật."
              actionHref="/"
              actionLabel="Thử tải lại trang chủ"
            />
          </div>
        </section>
      </div>
    );
  }

  const home = homeResult.data;
  const isDemoFallback = homeResult.mode === "demo-fallback";
  const heroCampaign = home.heroCampaign;
  const categories = home.categories ?? [];
  const featured = home.featured ?? [];
  const promoBanners = home.promoBanners ?? [];
  const featuredCollections = home.featuredCollections ?? [];
  const heroShoe = featured[0] ?? home.newArrivals?.[0];

  if (!heroShoe) {
    return (
      <div className="section-shell py-24">
        <div className="page-frame">
          <div className="surface-strong rounded-[2.5rem] px-8 py-14 text-center">
            <BrandMark compact className="justify-center" />
            <h1 className="mt-6 font-display text-4xl font-bold text-[var(--foreground-hero)]">
              Bộ sưu tập đang được làm mới
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Dữ liệu sản phẩm chưa sẵn sàng. ZEPHYR sẽ trở lại khi lựa chọn đầu tiên đủ mạnh để mở màn cho storefront mới.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-shell">
      {isDemoFallback ? (
        <section className="section-shell pt-10">
          <div className="page-frame">
            <div className="surface-panel rounded-[2rem] border border-amber-300/50 bg-amber-50/80 px-5 py-4 text-sm leading-7 text-amber-950">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="warning">Demo fallback</Badge>
                <span>
                  Backend storefront chưa phản hồi. Trang này đang hiển thị dữ liệu demo để giữ nhịp review giao diện, không dùng để xác nhận giá và khuyến mãi thật.
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={`section-shell pb-16 ${isDemoFallback ? "pt-6" : "pt-10"}`}>
        <div className="page-frame">
          <MotionReveal className="surface-strong relative overflow-hidden rounded-[3rem] p-4 md:p-6">
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-w-0 flex flex-col justify-between rounded-[2.4rem] p-6 md:p-8">
                <div
                  className="absolute inset-0 rounded-[2.4rem] opacity-90"
                  style={{
                    background:
                      heroCampaign?.heroTone ??
                      "linear-gradient(135deg, rgba(251,228,204,0.78), rgba(255,255,255,0.18) 42%, rgba(176,207,255,0.68))",
                  }}
                />
                <div className="pointer-events-none absolute left-8 top-6 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.78),transparent_72%)] blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(241,177,186,0.44),transparent_72%)] blur-3xl" />

                <div className="relative z-10 space-y-6">
                  <Badge>{heroCampaign?.eyebrow ?? home.spotlightLabel}</Badge>
                  <div className="space-y-4">
                    <h1 className="font-display text-[clamp(1.95rem,4vw,3.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--foreground-hero)]">
                      {heroCampaign?.headline ?? home.headline}
                    </h1>
                    <p className="max-w-xl text-base leading-8 text-[var(--muted-strong)] md:text-lg">
                      {heroCampaign?.description ?? home.subheadline}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-10 space-y-5">
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href={heroCampaign?.ctaHref ?? "/catalog"}>
                        {heroCampaign?.ctaLabel ?? "Khám phá bộ sưu tập"}
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                      <Link href="/tai-khoan">Mở khu tài khoản</Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="glass-panel rounded-[1.5rem] p-4">
                      <div className="utility-label">Glass note</div>
                      <div className="mt-2 font-display text-[1.2rem] font-semibold tracking-[-0.04em] text-[var(--foreground-hero)]">
                        Kính chỉ đỡ câu chuyện, không tranh nó.
                      </div>
                    </div>
                    <div className="glass-panel rounded-[1.5rem] p-4">
                      <div className="utility-label">Focus point</div>
                      <div className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        Hero luôn phải có scene, spotlight và CTA hierarchy đủ mạnh trước khi grid sản phẩm xuất hiện.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
                <div className="surface-panel relative min-h-[34rem] overflow-hidden rounded-[2.6rem]">
                  <Image
                    src={heroCampaign?.backgroundImage ?? fallbackHeroBackground}
                    alt={heroCampaign?.title ?? heroShoe.name}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 55vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,17,29,0.12),transparent_34%,rgba(255,255,255,0.26)_74%,rgba(255,255,255,0.34))]" />
                  <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                    <div className="glass-panel rounded-[1.5rem] p-4">
                      <div className="utility-label">Season cue</div>
                      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Editorial lifestyle + product cutout tạo cảm giác storefront thật sự được art-direct.
                      </div>
                    </div>
                    {home.activePromotion ? (
                      <div className="glass-panel rounded-[1.5rem] p-4 text-left sm:text-right">
                        <div className="utility-label">{home.activePromotion.badge}</div>
                        <div className="mt-2 text-xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--foreground-hero)]">
                          {home.activePromotion.discountLabel}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="surface-panel rounded-[2.2rem] p-4">
                    <div className="grid gap-4">
                      <div className="relative overflow-hidden rounded-[1.6rem] bg-white/28">
                        <Image
                          src={heroCampaign?.focalImage ?? fallbackHeroFocal}
                          alt={heroShoe.name}
                          width={1200}
                          height={1200}
                          className="h-[16rem] w-full object-cover"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{heroShoe.brand}</Badge>
                          {heroShoe.campaignBadge ? <Badge variant="warning">{heroShoe.campaignBadge}</Badge> : null}
                        </div>
                        <div className="space-y-2">
                          <div className="utility-label">Spotlight product</div>
                          <div className="font-display text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--foreground-hero)]">
                            {heroShoe.name}
                          </div>
                          <p className="text-sm leading-6 text-[var(--muted)]">{heroShoe.shortDescription}</p>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-dim)]">
                              Giá mở đầu
                            </div>
                            <div className="mt-1 text-2xl font-bold text-[var(--foreground-hero)]">
                              {formatVnd(heroShoe.price)}
                            </div>
                          </div>
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/shoes/${heroShoe.slug}`}>Xem PDP</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ["Live size stock", "Tồn kho theo size được kéo lên sát vùng quyết định mua."],
                      ["Checkout rõ ràng", "Shipping, payment và promotion đi trong một mạch đồng bộ."],
                    ].map(([title, copy]) => (
                      <div key={title} className="glass-panel flex min-h-[8.2rem] flex-col justify-between rounded-[1.6rem] p-4">
                        <div className="font-semibold text-[var(--foreground-hero)]">{title}</div>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {trustPoints.map(({ icon: Icon, title, copy }) => (
              <MotionReveal key={title} className="surface-panel rounded-[2rem] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/78 bg-white/26 text-[var(--foreground-hero)]">
                  <Icon />
                </div>
                <div className="mt-4 font-display text-[1.3rem] font-extrabold tracking-[-0.04em] text-[var(--foreground-hero)]">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-14">
        <div className="page-frame">
          <StorefrontSectionHeading
            eyebrow="Promotion rail"
            title="Banner phụ chỉ tồn tại để nối câu chuyện hero sang collection và checkout"
            description="Những strip này là lớp merchandising phụ: seasonal drop, launch benefit hoặc trust layer cho flow thanh toán."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {promoBanners.slice(0, 3).map((banner, index) => (
              <MotionReveal
                key={banner.id}
                delay={0.04 * index}
                className="surface-panel relative overflow-hidden rounded-[2rem] p-5"
              >
                <div className="absolute inset-0 opacity-90" style={{ background: banner.tone }} />
                <div className="relative z-10 flex h-full flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <Badge>{banner.badge}</Badge>
                    <h3 className="font-display text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--foreground-hero)]">
                      {banner.title}
                    </h3>
                    <p className="text-sm leading-6 text-[var(--muted)]">{banner.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={banner.ctaHref}>
                        {banner.ctaLabel}
                        <ArrowRight size={14} />
                      </Link>
                    </Button>
                    <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] border border-white/76">
                      <Image src={banner.imageUrl} alt={banner.title} fill sizes="64px" className="object-cover" />
                    </div>
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-14">
        <div className="page-frame">
          <StorefrontSectionHeading
            eyebrow="Collections"
            title="Mỗi collection là một nhịp kể chuyện riêng, không phải một card category phóng to"
            description="Collection đứng giữa hero và product grid để storefront vừa giàu mood hơn vừa dễ điều hướng hơn."
          />

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            {featuredCollections.slice(0, 1).map((collection) => (
              <MotionReveal key={collection.id} className="surface-strong overflow-hidden rounded-[2.7rem] p-4">
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[26rem] overflow-hidden rounded-[2.1rem]">
                    <Image
                      src={collection.coverImage}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_30%,rgba(8,17,29,0.28))]" />
                  </div>
                  <div className="flex flex-col justify-between gap-5 rounded-[2.1rem] bg-white/24 p-6">
                    <div className="space-y-3">
                      <Badge variant="secondary">{collection.featureLabel}</Badge>
                      <div className="font-display text-[2.05rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--foreground-hero)]">
                        {collection.name}
                      </div>
                      <p className="text-sm leading-7 text-[var(--muted)]">{collection.description}</p>
                    </div>
                    <div className="grid gap-3">
                      {(collection.items ?? []).slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          href={`/shoes/${item.slug}`}
                          className="glass-panel flex items-center justify-between rounded-[1.4rem] px-4 py-3 transition hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="font-semibold text-[var(--foreground-hero)]">{item.name}</div>
                            <div className="text-sm text-[var(--muted)]">{item.brand}</div>
                          </div>
                          <div className="text-sm font-bold text-[var(--foreground-hero)]">{formatVnd(item.price)}</div>
                        </Link>
                      ))}
                    </div>
                    <Button asChild>
                      <Link href={`/catalog?query=${encodeURIComponent(collection.name)}`}>
                        Mở collection
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </MotionReveal>
            ))}

            <div className="grid gap-4">
              {featuredCollections.slice(1, 3).map((collection, index) => (
                <MotionReveal key={collection.id} delay={0.06 * index} className="surface-panel overflow-hidden rounded-[2.2rem] p-4">
                  <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
                    <div className="relative min-h-[13rem] overflow-hidden rounded-[1.6rem]">
                      <Image
                        src={collection.coverImage}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-3 self-center">
                      <Badge>{collection.featureLabel}</Badge>
                      <div className="font-display text-[1.5rem] font-semibold leading-[1] tracking-[-0.03em] text-[var(--foreground-hero)]">
                        {collection.name}
                      </div>
                      <p className="text-sm leading-6 text-[var(--muted)]">{collection.description}</p>
                    </div>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-14">
        <div className="page-frame">
          <StorefrontSectionHeading
            eyebrow="Category lens"
            title="Danh mục chỉ là rail điều hướng, không được tranh vai với hero hay collection"
            description="Nhóm giày vẫn cần rõ, nhưng được hạ xuống đúng tầng thông tin để không làm storefront vỡ nhịp."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <MotionReveal key={category.id} delay={0.03 * index}>
                <Link
                  href={`/catalog?category=${category.slug}`}
                  className="surface-panel group block rounded-[1.9rem] p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: category.heroTone }} />
                    <Compass className="text-[var(--foreground-dim)] transition group-hover:text-[var(--foreground-hero)]" />
                  </div>
                  <div className="mt-8 font-display text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--foreground-hero)]">
                    {category.name}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
                </Link>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="page-frame">
          <StorefrontSectionHeading
            eyebrow="Best seller feed"
            title="Grid sản phẩm chỉ xuất hiện sau khi storefront đã dựng xong mood và logic điều hướng"
            description="Những đôi dẫn chuyển đổi được đẩy xuống một lớp riêng để vừa đẹp hơn vừa đúng hành vi mua thực tế."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/catalog">
                  Mở toàn bộ catalog
                  <ArrowRight size={14} />
                </Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {featured.slice(0, 3).map((shoe) => (
              <ShoeCard key={shoe.slug} shoe={shoe} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="page-frame grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <MotionReveal className="surface-strong rounded-[2.6rem] p-8">
            <div className="space-y-4">
              <Badge variant="secondary">Storefront system</Badge>
              <h3 className="font-display text-[2.15rem] font-semibold leading-[1] tracking-[-0.04em] text-[var(--foreground-hero)]">
                Checkout, account và các decision layer phải cùng một hệ với hero.
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Storefront đẹp không dừng ở hero. Nó kéo theo purchase box, shipping layer, auth shell, wishlist và order history để mọi nơi đều có cùng một chất lượng brand.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button asChild>
                <Link href="/checkout">
                  Mở checkout
                  <Package size={16} />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/tai-khoan">Mở tài khoản</Link>
              </Button>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="surface-panel rounded-[2.6rem] p-8">
            <div className="utility-label">Promotion đang chạy</div>
            <div className="mt-3 font-display text-[1.95rem] font-semibold leading-[1] tracking-[-0.035em] text-[var(--foreground-hero)]">
              {home.activePromotion?.title ?? "Ưu đãi và shipping phải được merchandize như một lớp riêng."}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {home.activePromotion?.description ??
                "Khi không có promotion active, khu này vẫn giữ vai trò trust block cho checkout, PDP và marketing routes."}
            </p>
            {home.activePromotion ? (
              <div className="mt-6 flex items-center gap-3">
                <Badge>{home.activePromotion.badge}</Badge>
                <Badge variant="warning">{home.activePromotion.discountLabel}</Badge>
              </div>
            ) : null}
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}
