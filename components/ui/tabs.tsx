"use client";

import { cn } from "@/lib/utils";

type TabsProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function SegmentedTabs({ value, options, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-md border border-border bg-white p-1 shadow-line">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-8 rounded-sm px-3 text-sm font-semibold text-ink-muted transition",
            value === option && "bg-primary text-white shadow-line"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
