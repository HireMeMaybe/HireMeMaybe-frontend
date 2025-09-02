'use client';

import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly description?: string;
  readonly buttonText?: string;
  readonly onConfirm?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Action Successful',
  message = 'Everything went perfectly',
  description = 'You can now proceed with the next steps.',
  buttonText = 'Continue',
  onConfirm,
}: SuccessModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-md">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{message}.</DialogDescription>

        <div className="flex flex-col items-center space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="border-primary-green flex h-16 w-16 items-center justify-center rounded-full border-2">
              <Check className="text-primary-green h-8 w-8" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>

          {/* Message with checkmark */}
          <div className="flex items-center justify-center gap-2">
            <Check className="text-primary-green h-4 w-4" />
            <p className="text-primary-green">{message}</p>
          </div>

          {/* Separator */}
          <div className="my-4 self-stretch border-t border-zinc-600"></div>

          {/* Description */}
          <div className="text-lighter-gray-text text text-sm">{description}</div>

          {/* Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleConfirm}
              className="bg-primary-green rounded-md px-6 py-2 text-white hover:bg-green-700"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
