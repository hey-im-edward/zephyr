import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoaderCircle, Palette, TrendingUp } from "@/components/icons";

import { MotionReveal } from "@/components/motion-reveal";
import { PurchaseBox } from "@/components/purchase-box";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getShoe } from "@/lib/api";
import { formatVnd } from "@/lib/currency";

type ShoePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ShoePage({ params }: ShoePageProps) {
  const { slug } = await params;
  const shoe = await getShoe(slug).catch(() => null);

  if (!shoe) {
    notFound();
  }

  return (
    <div className="page-shell py-14">
      <div className="page-frame grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="space-y-6">
          <MotionReveal className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden rounded-[2rem]">
              <Image
                src={shoe.primaryImage}
                alt={shoe.name}
                width={1200}
                height={1200}
                sizes="(max-width: 768px) 100vw, 60vw"
                className="h-[28rem] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,5,10,0.92)] via-[rgba(4,5,10,0.38)] to-transparent p-5">
                <div className="flex flex-wrap gap-2">
                  {shoe.featured ? <Badge>Zephyr edit</Badge> : null}
                  {shoe.newArrival ? <Badge variant="secondary">Mới lên kệ</Badge> : null}
                  {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem]">
              <Image
                src={shoe.secondaryImage}
                alt={shoe.name}
                width={1200}
                height={1200}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="h-[28rem] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(4,5,10,0.26))]" />
            </div>
          </MotionReveal>

          <MotionReveal delay={0.04} className="surface-glass rounded-[2rem] p-6">
            <StorefrontSectionHeading eyebrow="Product story" title={shoe.name} description={shoe.description} />

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/58">
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1">{shoe.categoryName}</span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1">{shoe.brand}</span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1">{shoe.silhouette}</span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1">{formatVnd(shoe.price)}</span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1">
                {shoe.inStock ? "Còn hàng" : "Tạm hết hàng"}
              </span>
            </div>
          </MotionReveal>

          <div className="grid gap-4 md:grid-cols-3">
            {shoe.highlights.map((highlight, index) => (
              <MotionReveal
                key={highlight}
                delay={0.08 + index * 0.04}
                className="surface-glass rounded-[1.5rem] p-4 text-sm leading-6 text-[var(--muted)]"
              >
                {highlight}
              </MotionReveal>
            ))}
          </div>

          <MotionReveal delay={0.12} className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-glass rounded-[2rem] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Bảng màu</div>
                <Palette className="text-white/45" />
              </div>
              <div className="flex flex-wrap gap-3">
                {shoe.accentColors.map((color) => (
                  <div key={color} className="space-y-2">
                    <div
                      className="h-12 w-12 rounded-full border border-white/12 shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-[11px] uppercase tracking-[0.14em] text-white/42">{color}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-admin rounded-[2rem] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Tồn kho theo size</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">Sẵn sàng chốt đơn</div>
              </div>
              <div className="space-y-3">
                {shoe.sizeStocks.map((size) => (
                  <div
                    key={size.sizeLabel}
                    className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-[rgba(8,11,19,0.58)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <LoaderCircle className="text-[var(--brand-gold)]" />
                      <span>EU {size.sizeLabel}</span>
                    </div>
                    <div className="text-sm text-white/60">
                      {size.stockQuantity > 0 ? `Còn ${size.stockQuantity}` : "Hết hàng"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={0.08} className="space-y-6">
          <PurchaseBox shoe={shoe} />
          <div className="surface-admin rounded-[2rem] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Hành động tiếp theo</div>
              <TrendingUp className="text-white/45" />
            </div>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <p>Muốn xem thêm mẫu cùng nhóm? Quay lại catalog để lọc theo bối cảnh sử dụng hoặc phong cách.</p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/catalog">Quay lại bộ sưu tập</Link>
              </Button>
            </div>
          </div>
        </MotionReveal>
      </div>
    </div>
  );
}
