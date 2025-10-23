'use client';

import { Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BanModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly entityName?: string;
  readonly entityType?: 'CPSK' | 'Company';
}

export default function BanModal({
  isOpen,
  onClose,
  onConfirm,
  entityName = 'this account',
  entityType = 'CPSK',
}: BanModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-md">
        {/* Hidden accessibility components */}
        <DialogTitle className="sr-only">Ban {entityType}</DialogTitle>
        <DialogDescription className="sr-only">Confirm ban for {entityName}</DialogDescription>

        <div className="flex flex-col space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="border-red-reject flex h-16 w-16 items-center justify-center rounded-full border-2">
              <Ban className="text-red-reject h-8 w-8" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">Ban {entityType}</h3>
          </div>

          {/* Message with icon */}
          <div className="flex items-center justify-center gap-2">
            <Ban className="text-red-reject h-4 w-4" />
            <p className="text-red-reject">This action is permanent</p>
          </div>

          {/* Separator */}
          <div className="my-4 border-t border-zinc-600"></div>

          {/* Description */}
          <div className="text-lighter-gray-text text-sm leading-relaxed">
            You are about to permanently ban{' '}
            <span className="font-medium text-white">{entityName}</span>.
            <br />
            <br />
            This will immediately revoke all access and privileges. This action cannot be undone
            automatically, but you can manually unban later if needed.
            <br />
            <br />
            Are you sure you want to proceed?
          </div>

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
              className="bg-red-reject cursor-pointer rounded-md px-6 py-2 text-white hover:bg-red-700"
            >
              Ban
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
