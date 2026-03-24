"use client";

import { AlertTriangle, Sparkles, Zap } from "@/components/icons";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const showcaseStats = [
  { label: "Bề mặt kính", value: "Tầng 01", note: "Panel storefront cho hero và các card cao cấp." },
  { label: "Bề mặt quản trị", value: "Tầng 02", note: "Panel admin tương phản cao và ít blur hơn." },
  { label: "An toàn thao tác", value: "AA ready", note: "Primary và destructive luôn giữ tương phản rõ." },
];

export default function DesignSystemPage() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_INTERNAL_UI_DOCS === "true";

  return (
    <div className="section-shell py-14">
      {!enabled ? (
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-[var(--muted)]">
          Route này là tài liệu nội bộ của ZEPHYR. Muốn bật đầy đủ, đặt `NEXT_PUBLIC_ENABLE_INTERNAL_UI_DOCS=true`.
        </div>
      ) : null}

      <div className="glass-strong brand-shell rounded-[2.4rem] p-8 md:p-10">
        <BrandMark showTagline />
        <div className="mt-6 max-w-3xl">
          <div className="editorial-kicker">nguồn chuẩn nội bộ</div>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.92] text-white">
            Hệ thiết kế dùng để giữ ZEPHYR nhất quán từ storefront đến admin.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Route này không dành cho người dùng cuối. Nó khóa token, typography, surface tiers, nút hành động và nhịp
            tương phản để mọi thay đổi tiếp theo không trôi khỏi cùng một ngôn ngữ thị giác.
          </p>
        </div>
      </div>

      <div className="design-grid columns-3 mt-8">
        {showcaseStats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-[var(--muted)]">{item.note}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="brand-shell">
          <CardHeader>
            <CardDescription>Khóa nhận diện</CardDescription>
            <CardTitle>ZEPHYR stroke mark</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BrandMark />
            <div className="editorial-kicker">dành cho nhịp chuyển động</div>
            <div className="flex flex-wrap gap-2">
              <Badge>Vàng chữ ký</Badge>
              <Badge variant="secondary">Kính mờ dịu</Badge>
              <Badge variant="success">Tương phản dễ đọc</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-admin rounded-[var(--radius-md)]">
          <CardHeader>
            <CardDescription>Bề mặt quản trị</CardDescription>
            <CardTitle>Hành động an toàn hơn hiệu ứng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Lưu thay đổi</Button>
              <Button variant="secondary">Sửa nháp</Button>
              <Button variant="destructive">Xóa sản phẩm</Button>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Trong khu quản trị, primary và destructive luôn được ưu tiên contrast để giảm lỗi thao tác.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Nhịp form</CardDescription>
            <CardTitle>Bề mặt cho tài khoản và thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Địa chỉ email" />
            <Input placeholder="Số điện thoại" />
            <Textarea placeholder="Ghi chú giao hàng, yêu cầu đặc biệt hoặc thông tin tiếp nhận đơn." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Kiểm tra tương phản</CardDescription>
            <CardTitle>Đọc rõ trước, đẹp sau</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-[var(--muted)]">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 text-[var(--accent)]" />
              <span>Italic chỉ dùng cho tagline, editorial cue và highlight phrase.</span>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 text-[var(--accent)]" />
              <span>Blur nặng không xuất hiện trên grid lặp như catalog hoặc bảng quản trị.</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-[var(--accent)]" />
              <span>Public icon system phải thống nhất, tránh trộn nhiều họ icon trên cùng một surface.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
