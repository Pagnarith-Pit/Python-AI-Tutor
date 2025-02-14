
import { cn } from "@/lib/utils";
import { LoadingDots } from "./LoadingDots";
import { LoadingFact } from "./LoadingFact";

export const LoadingMessage = () => {
  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 border-t border-b border-gray-100")}>
      <div className="mx-auto max-w-3xl flex gap-4">
        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-blue-200 text-blue-900">
          L
        </div>
        <div className="flex-1 space-y-3">
          <div className="text-sm font-medium text-gray-800">
            Loading Buddy
          </div>
          <LoadingDots className="pt-2" />
          <LoadingFact />
        </div>
      </div>
    </div>
  );
};
