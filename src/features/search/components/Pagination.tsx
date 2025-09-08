"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded font-semibold ${
              page === currentPage
                ? "bg-primary-green text-white"
                : "text-gray-text hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
