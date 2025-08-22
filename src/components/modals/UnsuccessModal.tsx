'use client';

import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Action Unsuccessful",
  message = "Action required",
  onCancel,
  onRetry
}: ErrorModalProps) {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleRetry = () => {
    onRetry?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-gray-700 text-white">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {message}. HelloHelloHelloHelloHelloHelloHelloHelloHelloHello
        </DialogDescription>
        
        <div className="flex flex-col space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-red-reject flex items-center justify-center">
              <X className="h-8 w-8 text-red-reject" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
          
          {/* Message with X icon */}
          <div className="flex items-center justify-center gap-2">
            <X className="h-4 w-4 text-red-reject" />
            <p className="text-red-reject">{message}</p>
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-600 my-4"></div>
          
          {/* Description */}
          <div className="text-lighter-gray-text text-sm">
            HelloHelloHelloHelloHelloHelloHelloHelloHelloHello
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="border-none text-white bg-gray-cancel px-6 py-2 rounded-md hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRetry}
              className="bg-red-reject hover:bg-red-700 text-white px-6 py-2 rounded-md"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}