'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/features/admin/hooks/useReport';

interface ReviewReportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly report?: Report | null;
  readonly onReview?: (report: Report) => void;
  readonly onReject?: (report: Report) => void;
}

export default function ReviewReportModal({
  isOpen,
  onClose,
  report,
  onReview,
  onReject,
}: ReviewReportModalProps) {
  const handleReview = () => {
    if (!report) return;
    onReview?.(report);
    onClose();
  };

  const handleReject = () => {
    if (!report) return;
    onReject?.(report);
    onClose();
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

          {/* Reason */}
          <div>
            <h4 className="mb-2 text-sm text-gray-300">Reason</h4>
            <div className="bg-darker-gray rounded p-4 whitespace-pre-line text-gray-100">
              {report?.reason ?? 'No details provided.'}
            </div>
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={handleReject}
              className="bg-red-reject rounded-md px-4 py-2 text-white hover:bg-red-700"
              disabled={!report}
            >
              Reject
            </Button>

            <Button
              onClick={handleReview}
              className="bg-primary-green rounded-md px-4 py-2 text-white hover:bg-green-700"
              disabled={!report}
            >
              Mark Reviewed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
