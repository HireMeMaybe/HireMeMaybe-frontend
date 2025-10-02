'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
}

export default function LoadingModal({
  isOpen,
  title = 'Uploading',
  message = 'Please wait while we process your request...',
  onClose,
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="bg-background border-gray-700 text-white sm:max-w-md">
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          {/* Spinner */}
          <div className="relative h-16 w-16">
            <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-zinc-600 border-t-[var(--color-primary-green)]"></div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-white">{title}</h2>

          {/* Message */}
          <p className="text-center text-sm text-gray-300">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
