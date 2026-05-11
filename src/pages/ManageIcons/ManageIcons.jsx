import React, { useEffect, useState, useRef } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ICONS } from "../../api/constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../components/Pagination/Pagination";

function ManageIcons() {
  const [icons, setIcons] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isUserSearching = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (isUserSearching.current) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch icons
  useEffect(() => {
    const fetchIcons = async () => {
      setLoading(true);
      try {
        const params = `?page=${currentPage}&limit=10${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`;
        const res = await fetch(FETCH_ICONS + params, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.success) {
          setIcons(data.icons);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching icons:", error);
        toast.error("Failed to load icons");
      }
      setLoading(false);
    };
    fetchIcons();
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const handleDeleteClick = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name || "this icon"}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${FETCH_ICONS}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setIcons(icons.filter((i) => i._id !== id));
        toast.success("Icon deleted");
      } else {
        toast.error(data.message || "Failed to delete icon");
      }
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast.error("Failed to delete icon");
    }
  };

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          {/* Header */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Manage Icons
            </h2>
            <Link
              to="/forms/add-icon"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Add Icon
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <input
              type="text"
              placeholder="Search icons by name..."
              value={searchTerm}
              onChange={(e) => {
                isUserSearching.current = true;
                setSearchTerm(e.target.value);
              }}
              className="w-full max-w-md rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
            <div className="col-span-1">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                #
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                ICON
              </h5>
            </div>
            <div className="col-span-3">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                NAME
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                CREATED
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                UPDATED
              </h5>
            </div>
            <div className="col-span-2 flex justify-end">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                ACTIONS
              </h5>
            </div>
          </div>

          {/* Table body */}
          <div className="bg-white dark:bg-boxdark">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                Loading...
              </div>
            ) : icons.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                No icons found.
              </div>
            ) : (
              icons.map((icon, index) => (
                <div
                  key={icon._id || index}
                  className="grid grid-cols-12 border-t border-[#EEEEEE] px-5 py-3 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  {/* # */}
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {(currentPage - 1) * 10 + (index + 1)}
                    </p>
                  </div>

                  {/* Icon preview */}
                  <div className="col-span-2 flex items-center">
                    {icon.icon_url ? (
                      <img
                        src={icon.icon_url}
                        alt={icon.icon_text || ""}
                        className="h-10 w-10 rounded object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-meta-4">
                        <svg
                          className="h-5 w-5 text-[#637381]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="col-span-3 flex items-center">
                    <Link
                      to={`/forms/add-icon/${icon._id}?page=${currentPage}`}
                      className="truncate text-sm font-medium text-primary hover:underline"
                      title={icon.icon_text}
                    >
                      {icon.icon_text || "Untitled"}
                    </Link>
                  </div>

                  {/* Created */}
                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark">
                      {icon.createdAt
                        ? new Date(icon.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {/* Updated */}
                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark">
                      {icon.updatedAt
                        ? new Date(icon.updatedAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/forms/add-icon/${icon._id}?page=${currentPage}`)
                      }
                      className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteClick(icon._id, icon.icon_text)
                      }
                      className="rounded bg-red px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </DefaultLayout>
  );
}

export default ManageIcons;
