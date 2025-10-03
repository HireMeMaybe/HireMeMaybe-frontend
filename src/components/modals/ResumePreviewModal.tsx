'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string | null;
  error: string | null;
  isLoading?: boolean;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  resumeUrl,
  error,
  isLoading = false,
}: ResumePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-700 bg-[#1f1f23] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">Resume Preview</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-neutral-900">
          {error && (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!error && (isLoading || !resumeUrl) && (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-sm text-gray-300">Loading...</p>
            </div>
          )}

          {resumeUrl && !error && (
            <div className="h-full w-full">
              <iframe
                title="Resume Preview"
                src={resumeUrl}
                className="h-full w-full"
                style={{ border: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-700 bg-[#18181b] px-4 py-3">
          <Button
            type="button"
            onClick={onClose}
            className="cursor-pointer bg-gray-600 text-white hover:bg-gray-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
