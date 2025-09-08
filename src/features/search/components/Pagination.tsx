"use client";

export default function Pagination() {
  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        <button className="w-8 h-8 flex items-center justify-center bg-primary-green text-white rounded font-semibold">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-text hover:text-white">
          2
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-text hover:text-white">
          3
        </button>
        <span className="text-gray-text px-2">...</span>
        <button className="w-8 h-8 flex items-center justify-center text-gray-text hover:text-white">
          12
        </button>
        <button className="px-3 py-1 text-sm text-gray-text hover:text-white">
          Next →
        </button>
      </div>
    </div>
  );
}
