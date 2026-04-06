import Image from "next/image";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BrandMark } from "@/components/brand-mark";
import { StorefrontSectionHeading } from "@/components/storefront-section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const meta = {
  title: "ZEPHYR/Hero Library",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const focalImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

export const HomeCampaignHero: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--page-background)] px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <section className="surface-strong relative overflow-hidden rounded-[2.8rem] px-8 py-10">
          <div
            className="absolute inset-0 opacity-85"
            style={{
              background:
                "linear-gradient(135deg, rgba(130,168,255,0.24), rgba(240,168,180,0.18) 55%, rgba(215,159,76,0.2))",
            }}
          />
          <div className="relative z-10 space-y-8">
            <BrandMark showTagline />
            <div className="space-y-5">
              <Badge>home campaign hero</Badge>
              <h1 className="display-hero max-w-4xl">
                Hero phải dẫn nhịp thương mại trước khi grid sản phẩm xuất hiện.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
                Bản hero này cho storefront của ZEPHYR: nền sáng có chiều sâu, focal product rõ, CTA mạnh và các trust block
                nằm thấp hơn để không tranh tiêu điểm.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg">Khám phá catalog</Button>
              <Button size="lg" variant="secondary">
                Mở collection drop
              </Button>
            </div>
          </div>
        </section>

        <section className="surface-panel overflow-hidden rounded-[2.8rem] p-4">
          <div className="grid gap-4 md:grid-cols-[0.96fr_1.04fr]">
            <div className="relative overflow-hidden rounded-[2rem]">
              <Image
                src={focalImage}
                alt="ZEPHYR hero shoe"
                width={1200}
                height={1400}
                unoptimized
                className="h-[26rem] w-full object-cover"
              />
            </div>
            <div className="rounded-[2rem] border border-[var(--line)] bg-white/56 p-6">
              <StorefrontSectionHeading
                eyebrow="editorial spotlight"
                title="Pulse Runner 02"
                description="Card phải đủ premium để đứng một mình, nhưng vẫn chứa giá, badge và CTA nhanh cho merch team."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary">New arrival</Badge>
                <Badge variant="warning">Drop 03</Badge>
                <Badge variant="success">Pre-order safe</Badge>
              </div>
              <div className="mt-8 text-3xl font-semibold text-[var(--foreground-hero)]">4.690.000 đ</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};

export const CheckoutTrustBanner: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--page-background)] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="surface-admin rounded-[2.5rem] p-8">
          <StorefrontSectionHeading
            eyebrow="checkout trust banner"
            title="Operational glass phải làm người mua thấy rõ shipping, discount và quyết định thanh toán."
            description="Banner cho checkout không được diễn quá mức. Nó phải đỡ conversion bằng clarity, trust signal và CTA phụ rõ ràng."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Saved address", "Áp địa chỉ mặc định vào form bằng một chạm."],
              ["Shipping layer", "ETA và phí ship xuất hiện trước khi người dùng bấm xác nhận."],
              ["Promo contract", "Discount code đi qua API riêng để merch có thể kiểm soát."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.6rem] border border-[var(--line)] bg-white/70 p-4">
                <div className="font-semibold text-[var(--foreground-hero)]">{title}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
