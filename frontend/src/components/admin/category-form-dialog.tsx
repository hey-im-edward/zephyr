"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import type { Category, CategoryInput } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: Category | null;
  onSubmit: (payload: CategoryInput) => Promise<void>;
};

const defaultState: CategoryInput = {
  name: "",
  description: "",
  heroTone: "#f59e0b",
};

export function CategoryFormDialog({ open, onOpenChange, initialValue, onSubmit }: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryInput>(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!initialValue) {
      setForm(defaultState);
      setError(null);
      return;
    }

    setForm({
      name: initialValue.name,
      description: initialValue.description,
      heroTone: initialValue.heroTone,
    });
    setError(null);
  }, [initialValue, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (submissionError) {
      setError(submissionError instanceof ApiError ? submissionError.message : "Không thể lưu danh mục lúc này.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-admin-strong max-h-[90vh] overflow-y-auto border-white/10">
        <DialogHeader>
          <DialogTitle>{initialValue ? "Cập nhật danh mục" : "Thêm danh mục mới"}</DialogTitle>
          <DialogDescription>
            Chốt mô tả, màu nhận diện và nhịp trình bày cho storefront của ZEPHYR.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="surface-admin rounded-[1.4rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Nhận diện</div>
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label htmlFor="category-name">Tên danh mục</Label>
                <Input
                  id="category-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-tone">Màu nhận diện</Label>
                <Input
                  id="category-tone"
                  value={form.heroTone}
                  onChange={(event) => setForm((current) => ({ ...current, heroTone: event.target.value }))}
                  required
                />
                <div className="text-xs text-white/45">
                  Nhập mã HEX, ví dụ: <span className="text-white/70">#f59e0b</span>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-admin rounded-[1.4rem] p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/38">Nội dung</div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Mô tả</Label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </div>
          </div>

          {error ? <div className="text-sm text-rose-200">{error}</div> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-40">
              {isPending ? "Đang lưu..." : initialValue ? "Cập nhật" : "Tạo danh mục"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
