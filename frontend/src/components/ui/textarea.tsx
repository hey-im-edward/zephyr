import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-28 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--line-strong)] focus:bg-white/9 focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
