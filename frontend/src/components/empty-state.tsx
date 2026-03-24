import Link from "next/link";
import { Compass } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <Card className="surface-glass rounded-[2rem] border-white/12">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/12 bg-white/8">
          <Compass size={24} className="text-[var(--brand-soft)]" />
        </div>
        <CardTitle className="max-w-xl text-3xl">{title}</CardTitle>
        <CardDescription className="max-w-2xl">{description}</CardDescription>
      </CardHeader>
      {actionHref && actionLabel ? (
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
