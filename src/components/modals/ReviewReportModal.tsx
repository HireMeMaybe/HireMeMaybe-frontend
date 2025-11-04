'use client';

import React, { useState, useEffect } from 'react';
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
import type { Report } from '@/features/admin/hooks/useReport';

interface ReviewReportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly report?: Report | null;
  readonly onReview?: (status: 'reviewed' | 'resolved', adminNote?: string) => Promise<void>;
  readonly onReject?: (
    status: 'reviewed' | 'resolved' | 'rejected',
    adminNote?: string
  ) => Promise<void>;
  readonly onViewEntity?: () => void;
}

export default function ReviewReportModal({
  isOpen,
  onClose,
  report,
  onReview,
  onReject,
  onViewEntity,
}: ReviewReportModalProps) {
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAdminNote('');
    }
  }, [isOpen]);

  const handleResolve = async () => {
    if (!report) return;
    await onReview?.('resolved', adminNote || undefined);
  };

  const handleReject = async () => {
    if (!report) return;
    await onReject?.('rejected', adminNote || 'Report rejected by admin');
  };

  const formattedDate = (() => {
    if (!report?.submitted) return '';
    try {
      const d = new Date(report.submitted);
      return d.toLocaleDateString();
    } catch {
      return report.submitted;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-lg">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold text-white">Review Report</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Review the report details below and take the appropriate action.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 border-t border-zinc-600"></div>

        <div className="space-y-4 px-6 pb-6">
          {/* Reporter info */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{report?.reporter ?? '—'}</div>
              <div className="mt-1 text-xs text-gray-400">{report?.reporterRole ?? ''}</div>
            </div>
            <div className="text-sm text-gray-300">
              Submitted: <span className="text-gray-200">{formattedDate}</span>
            </div>
          </div>

          {/* Reported Entity */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3">
            <div>
              <div className="text-sm text-gray-400">Reported Entity</div>
              <div className="mt-1 font-medium text-white">{report?.reportedEntity || '—'}</div>
              {report?.reportedEntityType && (
                <span className="mt-1 inline-block rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-white">
                  {report.reportedEntityType}
                </span>
              )}
            </div>
            {onViewEntity && (
              <Button
                onClick={onViewEntity}
                className="cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
              >
                View
              </Button>
            )}
          </div>

          {/* Reason */}
          <div>
            <h4 className="mb-2 text-sm text-gray-300">Reason</h4>
            <div className="bg-darker-gray rounded p-4 whitespace-pre-line text-gray-100">
              {report?.reason ?? 'No details provided.'}
            </div>
            {report?.detail && (
              <div className="bg-darker-gray mt-2 rounded p-4 text-sm text-gray-200">
                <h5 className="mb-1 font-medium">Details:</h5>
                <p className="whitespace-pre-line">{report.detail}</p>
              </div>
            )}
            {report?.link && (
              <div className="mt-2 text-sm">
                <a
                  href={report.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-green hover:underline"
                >
                  Link
                </a>
              </div>
            )}
          </div>

          {/* Admin Note */}
          <div>
            <Label htmlFor="adminNote" className="mb-2 text-sm text-gray-300">
              Admin Note (Optional)
            </Label>
            <Textarea
              id="adminNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note about this report..."
              className="mt-1 min-h-[80px] border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={handleReject}
              className="bg-red-reject cursor-pointer rounded-md px-4 py-2 text-white hover:bg-red-700"
              disabled={!report}
            >
              Reject
            </Button>

            <Button
              onClick={handleResolve}
              className="bg-primary-green cursor-pointer rounded-md px-4 py-2 text-white hover:bg-green-700"
              disabled={!report}
            >
              Resolve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
