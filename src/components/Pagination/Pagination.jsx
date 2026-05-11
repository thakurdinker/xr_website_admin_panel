import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const btnBase = "px-4 py-2 mb-2 border rounded text-sm font-medium transition-colors";
  const btnActive = "bg-black text-white dark:bg-primary dark:text-white";
  const btnInactive = "bg-white text-black hover:bg-gray-100 dark:bg-[#313d4a] dark:text-white dark:hover:bg-[#3f4d5e]";
  const btnDisabled = "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500";

  return (
    <div className="flex flex-wrap items-center justify-center my-8 space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 mb-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${currentPage === page ? btnActive : btnInactive}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      {totalPages > 7 && (
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      )}
    </div>
  );
};

export default Pagination;
