import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  return (
    <ScrollArea className={cn("rounded-md bg-zinc-950 p-4", className)}>
      <pre className="text-sm text-zinc-100 font-mono leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
