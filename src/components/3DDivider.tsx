import { cn } from "@/lib/utils";

interface ThreeDDividerProps {
  className?: string;
}

export function ThreeDDivider({ className }: ThreeDDividerProps) {
  return (
    <div className={cn("relative w-full py-4", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-muted-foreground/40 to-transparent"></div>
      </div>
      <div className="absolute inset-0 flex items-center translate-y-[1px]">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-card to-transparent"></div>
      </div>
    </div>
  );
} 