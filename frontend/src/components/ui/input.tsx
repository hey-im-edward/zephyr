import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-[1.25rem] border border-white/12 bg-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-[var(--brand-gold)] focus:bg-[rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
