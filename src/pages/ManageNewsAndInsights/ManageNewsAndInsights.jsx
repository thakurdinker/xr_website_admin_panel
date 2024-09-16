import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { NEWS } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import Pagination from "../../components/Pagination/Pagination";

function ManageNewsAndInsights() {
  const [contentList, setContentList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const location = useLocation();

  // Extract currentPage from query parameters
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const fetchContent = async (page = 1) => {
      try {
        const response = await axios.get(NEWS, {
          params: { page, limit },
          withCredentials: true,
        });
        if (response.data.success) {
          setContentList(response.data.contentList);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchContent(currentPage);
  }, [currentPage]);

  const handleEditClick = (contentListId) => {
    navigate(`/forms/add-news-and-blog/${contentListId}?page=${currentPage}`);
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${NEWS}/${id}`, { withCredentials: true });
        if (response.data.success) {
          setContentList(contentList.filter((content) => content._id !== id));
        } else {
          console.error("Error deleting blog:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Update the URL with the new page number
      navigate(`?page=${pageNumber}`);
    }
  };

  const formatDate = (isoDate) => {
    const dateObject = new Date(isoDate);
    return dateObject.toLocaleString();
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
                <Link to="/forms/add-news-and-blog" className="text-xl md:text-2xl">
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {contentList.map((content, index) => (
                <div
                  key={index}
                  className="grid grid-cols-9 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {(currentPage - 1) * limit + (index + 1)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {content.title}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(content.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(content.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      className="text-black dark:text-white"
                      onClick={() => handleEditClick(content._id)}
                    >
                      <MdEditDocument className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(content._id)}
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

export default ManageNewsAndInsights;
