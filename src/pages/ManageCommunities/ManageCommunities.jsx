import React, { useEffect, useState, useRef } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ALL_COMMUNITIES } from "../../api/constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../components/Pagination/Pagination";

function ManageCommunities() {
  const [communities, setCommunities] = useState([]);
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

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const params = `?page=${currentPage}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`;
        const res = await fetch(FETCH_ALL_COMMUNITIES + params, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.success) {
          setCommunities(data.communities);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast.error("Failed to load communities");
      }
      setLoading(false);
    };
    fetchCommunities();
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const handleDeleteClick = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${FETCH_ALL_COMMUNITIES}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCommunities(communities.filter((c) => c.id !== id && c._id !== id));
        toast.success("Community deleted");
      } else {
        toast.error(data.message || "Failed to delete community");
      }
    } catch (error) {
      console.error("Error deleting community:", error);
      toast.error("Failed to delete community");
    }
  };

  const getThumb = (community) => {
    const img = community.images?.[0];
    if (!img) return null;
    const url = typeof img === "string" ? img : img?.url || "";
    if (!url) return null;
    return url.replace(
      "https://res.cloudinary.com/dkhns25jh/image/upload/",
      "https://res.cloudinary.com/dkhns25jh/image/upload/w_80,h_56,c_fill,f_auto,q_auto/"
    );
  };

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          {/* Header */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Manage Communities
            </h2>
            <Link
              to="/forms/add-community"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Add Community
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <input
              type="text"
              placeholder="Search communities by name..."
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
            <div className="col-span-1">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                IMAGE
              </h5>
            </div>
            <div className="col-span-3">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                NAME
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                DEVELOPER
              </h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                LOCATION
              </h5>
            </div>
            <div className="col-span-1">
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
            ) : communities.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                No communities found.
              </div>
            ) : (
              communities.map((community, index) => {
                const thumb = getThumb(community);
                const cityState = [
                  community.location?.city,
                  community.location?.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={community._id || community.id || index}
                    className="grid grid-cols-12 border-t border-[#EEEEEE] px-5 py-3 dark:border-strokedark lg:px-7.5 2xl:px-11"
                  >
                    {/* # */}
                    <div className="col-span-1 flex items-center">
                      <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                        {(currentPage - 1) * 10 + (index + 1)}
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div className="col-span-1 flex items-center">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 dark:bg-meta-4">
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
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Name + Slug */}
                    <div className="col-span-3 flex flex-col justify-center">
                      <Link
                        to={`/forms/add-community/${community._id || community.id}?page=${currentPage}`}
                        className="truncate text-sm font-medium text-primary hover:underline"
                        title={community.name}
                      >
                        {community.name}
                      </Link>
                      {community.slug && (
                        <p className="mt-0.5 truncate text-xs text-[#637381] dark:text-bodydark">
                          /{community.slug}
                        </p>
                      )}
                    </div>

                    {/* Developer */}
                    <div className="col-span-2 flex items-center">
                      <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm">
                        {community.developer || "—"}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="col-span-2 flex items-center">
                      <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm" title={cityState}>
                        {cityState || "—"}
                      </p>
                    </div>

                    {/* Updated */}
                    <div className="col-span-1 flex items-center">
                      <p className="text-xs text-[#637381] dark:text-bodydark">
                        {community.updatedAt
                          ? new Date(community.updatedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/forms/add-community/${community._id || community.id}?page=${currentPage}`
                          )
                        }
                        className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(
                            community._id || community.id,
                            community.name
                          )
                        }
                        className="rounded bg-red px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                      >
                        Delete
                      </button>
                    </div>
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
}

export default ManageCommunities;
