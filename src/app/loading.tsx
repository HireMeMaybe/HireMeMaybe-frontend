import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner using Lucide icon */}
        <Loader2 className="h-12 w-12 animate-spin text-primary-green" />
        
        {/* Loading text */}
        <div className="text-lg font-medium text-foreground animate-pulse">
          Loading...
        </div>
        
        {/* Progress dots */}
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green" />
        </div>
      </div>
    </div>
  );
}