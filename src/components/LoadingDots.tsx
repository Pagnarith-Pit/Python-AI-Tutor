
import { cn } from "@/lib/utils";

export const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex space-x-1.5", className)}>
      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[bounce_1.4s_infinite_0.2s]" />
      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[bounce_1.4s_infinite_0.4s]" />
      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[bounce_1.4s_infinite_0.6s]" />
    </div>
  );
};
