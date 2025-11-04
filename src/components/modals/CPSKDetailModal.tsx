'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { CPSKAccount } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { AdminService } from '@/lib/services/admin.service';

interface CPSKDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly cpskId: string;
}

export default function CPSKDetailModal({ isOpen, onClose, cpskId }: CPSKDetailModalProps) {
  const [cpskData, setCpskData] = useState<CPSKAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCPSKData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Get all CPSK accounts and find the one we need
      const allCPSKs = await AdminService.getCPSKAccounts();
      const cpsk = allCPSKs.find((c) => c.id === cpskId);

      if (!cpsk) {
        throw new Error('CPSK not found');
      }

      setCpskData(cpsk);
    } catch (err) {
      console.error('Error fetching CPSK data:', err);
      setError('Failed to load CPSK details');
    } finally {
      setIsLoading(false);
    }
  }, [cpskId]);

  useEffect(() => {
    if (isOpen && cpskId) {
      fetchCPSKData();
    }
  }, [isOpen, cpskId, fetchCPSKData]);

  const handleClose = () => {
    setCpskData(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background border-zinc-700 text-white sm:max-w-2xl">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold text-white">CPSK Details</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            View detailed information about this CPSK user
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 border-t border-zinc-600"></div>

        <div className="space-y-4 px-6 pb-6">
          {isLoading && (
            <div className="py-8 text-center text-gray-400">Loading CPSK details...</div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && cpskData && (
            <>
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Name</div>
                  <p className="mt-1 text-white">{cpskData.name || '—'}</p>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <p className="mt-1 text-white">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${(() => {
                        if (cpskData.status === 'Banned') return 'bg-red-500/20 text-red-500';
                        if (cpskData.status === 'Suspended')
                          return 'bg-yellow-500/20 text-yellow-500';
                        return 'bg-green-500/20 text-green-500';
                      })()}`}
                    >
                      {cpskData.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <p className="mt-1 text-white">{cpskData.email || '—'}</p>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Phone</div>
                  <p className="mt-1 text-white">{cpskData.tel || '—'}</p>
                </div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Major/Program</div>
                  <p className="mt-1 text-white">{cpskData.major || cpskData.program || '—'}</p>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Year</div>
                  <p className="mt-1 text-white">{cpskData.year || '—'}</p>
                </div>
              </div>

              {/* Punishment Info if exists */}
              {cpskData.punishment && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                  <div className="text-sm font-medium text-red-400">Punishment Information</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>{' '}
                      <span className="text-white">{cpskData.punishment.type}</span>
                    </div>
                    {cpskData.punishment.at && (
                      <div>
                        <span className="text-gray-400">Started:</span>{' '}
                        <span className="text-white">
                          {new Date(cpskData.punishment.at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {cpskData.punishment.end && (
                      <div>
                        <span className="text-gray-400">Ends:</span>{' '}
                        <span className="text-white">
                          {new Date(cpskData.punishment.end).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleClose}
              className="cursor-pointer rounded-md bg-zinc-700 px-6 py-2 text-white hover:bg-zinc-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
