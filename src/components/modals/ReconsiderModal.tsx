'use client';

import { CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReconsiderModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly description?: string;
  readonly companyName?: string;
  readonly onConfirm?: () => void;
}

export default function ReconsiderModal({
  isOpen,
  onClose,
  title = 'Reconsider Company?',
  message = 'Company will be reconsidered',
  description = 'This will move the company back to pending verification status for review. The company will be notified of this change.',
  companyName = '',
  onConfirm,
}: ReconsiderModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-md">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {message}. {description}
        </DialogDescription>

        <div className="flex flex-col space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="border-primary-green flex h-16 w-16 items-center justify-center rounded-full border-2">
              <CheckCircle className="text-primary-green h-8 w-8" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>

          {/* Message with icon */}
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="text-primary-green h-4 w-4" />
            <p className="text-primary-green">{message}</p>
          </div>

          {/* Separator */}
          <div className="my-4 border-t border-zinc-600"></div>

          {/* Company Name */}
          {companyName && (
            <div className="bg-darker-gray rounded-md p-4">
              <p className="text-sm text-gray-400">Company</p>
              <p className="mt-1 font-semibold text-white">{companyName}</p>
            </div>
          )}

          {/* Description */}
          <div className="text-lighter-gray-text text-sm leading-relaxed">{description}</div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-cancel cursor-pointer rounded-md border-none px-6 py-2 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-primary-green cursor-pointer rounded-md px-6 py-2 text-white hover:bg-green-700"
            >
              Reconsider
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}