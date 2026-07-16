import { Button } from "@/components/ui/button";

type SectionHeadingProps = {
  title: string;
  description: string;
  action?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
};

export function SectionHeading({ title, description, action, icon, onAction }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      {action ? (
        <Button type="button" variant="outline" onClick={onAction}>
          {icon}
          {action}
        </Button>
      ) : null}
    </div>
  );
}
