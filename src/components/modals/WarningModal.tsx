'use client';

import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';

interface WarningModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly description?: string;
  readonly onSave?: () => void;
  readonly onLeave?: () => void;
}

export function WarningModal({ 
  isOpen, 
  onClose, 
  title = "Unsaved Changes",
  message = "Proceed with caution",
  description = "You have unsaved changes that will be lost if you continue. Are you sure you want to leave this page without saving your progress?",
  onSave,
  onLeave
}: WarningModalProps) {
  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const handleLeave = () => {
    onLeave?.();
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
            <div className="w-16 h-16 rounded-full border-2 border-yellow-warning flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-warning" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          </div>
          
          {/* Message with warning icon */}
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-warning" />
            <p className="text-yellow-warning">{message}</p>
          </div>
          
          {/* Separator */}
          <div className="border-t border-zinc-600 my-4"></div>
          
          {/* Description */}
          <div className="text-lighter-gray-text text-sm leading-relaxed">
            {description}
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              onClick={handleSave}
              className="bg-yellow-warning hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
            >
              Save & Stay
            </Button>
            <Button 
              onClick={handleLeave}
              className="bg-red-reject hover:bg-red-700 text-white px-6 py-2 rounded-md"
            >
              Leave Anyway
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}