'use client';

import { FileQuestionMark, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly description?: string;
  readonly onConfirm?: () => void;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  title = "Submit Application?",
  message = "Please confirm your choice",
  description = "Are you ready to submit your application to\nTech Innovators Inc?",
  onConfirm
}: ConfirmationModalProps) {
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
          {message}. {description}
        </DialogDescription>
        
        <div className="flex flex-col space-y-6 p-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-sky-blue flex items-center justify-center">
              <FileQuestionMark className="h-8 w-8 text-sky-blue" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
          
          {/* Message with dot */}
          <div className="flex items-center justify-center gap-2">
            <HelpCircle className="h-4 w-4 text-sky-blue" />
            <p className="text-sky-blue">{message}</p>
          </div>
          
          {/* Separator */}
          <div className="border-t border-zinc-600 my-4"></div>
          
          {/* Description */}
          <div className="text-lighter-gray-text text-sm whitespace-pre-line">
            {description}
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="border-none bg-gray-cancel text-white hover:bg-gray-800 px-6 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="bg-sky-blue hover:bg-blue-800 text-white px-6 py-2 rounded-md"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}