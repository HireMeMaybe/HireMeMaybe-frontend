"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface ReportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit?: (data: { type: string; reason: string; details: string }) => void;
}

export function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({ type: '', reason: '', details: '' }); // Reset form
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-gray-700 text-white">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-xl font-semibold text-white">
            Report Job Post / Company
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Help us maintain a safe platform
          </DialogDescription>
        </DialogHeader>

        {/* Separator */}
        <div className="border-t border-zinc-600"></div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
    
          
          {/* Report details */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Reason for reporting</Label>
            <Textarea
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="Please provide details about your report..."
              className="bg-darker-gray border-gray-600 text-white placeholder-gray-400 resize-none min-h-[100px]"
              rows={4}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-none bg-gray-cancel text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-red-reject hover:bg-red-700 text-white"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}