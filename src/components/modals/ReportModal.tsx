'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface ReportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit?: (data: { type: string; reason: string; details: string }) => void;
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    details: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({ type: '', reason: '', details: '' }); // Reset form
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-gray-700 text-white sm:max-w-md">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold text-white">
            Report Job Post / Company
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Help us maintain a safe platform
          </DialogDescription>
        </DialogHeader>

        {/* Separator */}
        <div className="border-t border-zinc-600"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report details */}
          <div className="space-y-2">
            <Label className="text-sm text-white">Reason for reporting</Label>
            <Textarea
              value={formData.details}
              onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
              placeholder="Please provide details about your report..."
              className="bg-darker-gray min-h-[100px] resize-none border-gray-600 text-white placeholder-gray-400"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-cancel flex-1 border-none text-white hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-red-reject flex-1 text-white hover:bg-red-700 cursor-pointer">
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
