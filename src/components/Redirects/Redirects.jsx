import React, { useEffect, useState, useRef } from "react";
import { REDIRECT_MANAGER } from "../../api/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultLayout from "../../layout/DefaultLayout";
import Pagination from "../Pagination/Pagination";
import { useNavigate, useLocation } from "react-router-dom";

const RedirectManager = () => {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ from: "", to: "", type: "301" });
  const [editingRedirect, setEditingRedirect] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isUserSearching = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract currentPage from query parameters
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync currentPage when URL query param changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Debounce search input — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (isUserSearching.current) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch redirects from API with search + pagination
  useEffect(() => {
    const fetchRedirects = async () => {
      setLoading(true);
      try {
        const params = `?page=${currentPage}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`;
        const response = await fetch(REDIRECT_MANAGER + params, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        if (data.success) {
          setRedirects(data.redirects);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching redirects:", error);
        toast.error("Failed to load redirects");
      }
      setLoading(false);
    };

    fetchRedirects();
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from.startsWith("/")) {
      toast.error("'From' URL must start with /");
      return;
    }
    if (
      !formData.to.startsWith("/") &&
      !formData.to.startsWith("https://www.xrealty.ae")
    ) {
      toast.error("'To' URL must start with / or https://www.xrealty.ae");
      return;
    }

    setLoading(true);

    try {
      const url = editingRedirect
        ? `${REDIRECT_MANAGER}/${editingRedirect._id}`
        : REDIRECT_MANAGER;
      const method = editingRedirect ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save");
      }

      if (editingRedirect) {
        setRedirects(
          redirects.map((r) =>
            r._id === editingRedirect._id ? { ...r, ...formData } : r
          )
        );
        toast.success("Redirect updated");
      } else {
        toast.success("Redirect added");
        // Re-fetch to get updated list with pagination
        setCurrentPage(1);
        setDebouncedSearch("");
        setSearchTerm("");
      }

      setFormData({ from: "", to: "", type: "301" });
      setEditingRedirect(null);
    } catch (error) {
      console.error("Error saving redirect:", error);
      toast.error(error.message || "Failed to save redirect");
    }

    setLoading(false);
  };

  const handleEdit = (redirect) => {
    setEditingRedirect(redirect);
    setFormData({ from: redirect.from, to: redirect.to, type: redirect.type });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (redirectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this redirect? This cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${REDIRECT_MANAGER}/${redirectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");

      setRedirects(redirects.filter((r) => r._id !== redirectId));
      toast.success("Redirect deleted");
    } catch (error) {
      console.error("Error deleting redirect:", error);
      toast.error("Failed to delete redirect");
    }
    setLoading(false);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleString();
  };

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          {/* Header */}
          <div className="bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Redirect Manager
            </h2>
          </div>

          {/* Add/Edit Form */}
          <div className="border-b border-stroke bg-white px-5 py-4 dark:border-strokedark dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <form onSubmit={handleFormSubmit} className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  From URL
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  placeholder="/old-path"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="col-span-4">
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  To URL
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  placeholder="/new-path"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="301">301 (Permanent)</option>
                  <option value="302">302 (Temporary)</option>
                </select>
              </div>
              <div className="col-span-2 flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  {editingRedirect ? "Update" : "Add"}
                </button>
                {editingRedirect && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ from: "", to: "", type: "301" });
                      setEditingRedirect(null);
                    }}
                    className="rounded border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <input
              type="text"
              placeholder="Search redirects by from or to URL..."
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
            <div className="col-span-1 flex items-center">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                #
              </h5>
            </div>
            <div className="col-span-4 flex items-center">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                FROM
              </h5>
            </div>
            <div className="col-span-3 flex items-center">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                TO
              </h5>
            </div>
            <div className="col-span-1 flex items-center">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                TYPE
              </h5>
            </div>
            <div className="col-span-1 flex items-center">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                DATE
              </h5>
            </div>
            <div className="col-span-2 flex items-center justify-end">
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
            ) : redirects.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                No redirects found.
              </div>
            ) : (
              redirects.map((redirect, index) => {
                const isExpanded = expandedId === redirect._id;
                return (
                  <div key={redirect._id || index}>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : redirect._id)}
                      className="grid cursor-pointer grid-cols-12 border-t border-[#EEEEEE] px-5 py-4 transition-colors hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 lg:px-7.5 2xl:px-11"
                    >
                      <div className="col-span-1 flex items-center">
                        <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                          {(currentPage - 1) * 10 + (index + 1)}
                        </p>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm" title={redirect.from}>
                          {redirect.from}
                        </p>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm" title={redirect.to}>
                          {redirect.to}
                        </p>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            redirect.type === "301"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {redirect.type}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <p className="text-xs text-[#637381] dark:text-bodydark">
                          {redirect.createdAt
                            ? new Date(redirect.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(redirect); }}
                          className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(redirect._id); }}
                          className="rounded bg-red px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <div className="border-t border-dashed border-[#EEEEEE] bg-[#F9FAFB] px-5 py-4 dark:border-strokedark dark:bg-meta-4/50 lg:px-7.5 2xl:px-11">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#1C2434] dark:text-white">
                              From URL
                            </p>
                            <p className="break-all text-sm text-[#637381] dark:text-bodydark">
                              {redirect.from}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#1C2434] dark:text-white">
                              To URL
                            </p>
                            <a
                              href={redirect.to.startsWith("http") ? redirect.to : `https://www.xrealty.ae${redirect.to}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {redirect.to}
                            </a>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#1C2434] dark:text-white">
                              Redirect Type
                            </p>
                            <p className="text-sm text-[#637381] dark:text-bodydark">
                              {redirect.type === "301" ? "301 — Permanent" : "302 — Temporary"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-[#1C2434] dark:text-white">
                              Created
                            </p>
                            <p className="text-sm text-[#637381] dark:text-bodydark">
                              {redirect.createdAt ? formatDate(redirect.createdAt) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
};

export default RedirectManager;
