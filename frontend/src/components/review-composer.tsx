"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/api";

type ReviewComposerProps = {
  shoeSlug: string;
};

const ratings = [1, 2, 3, 4, 5];

export function ReviewComposer({ shoeSlug }: ReviewComposerProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, getAccessToken } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push(`/dang-nhap?redirect=/shoes/${shoeSlug}`);
      return;
    }

    if (isAdmin) {
      toast.error("Tài khoản quản trị không thể gửi đánh giá hiển thị cho khách hàng.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const token = await getAccessToken();
          if (!token) {
            toast.error("Phiên đăng nhập đã hết hạn.");
            return;
          }

          await submitReview(token, shoeSlug, {
            rating,
            title,
            body,
          });

          toast.success("Đã gửi đánh giá. Nội dung sẽ chờ duyệt trước khi hiển thị.");
          setTitle("");
          setBody("");
          setRating(5);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể gửi review lúc này.");
        }
      })();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-2">
        {ratings.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              rating === value
                ? "border-white/62 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0.12)),linear-gradient(135deg,rgba(121,216,255,0.32),rgba(180,183,255,0.22),rgba(215,193,255,0.26))] text-[var(--foreground-hero)] shadow-[0_14px_28px_rgba(14,26,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)]"
                : "border-white/56 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] text-[var(--foreground)] hover:border-white/76"
            }`}
          >
            {value} sao
          </button>
        ))}
      </div>

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Tiêu đề đánh giá"
        required
      />
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Cảm nhận thực tế về fit, chất liệu, đệm, độ hoàn thiện hoặc giao hàng"
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Chỉ người mua đã nhận hàng mới có thể gửi đánh giá và mọi nội dung mới đều phải qua duyệt.
        </p>
        <Button type="submit" disabled={isPending || isAdmin || !title.trim() || !body.trim()}>
          {isPending ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </div>
    </form>
  );
}
