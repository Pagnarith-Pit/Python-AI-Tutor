import { cn } from "@/lib/utils";
import { LoadingDots } from "./LoadingDots";
import { LoadingFact } from "./LoadingFact";
import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";

export const LoadingMessage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out rounded-3xl",
        isExpanded
          ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-gray-50 z-50 shadow-xl"
          : "w-full bg-gray-50 relative bottom-0 right-0"
      )}
    >
      <div className={cn(
        "px-4 py-6 sm:px-6 lg:px-8",
        isExpanded && "h-full"
      )}>
        <div className="mx-auto max-w-3xl flex gap-4 relative">
          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-blue-200 text-blue-900">
            L
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-sm font-medium text-gray-800 flex justify-between items-center">
              <span>Please Wait While I Prepare Your Solution-Steps</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
                onClick={toggleExpand}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-y-auto",
              isExpanded ? "h-[calc(80vh-8rem)]" : "h-auto"
            )}>
              <LoadingFact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};