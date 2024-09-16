// src/components/Pagination.js
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex flex-wrap justify-center my-8 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-4 py-2 mb-2 border ${
          currentPage === 1
            ? "cursor-not-allowed bg-gray-200 dark:bg-gray-700 dark:white"
        : "bg-white text-black dark:bg-[#313d4a] dark:text-white"
        }`}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          className={`px-4 py-2 mb-2 border ${
            currentPage === index + 1
              ? "bg-black text-white dark:bg-black dark:text-white"
              : "bg-white text-black dark:bg-[#313d4a] dark:text-white"
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-4 py-2 mb-2 border ${
          currentPage === totalPages
            ? "cursor-not-allowed bg-gray-200 dark:bg-gray-700 dark:white"
            : "bg-white text-black dark:bg-[#313d4a] dark:text-white"
        }`}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
