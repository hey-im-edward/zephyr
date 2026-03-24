"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/currency";
import type { ShoeCard as ShoeCardType } from "@/lib/types";

export function ShoeCard({ shoe }: { shoe: ShoeCardType }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="group surface-glass overflow-hidden rounded-[2rem]"
    >
      <Link href={`/shoes/${shoe.slug}`} className="block">
        <div className="relative overflow-hidden">
          <Image
            src={shoe.primaryImage}
            alt={shoe.name}
            width={900}
            height={900}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
            {shoe.featured ? (
              <Badge>
                <Sparkles size={13} />
                Zephyr edit
              </Badge>
            ) : null}
            {shoe.newArrival ? <Badge variant="secondary">Vừa lên kệ</Badge> : null}
            {shoe.bestSeller ? <Badge variant="success">Bán chạy</Badge> : null}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgba(4,5,10,0.88)] to-transparent" />
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
          <span>{shoe.brand}</span>
          <span>{shoe.categoryName}</span>
        </div>

        <div className="space-y-2">
          <Link href={`/shoes/${shoe.slug}`} className="block">
            <h3 className="font-display text-[2rem] font-semibold text-white transition group-hover:text-[var(--brand-soft)]">
              {shoe.name}
            </h3>
          </Link>
          <p className="text-sm leading-6 text-[var(--muted)]">{shoe.shortDescription}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">{shoe.silhouette}</div>
            <div className="mt-1 text-lg font-semibold text-[var(--brand-gold)]">{formatVnd(shoe.price)}</div>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/shoes/${shoe.slug}`}>
              Xem chi tiết
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
