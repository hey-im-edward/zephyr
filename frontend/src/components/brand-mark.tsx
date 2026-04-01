import { BrandLockup } from "@/components/brand/brand-lockup";
import { BrandMark as PrimitiveBrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  showTagline?: boolean;
};

export function BrandMark({ className, compact = false, showTagline = false }: BrandMarkProps) {
  if (showTagline) {
    return <BrandLockup className={className} compact={compact} showTagline />;
  }

  return <PrimitiveBrandMark className={cn(className)} size={compact ? 44 : 52} />;
}
