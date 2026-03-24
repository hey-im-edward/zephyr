import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  markClassName?: string;
  labelClassName?: string;
  compact?: boolean;
  showTagline?: boolean;
};

export function BrandLockup({
  className,
  markClassName,
  labelClassName,
  compact = false,
  showTagline = true,
}: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <BrandMark size={compact ? 46 : 54} className={markClassName} />
      <div className={cn("space-y-1", labelClassName)}>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[1.45rem] font-semibold tracking-[0.08em] text-white">ZEPHYR</span>
          {showTagline ? (
            <span className="hidden font-display text-sm italic text-[var(--accent-soft)] md:inline">
              The art of walking well.
            </span>
          ) : null}
        </div>
        <div className="text-[10px] uppercase tracking-[0.34em] text-[var(--muted-strong)]">
          Xưởng giày đương đại
        </div>
      </div>
    </div>
  );
}
