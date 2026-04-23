import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DiffLine } from "@/lib/diff";

interface DiffViewProps {
  lines: DiffLine[];
  className?: string;
}

const LINE_STYLES: Record<DiffLine["type"], string> = {
  added: "bg-green-950 text-green-300",
  removed: "bg-red-950 text-red-300 line-through opacity-70",
  unchanged: "text-zinc-300",
};

const LINE_PREFIX: Record<DiffLine["type"], string> = {
  added: "+ ",
  removed: "- ",
  unchanged: "  ",
};

export function DiffView({ lines, className }: DiffViewProps) {
  return (
    <ScrollArea className={cn("rounded-md bg-zinc-950 p-4", className)}>
      <pre className="text-sm font-mono leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={LINE_STYLES[line.type]}>
            <span className="select-none opacity-50">{LINE_PREFIX[line.type]}</span>
            {line.content}
          </div>
        ))}
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
