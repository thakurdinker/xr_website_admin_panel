import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ICONS, NEWS } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";

function ManageIcons() {
  const [icons, setIcons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const fetchContent = async (page = 1) => {
    try {
      const response = await axios.get(FETCH_ICONS, {
        params: { page, limit },
        withCredentials: true,
      });
      console.log(response.data);
      if (response.data.success) {
        setIcons(response.data.icons);
        setTotalPages(response.data.totalPages);
        setCurrentPage(Number(response.data.currentPage));
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    fetchContent(currentPage);
  }, [currentPage]);

  const handleDeleteClick = async (id) => {
    try {
      const response = await axios.delete(`${FETCH_ICONS}/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        // Refetch the icons after deletion
        fetchContent(currentPage);
      } else {
        console.error("Error deleting content:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
            <div className="grid grid-cols-10 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  Icons
                </h5>
              </div>
              
              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  Description
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
                <Link
                  to="/forms/add-icon"
                  className="text-xl md:text-2xl"
                >
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {icons.map((icon, index) => (
                <div
                  key={index}
                  className="grid grid-cols-10 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-2 flex items-center">
                    <img src={icon.icon_url} className="w-30 h-20" alt="" />
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {icon.icon_text}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(icon.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(icon.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(icon._id)}
                    >
                      <MdDeleteForever className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* table body end */}
            <div className="flex justify-between p-5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded"
              >
                Previous
              </button>
              <div className="flex items-center">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default ManageIcons;
  