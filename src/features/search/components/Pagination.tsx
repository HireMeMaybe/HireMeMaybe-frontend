"use client";

type PaginationProps = {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const createRange = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      return createRange(1, totalPages);
    }

    if (currentPage <= 4) {
      return [...createRange(1, 5), "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", ...createRange(totalPages - 4, totalPages)];
    }

    return [1, "...", ...createRange(currentPage - 1, currentPage + 1), "...", totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        className={`px-4 py-2 text-sm rounded ${
          currentPage === 1
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, idx) => {
        if (page === "...") {
          const prev = visiblePages[idx - 1];
          const next = visiblePages[idx + 1];
          return (
            <span key={`ellipsis-${prev}-${next}`} className="px-3 py-2 text-gray-400">
              ...
            </span>
          );
        }

        return (
          <button
            key={`page-${page}`}
            className={`w-10 h-10 flex items-center justify-center rounded ${
              currentPage === page
                ? "bg-primary-green text-white font-semibold"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        className={`px-4 py-2 text-sm rounded ${
          currentPage === totalPages
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
