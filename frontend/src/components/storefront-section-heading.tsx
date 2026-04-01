import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StorefrontSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
};

export function StorefrontSectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: StorefrontSectionHeadingProps) {
  const titleWidthClass = align === "center" ? "max-w-[18ch] sm:max-w-[20ch]" : "max-w-[18ch] sm:max-w-[20ch]";

  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center")}>
      <div className="eyebrow w-fit">{eyebrow}</div>
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        <h2 className={cn("display-section leading-[1.02]", titleWidthClass)}>{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-[0.96rem]">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
