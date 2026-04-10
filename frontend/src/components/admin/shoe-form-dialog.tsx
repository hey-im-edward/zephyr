"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import type { Category, ShoeDetail, ShoeInput } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ShoeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialValue?: ShoeDetail | null;
  onSubmit: (payload: ShoeInput) => Promise<void>;
};

type DraftState = {
  sku: string;
  name: string;
  brand: string;
  silhouette: string;
  shortDescription: string;
  description: string;
  price: string;
  primaryImage: string;
  secondaryImage: string;
  sizeStocks: string;
  accentColors: string;
  highlights: string;
  categorySlug: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
};

const emptyDraft: DraftState = {
  sku: "",
  name: "",
  brand: "",
  silhouette: "",
  shortDescription: "",
  description: "",
  price: "",
  primaryImage: "",
  secondaryImage: "",
  sizeStocks: "39:5\n40:5\n41:5",
  accentColors: "#f59e0b\n#fb7185\n#0f172a",
  highlights: "Chất liệu đẹp\nÊm chân\nDễ phối đồ",
  categorySlug: "",
  featured: false,
  newArrival: true,
  bestSeller: false,
};

function toDraft(shoe: ShoeDetail): DraftState {
  return {
    sku: shoe.sku,
    name: shoe.name,
    brand: shoe.brand,
    silhouette: shoe.silhouette,
    shortDescription: shoe.shortDescription,
    description: shoe.description,
    price: String(shoe.price),
    primaryImage: shoe.primaryImage,
    secondaryImage: shoe.secondaryImage,
    sizeStocks: shoe.sizeStocks.map((size) => `${size.sizeLabel}:${size.stockQuantity}`).join("\n"),
    accentColors: shoe.accentColors.join("\n"),
    highlights: shoe.highlights.join("\n"),
    categorySlug: shoe.categorySlug,
    featured: shoe.featured,
    newArrival: shoe.newArrival,
    bestSeller: shoe.bestSeller,
  };
}

function normalizeLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSizeStocks(input: string) {
  const entries = normalizeLines(input).map((line) => {
    const [sizeLabel, quantityRaw] = line.split(":").map((value) => value.trim());
    const stockQuantity = Number(quantityRaw);

    if (!sizeLabel || Number.isNaN(stockQuantity) || stockQuantity < 0) {
      throw new Error("Tồn kho phải theo định dạng size:so_lượng, ví dụ 40:8");
    }

    return { sizeLabel, stockQuantity };
  });

  if (entries.length === 0) {
    throw new Error("Cần ít nhất một dòng tồn kho theo size.");
  }

  return entries;
}

export function ShoeFormDialog({ open, onOpenChange, categories, initialValue, onSubmit }: ShoeFormDialogProps) {
  const [draft, setDraft] = useState<DraftState>({
    ...emptyDraft,
    categorySlug: categories[0]?.slug ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialValue) {
      setDraft(toDraft(initialValue));
      setError(null);
      return;
    }

    setDraft({
      ...emptyDraft,
      categorySlug: categories[0]?.slug ?? "",
    });
    setError(null);
  }, [categories, initialValue, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const payload: ShoeInput = {
        sku: draft.sku.trim(),
        name: draft.name.trim(),
        brand: draft.brand.trim(),
        silhouette: draft.silhouette.trim(),
        shortDescription: draft.shortDescription.trim(),
        description: draft.description.trim(),
        price: Number(draft.price),
        primaryImage: draft.primaryImage.trim(),
        secondaryImage: draft.secondaryImage.trim(),
        sizeStocks: parseSizeStocks(draft.sizeStocks),
        accentColors: normalizeLines(draft.accentColors),
        highlights: normalizeLines(draft.highlights),
        featured: draft.featured,
        newArrival: draft.newArrival,
        bestSeller: draft.bestSeller,
        categorySlug: draft.categorySlug,
      };

      if (Number.isNaN(payload.price) || payload.price <= 0) {
        throw new Error("Giá bán phải lớn hơn 0.");
      }

      if (payload.accentColors.length === 0 || payload.highlights.length === 0) {
        throw new Error("Cần nhập màu nhận diện và điểm nhấn sản phẩm.");
      }

      await onSubmit(payload);
      onOpenChange(false);
    } catch (submissionError) {
      if (submissionError instanceof ApiError) {
        setError(submissionError.message);
      } else if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("Không thể lưu sản phẩm lúc này.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-admin-strong max-h-[90vh] max-w-5xl overflow-y-auto border-white/10">
        <DialogHeader>
          <DialogTitle>{initialValue ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            Tạo cấu trúc hiển thị, kho size và các điểm nhấn merchandising để sản phẩm lên storefront đúng nhịp.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="surface-admin rounded-[1.5rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Thông tin cốt lõi</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shoe-sku">SKU</Label>
                <Input
                  id="shoe-sku"
                  value={draft.sku}
                  onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-name">Tên giày</Label>
                <Input
                  id="shoe-name"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-brand">Thương hiệu</Label>
                <Input
                  id="shoe-brand"
                  value={draft.brand}
                  onChange={(event) => setDraft((current) => ({ ...current, brand: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-silhouette">Dòng giày</Label>
                <Input
                  id="shoe-silhouette"
                  value={draft.silhouette}
                  onChange={(event) => setDraft((current) => ({ ...current, silhouette: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-price">Giá bán</Label>
                <Input
                  id="shoe-price"
                  type="number"
                  min="1"
                  value={draft.price}
                  onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-category">Danh mục</Label>
                <Select
                  value={draft.categorySlug}
                  onValueChange={(nextSlug) => setDraft((current) => ({ ...current, categorySlug: nextSlug }))}
                  disabled={categories.length === 0}
                >
                  <SelectTrigger id="shoe-category" aria-label="Danh mục" data-testid="shoe-category-select-trigger" className="h-11">
                    <SelectValue placeholder={categories.length === 0 ? "Chưa có danh mục" : "Chọn danh mục"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="surface-admin rounded-[1.5rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Nội dung trưng bày</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shoe-short">Mô tả ngắn</Label>
                <Textarea
                  id="shoe-short"
                  value={draft.shortDescription}
                  onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-description">Mô tả đầy đủ</Label>
                <Textarea
                  id="shoe-description"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="surface-admin rounded-[1.5rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Tài nguyên hình ảnh</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shoe-primary">Ảnh chính</Label>
                <Input
                  id="shoe-primary"
                  value={draft.primaryImage}
                  onChange={(event) => setDraft((current) => ({ ...current, primaryImage: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-secondary">Ảnh phụ</Label>
                <Input
                  id="shoe-secondary"
                  value={draft.secondaryImage}
                  onChange={(event) => setDraft((current) => ({ ...current, secondaryImage: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="surface-admin rounded-[1.5rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Kho size và nhịp hiển thị</div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="shoe-stock">Tồn kho theo size</Label>
                <Textarea
                  id="shoe-stock"
                  value={draft.sizeStocks}
                  onChange={(event) => setDraft((current) => ({ ...current, sizeStocks: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-colors">Màu nhận diện</Label>
                <Textarea
                  id="shoe-colors"
                  value={draft.accentColors}
                  onChange={(event) => setDraft((current) => ({ ...current, accentColors: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe-highlights">Điểm nhấn</Label>
                <Textarea
                  id="shoe-highlights"
                  value={draft.highlights}
                  onChange={(event) => setDraft((current) => ({ ...current, highlights: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="surface-admin rounded-[1.5rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Nhãn storefront</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: "featured", label: "Nổi bật" },
                { key: "newArrival", label: "Mới về" },
                { key: "bestSeller", label: "Bán chạy" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-white/82"
                >
                  <input
                    type="checkbox"
                    checked={draft[item.key as keyof DraftState] as boolean}
                    onChange={(event) => setDraft((current) => ({ ...current, [item.key]: event.target.checked }))}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error ? <div className="text-sm text-rose-200">{error}</div> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-48">
              {isPending ? "Đang lưu..." : initialValue ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
