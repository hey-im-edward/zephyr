import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Compass,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";
import { MotionReveal } from "@/components/motion-reveal";
import { ShoeCard } from "@/components/shoe-card";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHomeData } from "@/lib/api";
import { formatVnd } from "@/lib/currency";

const highlights = [
  {
    icon: Sparkles,
    title: "Biên tập có gu",
    copy: "Danh mục được chọn theo nhịp sống và phong cách mang, không đẩy mọi đôi giày vào cùng một hàng lưới vô hồn.",
  },
  {
    icon: ShieldCheck,
    title: "Mua hàng có trật tự",
    copy: "Tài khoản, đơn hàng, tồn kho theo size và checkout đều vận hành trên một luồng rõ ràng.",
  },
  {
    icon: Truck,
    title: "Thanh toán mạch lạc",
    copy: "COD hoặc chuyển khoản, lịch sử đơn nằm trong tài khoản và trải nghiệm mua không còn mang cảm giác thử nghiệm nửa vời.",
  },
];

export default async function Home() {
  const home = await getHomeData();
  const heroShoe = home.featured[0] ?? home.newArrivals[0];

  if (!heroShoe) {
    return (
      <div className="section-shell py-20">
        <div className="page-frame">
          <div className="glass-strong brand-shell rounded-[2.25rem] p-10 text-center">
            <BrandMark compact className="justify-center" />
            <h1 className="mt-6 font-display text-4xl font-semibold text-white">Bộ sưu tập đang được làm mới</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Dữ liệu sản phẩm chưa sẵn sàng. ZEPHYR sẽ trở lại khi lựa chọn đầu tiên đủ đẹp để mở màn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-shell">
      <section className="ambient-shell section-shell pb-18 pt-14">
        <div className="page-frame grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <MotionReveal className="space-y-8">
            <Badge variant="secondary" className="border-white/14">
              {home.spotlightLabel}
            </Badge>

            <div className="space-y-5">
              <div className="editorial-kicker">dành cho nhịp chuyển động</div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.9] tracking-tight text-white md:text-7xl">
                ZEPHYR chọn những đôi giày khiến bước đi trông đẹp hơn ngay từ cái nhìn đầu tiên.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">{home.subheadline}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/catalog">
                  Mở bộ sưu tập
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dang-ky">Tạo tài khoản ZEPHYR</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["6 size sẵn sàng", "Theo dõi tồn kho theo size ngay trong trang sản phẩm."],
                ["Giao diện tiếng Việt", "Nhịp chữ và luồng mua được viết lại cho người dùng Việt."],
                ["Tài khoản thật sự hữu ích", "Đăng nhập để xem lịch sử đơn, chỉnh hồ sơ và quay lại mua tiếp."],
              ].map(([title, copy]) => (
                <div key={title} className="surface-panel-muted rounded-[1.5rem] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle className="text-[var(--success)]" />
                    {title}
                  </div>
                  <p className="text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="space-y-4">
            <div className="glass-strong brand-shell rounded-[2.25rem] p-4">
              <div className="relative overflow-hidden rounded-[1.9rem]">
                <Image
                  src={heroShoe.primaryImage}
                  alt={heroShoe.name}
                  width={1200}
                  height={1200}
                  priority
                  className="h-[24rem] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/92 via-slate-950/42 to-transparent p-5">
                  <div className="flex flex-wrap gap-2">
                    {heroShoe.featured ? <Badge>Lựa chọn tuyển chọn</Badge> : null}
                    {heroShoe.newArrival ? <Badge variant="secondary">Mới lên kệ</Badge> : null}
                    {heroShoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
                        Lựa chọn mở màn
                      </div>
                      <div className="mt-1 font-display text-3xl font-semibold text-white">{heroShoe.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-dim)]">Giá từ</div>
                      <div className="mt-1 text-lg font-semibold text-[var(--brand-soft)]">{formatVnd(heroShoe.price)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, copy }, index) => (
                <MotionReveal key={title} delay={0.1 + index * 0.05} className="surface-panel-muted rounded-[1.5rem] p-4">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(243,215,162,0.24),rgba(240,168,192,0.18))]">
                    <Icon className="text-white" />
                  </div>
                  <div className="font-display text-xl font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </MotionReveal>
              ))}
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="page-frame">
          <StorefrontSectionHeading
            eyebrow="Danh mục"
            title="Mỗi nhóm giày có một nhịp chọn riêng"
            description="ZEPHYR ưu tiên cách duyệt theo bối cảnh sử dụng để người mua nhìn là biết mình nên bắt đầu từ đâu."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {home.categories.map((category, index) => (
              <MotionReveal key={category.slug} delay={0.05 * index}>
                <Link
                  href={`/catalog?category=${category.slug}`}
                  className="surface-panel brand-shell group block rounded-[1.8rem] p-5 transition hover:-translate-y-1 hover:border-white/24"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-2 w-20 rounded-full" style={{ backgroundColor: category.heroTone }} />
                    <Compass className="text-[var(--foreground-dim)] transition group-hover:text-white" />
                  </div>
                  <div className="font-display text-2xl font-semibold text-white">{category.name}</div>
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
            eyebrow="Nổi bật"
            title="Những đôi giày đang giữ nhịp tốt nhất trong bộ sưu tập"
            description="Đây là nhóm có hình đẹp, lực bán ổn và cảm giác chốt đơn nhanh nhất nếu anh đang cần một điểm bắt đầu chắc tay."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/catalog?featured=true">Chỉ xem hàng nổi bật</Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {home.featured.slice(0, 3).map((shoe) => (
              <ShoeCard key={shoe.slug} shoe={shoe} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="page-frame grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <MotionReveal className="glass-panel brand-shell rounded-[2rem] p-8">
            <StorefrontSectionHeading
              eyebrow="Mới lên kệ"
              title="Mẫu mới được đẩy lên theo nhịp ra mắt, không dàn đều cho đủ số"
              description="Các đôi vừa vào bộ sưu tập luôn được đặt ở vị trí dễ nhìn để storefront có cảm giác sống, không bị đứng im như một grid mặc định."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {home.newArrivals.slice(0, 4).map((shoe) => (
                <Link
                  key={shoe.slug}
                  href={`/shoes/${shoe.slug}`}
                  className="surface-panel-muted group rounded-[1.4rem] p-4 transition hover:-translate-y-1 hover:border-white/18"
                >
                  <div className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-dim)]">{shoe.brand}</div>
                  <div className="mt-1 font-display text-2xl font-semibold text-white transition group-hover:text-[var(--brand-soft)]">
                    {shoe.name}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{shoe.shortDescription}</div>
                </Link>
              ))}
            </div>
          </MotionReveal>

          <MotionReveal
            delay={0.08}
            className="surface-panel rounded-[2rem] border-white/14 bg-[linear-gradient(180deg,rgba(243,215,162,0.16),rgba(240,168,192,0.08))] p-8"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-dim)]">Lợi thế của bản mới</div>
            <h3 className="mt-4 font-display text-4xl font-semibold leading-tight text-white">
              Từ bề mặt đẹp hơn đến hành vi mua hàng đáng tin hơn.
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              ZEPHYR không chỉ thay lớp áo. Người dùng có thể đăng ký, đăng nhập, theo dõi đơn và quay lại mua tiếp;
              admin có khu riêng để điều phối sản phẩm, kho size và trạng thái vận hành.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/checkout">
                  Mở thanh toán
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin">
                  Khu quản trị
                  <Package size={16} />
                </Link>
              </Button>
            </div>
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}
