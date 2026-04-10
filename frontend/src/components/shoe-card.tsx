"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "@/components/icons";

import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/currency";
import { toSafeImageUrl } from "@/lib/image-safety";
import type { ShoeCard as ShoeCardType } from "@/lib/types";

export function ShoeCard({ shoe }: { shoe: ShoeCardType }) {
  const hydrated = useHydrated();
  const averageRating = shoe.averageRating ?? 0;
  const reviewCount = shoe.reviewCount ?? 0;
  const safePrimaryImage = toSafeImageUrl(shoe.primaryImage);

  const content = (
    <div className="flex h-full flex-col p-3">
      <Link href={`/shoes/${shoe.slug}`} className="block">
        <div className="relative overflow-hidden rounded-[1.7rem]">
          <Image
            src={safePrimaryImage}
            alt={shoe.name}
            width={900}
            height={900}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="h-[17rem] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_35%,rgba(10,19,33,0.28))]" />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
            {shoe.featured ? (
              <Badge>
                <Sparkles size={13} />
                Zephyr select
              </Badge>
            ) : null}
            {shoe.newArrival ? <Badge variant="secondary">New</Badge> : null}
            {shoe.bestSeller ? <Badge variant="success">Best seller</Badge> : null}
            {shoe.campaignBadge ? <Badge variant="warning">{shoe.campaignBadge}</Badge> : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-4 px-3 pb-3 pt-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[var(--foreground-dim)]">
          <span>{shoe.brand}</span>
          <span>{shoe.categoryName}</span>
        </div>

        <div className="min-h-[8.25rem] space-y-2">
          <Link href={`/shoes/${shoe.slug}`} className="block">
            <h3 className="line-clamp-2 font-display text-[1.55rem] font-semibold leading-[1] tracking-[-0.045em] text-[var(--foreground-hero)] transition group-hover:text-[var(--accent)]">
              {shoe.name}
            </h3>
          </Link>
          <p className="line-clamp-3 text-[0.92rem] leading-6 text-[var(--muted)]">{shoe.shortDescription}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          <span className="rounded-full border border-white/72 bg-white/32 px-3 py-1">{shoe.silhouette}</span>
          <span className="rounded-full border border-white/72 bg-white/32 px-3 py-1">
            {averageRating.toFixed(1)} / 5
          </span>
          <span className="rounded-full border border-white/72 bg-white/32 px-3 py-1">{reviewCount} review</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-dim)]">Giá hiện tại</div>
            <div className="mt-1 text-xl font-bold text-[var(--foreground-hero)]">{formatVnd(shoe.price)}</div>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/shoes/${shoe.slug}`}>
              Xem chi tiết
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  if (!hydrated) {
    return <article className="group surface-glass rounded-[2rem]">{content}</article>;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="group surface-glass rounded-[2rem]"
    >
      {content}
    </motion.article>
  );
}
