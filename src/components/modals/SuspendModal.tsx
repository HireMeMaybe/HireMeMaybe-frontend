'use client';

import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface SuspendModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (startDate: string, endDate: string) => void;
  readonly entityName?: string;
  readonly entityType?: 'CPSK' | 'Company';
}

export default function SuspendModal({
  isOpen,
  onClose,
  onConfirm,
  entityName = 'this account',
  entityType = 'CPSK',
}: SuspendModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date().toISOString().slice(0, 10);
      setStartDate(now);
      setEndDate('');
    }
  }, [isOpen]);

  const handleQuickSelect = (days: number) => {
    if (!startDate) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    setEndDate(end.toISOString().slice(0, 10));
  };

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    onConfirm(startDate, endDate);
    onClose();
  };

  const now = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-lg">
        <DialogTitle className="sr-only">Suspend {entityType}</DialogTitle>
        <DialogDescription className="sr-only">
          Select suspension period for {entityName}
        </DialogDescription>

        <div className="flex flex-col space-y-6 p-8">
          <div className="flex justify-center">
            <div className="border-bright-yellow flex h-16 w-16 items-center justify-center rounded-full border-2">
              <AlertTriangle className="text-bright-yellow h-8 w-8" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white">Suspend {entityType}</h3>
          </div>

          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="text-bright-yellow h-4 w-4" />
            <p className="text-bright-yellow">Select suspension period</p>
          </div>

          <div className="my-4 border-t border-zinc-600"></div>

          <div className="text-lighter-gray-text text-sm">
            You are about to suspend <span className="font-medium text-white">{entityName}</span>.
            Please select the suspension period below.
          </div>

          <div className="space-y-4">
            <div className="relative space-y-2">
              <Label htmlFor="startDate" className="text-white">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                min={now}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-zinc-600 bg-zinc-800 text-white"
              />
            </div>

            <div className="relative space-y-2">
              <Label htmlFor="endDate" className="text-white">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || now}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-zinc-600 bg-zinc-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Quick Select:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleQuickSelect(1)}
                  disabled={!startDate}
                  className="cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  1 Day
                </Button>
                <Button
                  type="button"
                  onClick={() => handleQuickSelect(3)}
                  disabled={!startDate}
                  className="cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  3 Days
                </Button>
                <Button
                  type="button"
                  onClick={() => handleQuickSelect(7)}
                  disabled={!startDate}
                  className="cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  7 Days
                </Button>
              </div>
            </div>
          </div>

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
              className="bg-bright-yellow cursor-pointer rounded-md px-6 py-2 text-black hover:bg-yellow-600"
            >
              Suspend
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}