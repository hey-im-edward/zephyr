import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[1.35rem] border border-white/54 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))] px-4 py-2 text-sm text-[var(--foreground)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-[16px] transition placeholder:text-[var(--foreground-dim)] focus:border-white/72 focus:bg-white/18 focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
