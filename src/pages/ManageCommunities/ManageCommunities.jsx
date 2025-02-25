import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ALL_COMMUNITIES } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import Pagination from "../../components/Pagination/Pagination";

function ManageCommunities() {
  const [communities, setCommunities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract currentPage from query parameters
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(
          FETCH_ALL_COMMUNITIES + `?page=${currentPage}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setCommunities(response.data.communities);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchCommunities();
  }, [currentPage]);

  const handleEditClick = (communityId) => {
    // Redirect to the AddCommunity component in edit mode with the communityId and current page
    navigate(`/forms/add-community/${communityId}?page=${currentPage}`);
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this community?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(FETCH_ALL_COMMUNITIES + `/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setCommunities(
            communities.filter((community) => community.id !== id)
          );
        } else {
          console.error("Error deleting community:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting community:", error);
      }
    }
  };

  const formatDate = (isoDate) => {
    const dateObject = new Date(isoDate);
    return dateObject.toLocaleString();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Update the URL with the new page number
      navigate(`?page=${newPage}`);
    }
  };

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          <div>
            {/* table header start */}
            <div className="grid grid-cols-9 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
              <div className="col-span-1 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  Number
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  Name
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  CREATED AT
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  UPDATED AT
                </h5>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <Link to="/forms/add-community" className="text-xl md:text-2xl">
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {communities.map((community, index) => (
                <div
                  key={index}
                  className="grid grid-cols-9 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {(currentPage - 1) * 10 + (index + 1)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {community?.name}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(community.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(community.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      className="text-black dark:text-white"
                      onClick={() => handleEditClick(community.id)}
                    >
                      <MdEditDocument className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(community.id)}
                    >
                      <MdDeleteForever className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default ManageCommunities;
