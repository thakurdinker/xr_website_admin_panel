import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { REVIEWS } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import Pagination from "../../components/Pagination/Pagination";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of reviews per page

  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get current page number

  // Extract currentPage from query parameters
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get('page')) || 1;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(REVIEWS, {
          params: { page: initialPage, limit },
          withCredentials: true,
        });
        if (response.data.success) {
          setReviews(response.data.reviews);
          setCurrentPage(Number(response.data.currentPage));
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [initialPage]);

  const handleEditClick = (reviewId) => {
    navigate(`/forms/add-review/${reviewId}?page=${currentPage}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`/manage-reviews?page=${newPage}`);
    }
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${REVIEWS}/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setReviews(reviews.filter((review) => review._id !== id));
        } else {
          console.error("Error deleting review:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting review:", error);
      }
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
            {/* Table header start */}
            <div className="grid grid-cols-12 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11 ">
              <div className="col-span-1 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  NUMBER
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  NAME
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  MESSAGE
                </h5>
              </div>

              <div className="col-span-1 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  RATING
                </h5>
              </div>

              <div className="col-span-1 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  SHOW REVIEW
                </h5>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  CREATED AT
                </h5>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  UPDATED AT
                </h5>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                <Link to="/forms/add-review" className="text-xl md:text-2xl">
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* Table header end */}

            {/* Table body start */}
            <div className="bg-white dark:bg-boxdark">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {(currentPage - 1) * limit + (index + 1)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {review.name}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {review.message.length > 100
                        ? review.message.substring(0, 100) + " ..."
                        : review.message}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {review.numberOfStars}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {review.showReview ? "true" : "false"}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(review.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center justify-end space-x-2">
                    <button
                      className="text-black dark:text-white"
                      onClick={() => handleEditClick(review._id)}
                    >
                      <MdEditDocument className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(review._id)}
                    >
                      <MdDeleteForever className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Table body end */}
           
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
};

export default ManageReviews;
