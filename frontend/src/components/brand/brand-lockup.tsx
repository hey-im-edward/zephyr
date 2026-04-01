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
    <div className={cn("brand-lockup", className)}>
      <BrandMark size={compact ? 44 : 54} className={markClassName} />
      <div className={cn("space-y-1", labelClassName)}>
        <div className="brand-wordmark">ZEPHYR</div>
        {showTagline ? <div className="brand-caption">Atmospheric footwear</div> : null}
      </div>
    </div>
  );
}
