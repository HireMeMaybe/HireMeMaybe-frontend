'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useJobHistory } from '../hooks/useJobHistory';
import HistoryCard, { HistoryDetails } from './HistoryCard';
import { Button } from '@/components/ui/button';
import Pagination from '@/features/search/components/Pagination';

const ITEMS_PER_PAGE = 8;

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const { history, loading, error, filters, setFilters, refetch } = useJobHistory();
  const [selectedApplication, setSelectedApplication] = useState(history[0]);
  const [currentPage, setCurrentPage] = useState(1);

  // Update selected application when history loads
  useEffect(() => {
    if (!selectedApplication && history.length > 0) {
      setSelectedApplication(history[0]);
    }
  }, [history, selectedApplication]);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSortChange = () => {
    const newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({
      ...filters,
      sortBy: 'appliedDate',
      sortOrder: newSortOrder,
    });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading your application history...</div>
      </div>
    );
  }

  // Show auth required state
  if (status === 'unauthenticated') {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Please sign in to view your application history.</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">History</h1>
            <p className="mt-1 text-gray-400">Review your job applied activity</p>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className="bg-darker-gray flex items-center gap-2 border-gray-700 text-white hover:bg-gray-700"
              onClick={handleSortChange}
            >
              {filters.sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid h-full grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {/* History List */}
          <div className="flex flex-col divide-y divide-gray-700 self-stretch border border-gray-700 lg:col-span-1">
            {paginatedHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-medium text-white">No Applications Yet</h3>
                  <p className="text-sm">
                    You haven't applied to any jobs yet. Start exploring opportunities!
                  </p>
                </div>
                {error && (
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="mt-4 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            ) : (
              paginatedHistory.map((application, index) => (
                <div
                  key={application.id}
                  className={index === paginatedHistory.length - 1 ? 'border-b-0' : ''}
                >
                  <HistoryCard
                    application={application}
                    selected={selectedApplication?.id === application.id}
                    onSelect={() => setSelectedApplication(application)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Application Details */}
          <div className="self-stretch lg:col-span-2">
            {selectedApplication ? (
              <HistoryDetails application={selectedApplication} />
            ) : (
              <div className="bg-darker-gray flex h-full items-center justify-center border border-gray-700">
                <div className="text-gray-400">Select an application to view details</div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
