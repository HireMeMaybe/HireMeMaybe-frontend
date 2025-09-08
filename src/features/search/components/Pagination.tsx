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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Prev Button */}
      <button
        className={`px-3 py-1 text-sm rounded ${
          currentPage === 1
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-text hover:text-white"
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            currentPage === page
              ? "bg-primary-green text-white font-semibold"
              : "text-gray-text hover:text-white"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        className={`px-3 py-1 text-sm rounded ${
          currentPage === totalPages
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-text hover:text-white"
        }`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
