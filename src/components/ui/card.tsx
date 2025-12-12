import { cn } from "@/lib/utils";

export function Card({ className, children }: any) {
  return (
    <div className={cn("bg-white shadow-sm rounded-xl p-6 border", className)}>
      {children}
    </div>
  );
}
