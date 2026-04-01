import { notFound } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { ShoeCard } from "@/components/shoe-card";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { AlertTriangle, Sparkles, Truck } from "@/components/icons";
import { AdminPanel, AdminPanelBody, AdminPanelHeader } from "@/features/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const showcaseShoe = {
  id: 1,
  name: "Pulse Runner 02",
  slug: "pulse-runner-02",
  brand: "ZEPHYR",
  silhouette: "Performance runner",
  shortDescription: "Một card sản phẩm kiểu editorial-commerce: đủ premium, đủ rõ dữ liệu để chuyển đổi.",
  price: 4690000,
  primaryImage:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  secondaryImage:
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
  categorySlug: "running",
  categoryName: "Running",
  featured: true,
  newArrival: true,
  bestSeller: false,
  campaignBadge: "Drop 03",
  averageRating: 4.8,
  reviewCount: 28,
} as const;

export default function DesignSystemPage() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_INTERNAL_UI_DOCS === "true";

  if (!enabled) {
    notFound();
  }

  return (
    <div className="section-shell py-12">
      <div className="page-frame space-y-8">
        <section className="surface-strong rounded-[2.8rem] p-8 md:p-10">
          <BrandMark showTagline />
          <div className="mt-6 max-w-4xl space-y-5">
            <div className="editorial-kicker">internal design system</div>
            <h1 className="display-hero">Nguồn chuẩn cho glass storefront, operational surfaces và hero library của ZEPHYR.</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Route này đi cùng Storybook. App route dùng để rà token và states ngay trong shell thật; Storybook dùng để snapshot,
              a11y và regression ở cấp component. Hai nơi phải luôn phản chiếu cùng một hệ.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge>storefront glass</Badge>
              <Badge variant="secondary">operational glass</Badge>
              <Badge variant="success">storybook baseline</Badge>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Blur budget", "6-14px / 16-20px", "Storefront blur chỉ được tăng ở hero và spotlight block, không được lạm dụng trên grid lặp."],
            ["Contrast rule", "AA ready", "Text tối luôn là lớp ưu tiên. Kính chỉ là surface, không phải nội dung."],
            ["Operational bias", "High readability", "Checkout và admin dùng opacity cao hơn, blur thấp hơn để tránh lỗi thao tác."],
          ].map(([label, value, note]) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle>{value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-[var(--muted)]">{note}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <Card className="surface-glass">
            <CardHeader>
              <CardDescription>Storefront family</CardDescription>
              <CardTitle>Hero, collection and product merchandising</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <StorefrontSectionHeading
                eyebrow="hero + promo library"
                title="Khi dùng glass, focal product và CTA hierarchy phải thắng hiệu ứng."
                description="Thứ tự luôn là headline, focal product, CTA, trust strip. Không đảo."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Home hero", "Campaign-led, editorial, mở màn cả mùa bán."],
                  ["Collection hero", "Tập trung mood, assortment và merchandising cue."],
                  ["Checkout banner", "Nghiêng về trust, shipping, promotion hơn thị giác."],
                ].map(([title, copy]) => (
                  <div key={title} className="surface-panel rounded-[1.6rem] p-4">
                    <div className="font-semibold text-[var(--foreground-hero)]">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="surface-admin">
            <CardHeader>
              <CardDescription>Operational family</CardDescription>
              <CardTitle>Forms, moderation, destructive clarity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Tên promotion hoặc shipping method" />
              <Input placeholder="ETA / fee / CTA href" />
              <Textarea placeholder="Mô tả ngắn, tách rành mạch action và consequence." />
              <div className="flex flex-wrap gap-3">
                <Button>Lưu thay đổi</Button>
                <Button variant="secondary">Tạo nháp</Button>
                <Button variant="destructive">Xóa record</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div>
            <StorefrontSectionHeading
              eyebrow="component state"
              title="Product card phải cân bằng cảm xúc thương hiệu và dữ liệu mua hàng."
              description="Card thật phải có image treatment, badge system, rating, category, price và CTA đủ gần nhau để quét nhanh."
            />
            <div className="mt-6">
              <ShoeCard shoe={showcaseShoe} />
            </div>
          </div>

          <AdminPanel>
            <AdminPanelHeader
              title="Operational checklist"
              description="Những điểm bắt buộc trước khi merge một UI block mới vào storefront hoặc admin."
            />
            <AdminPanelBody className="space-y-4 text-sm leading-7 text-[var(--muted)]">
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white/62 p-4">
                <Sparkles className="mt-1 text-[var(--accent)]" />
                <span>Hero mới phải có variant mobile riêng, không scale cứng từ desktop.</span>
              </div>
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white/62 p-4">
                <Truck className="mt-1 text-[var(--accent)]" />
                <span>Checkout và account phải hiển thị shipping/promotion/address như lớp dữ liệu chính, không ẩn trong accordion phụ.</span>
              </div>
              <div className="flex items-start gap-3 rounded-[1.5rem] border border-[rgba(220,87,109,0.16)] bg-[rgba(220,87,109,0.06)] p-4">
                <AlertTriangle className="mt-1 text-[var(--danger)]" />
                <span>Blur nặng, text sáng hoặc card thiếu contrast đều bị xem là regression, kể cả khi nhìn “đẹp”.</span>
              </div>
            </AdminPanelBody>
          </AdminPanel>
        </section>
      </div>
    </div>
  );
}
