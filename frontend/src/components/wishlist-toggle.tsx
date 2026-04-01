"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse } from "@/components/icons";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { addWishlistItem, getWishlist, removeWishlistItem } from "@/lib/api";

type WishlistToggleProps = {
  shoeSlug: string;
  className?: string;
};

export function WishlistToggle({ shoeSlug, className }: WishlistToggleProps) {
  const router = useRouter();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const displaySaved = isAuthenticated && isSaved;

  useEffect(() => {
    if (!isAuthenticated) return;

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const wishlist = await getWishlist(token);
        setIsSaved(wishlist.some((item) => item.shoeSlug === shoeSlug));
      } catch {
        // Ignore non-critical hydration errors for the toggle shell.
      }
    })();
  }, [getAccessToken, isAuthenticated, shoeSlug]);

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/dang-nhap?redirect=/shoes/${shoeSlug}`);
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

          if (displaySaved) {
            await removeWishlistItem(token, shoeSlug);
            setIsSaved(false);
            toast.success("Đã bỏ khỏi wishlist.");
          } else {
            await addWishlistItem(token, { shoeSlug });
            setIsSaved(true);
            toast.success("Đã thêm vào wishlist.");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Không thể cập nhật wishlist.");
        }
      })();
    });
  }

  return (
    <Button
      type="button"
      variant={displaySaved ? "default" : "secondary"}
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      <HeartPulse size={16} />
      {isPending ? "Đang lưu..." : displaySaved ? "Đã lưu wishlist" : "Lưu vào wishlist"}
    </Button>
  );
}
