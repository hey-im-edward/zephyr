import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "ZEPHYR/Foundations",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SurfaceSystem: Story = {
  render: () => (
    <div className="min-h-screen bg-[var(--page-background)] px-6 py-10 text-[var(--foreground)] md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="surface-strong rounded-[2.6rem] p-8">
          <BrandMark showTagline />
          <div className="mt-6 max-w-3xl">
            <div className="editorial-kicker">light premium airy glass</div>
            <h1 className="display-hero mt-3">
              Token nền mới giữ storefront sáng, blur tiết chế và chữ luôn là lớp ưu tiên.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Story này dùng làm board nền: kiểm tra surface families, radius, border highlight, CTA hierarchy và form rhythm
              trước khi đưa vào page thực.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Storefront glass</CardDescription>
              <CardTitle>Blur 10-18px</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <div className="surface-panel rounded-[1.5rem] p-4">Hero, promo strip, collection card, drawer.</div>
              <div className="flex flex-wrap gap-2">
                <Badge>Campaign-led</Badge>
                <Badge variant="secondary">Readable overlay</Badge>
                <Badge variant="warning">Highlight slot</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-admin">
            <CardHeader>
              <CardDescription>Operational glass</CardDescription>
              <CardTitle>Blur thấp hơn, opacity cao hơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Lưu thay đổi</Button>
                <Button variant="secondary">Tạo nháp</Button>
                <Button variant="destructive">Xóa record</Button>
              </div>
              <div className="text-sm leading-6 text-[var(--muted)]">
                Checkout, admin form và bảng thao tác phải ưu tiên đọc rõ hơn hiệu ứng kính.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Motion + form rhythm</CardDescription>
              <CardTitle>Giữ nhịp nhập liệu sạch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Tên collection hoặc promotion" />
              <Input placeholder="CTA href hoặc route nội bộ" />
              <Textarea placeholder="Mô tả ngắn, rõ, không đè hiệu ứng." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};
