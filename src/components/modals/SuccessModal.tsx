'use client';

import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly buttonText?: string;
  readonly description?: string;
  readonly onConfirm?: () => void;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Action Successful",
  message = "Everything went perfectly",
  buttonText = "Continue",
  description = "Click the continue button to proceed.",
  onConfirm
}: SuccessModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-zinc-700 text-white">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {message}.
        </DialogDescription>
        
        <div className="flex flex-col space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-primary-green flex items-center justify-center">
              <Check className="h-8 w-8 text-primary-green" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
          
          {/* Message with checkmark */}
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-primary-green" />
            <p className="text-primary-green">{message}</p>
          </div>
          
          {/* Separator */}
          <div className="border-t border-zinc-600 my-4"></div>
          
          {/* Description */}
          <div className="text-lighter-gray-text text-sm">
            {description}
          </div>
          
          {/* Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleConfirm} 
              className="bg-primary-green hover:bg-green-700 text-white px-6 py-2 rounded-md"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}