import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary-soft text-primary",
      secondary: "bg-secondary-soft text-secondary",
      warning: "bg-amber-50 text-warning",
      success: "bg-emerald-50 text-success",
      muted: "bg-gray-100 text-ink-muted",
      destructive: "bg-red-50 text-destructive"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
