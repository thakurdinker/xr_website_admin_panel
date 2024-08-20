import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { Link, useNavigate } from "react-router-dom";
import { IoAddCircle } from "react-icons/io5";
import { DEVELOPERS_URL } from "../../api/constants";
import { MdDeleteForever, MdEditDocument } from "react-icons/md";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function ManageDevelopers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [developers, setDevelopers] = useState([
    {
      logo_img_url: "",
      logo_img_url_alt: "",
      developer_name: "",
      developer_slug: "",
      description: "",
      heading: "",
    },
  ]);

  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditClick = (developerId) => {
    // Redirect to the AddProperty component in edit mode with the propertyId
    navigate(`/forms/add-developer/${developerId}`);
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this developer?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(DEVELOPERS_URL + `/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setDevelopers(developers.filter((developer) => developer.id !== id));
        } else {
          toast.error("Error deleting developer");
          console.error("Error deleting developer:", response.data.message);
        }
      } catch (error) {
        toast.error("Error deleting developer");
        console.error("Error deleting developer:", error);
      }
    }
  };

  const formatDate = (isoDate) => {
    const dateObject = new Date(isoDate);
    return dateObject.toLocaleString();
  };

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch(DEVELOPERS_URL);
        const data = await response.json();
        setDevelopers(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDevelopers();
  }, []);

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          <div>
            {/* table header start */}
            <div className="grid grid-cols-8 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
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
                <Link to="/forms/add-developer" className="text-xl md:text-2xl">
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {developers.map((developer, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {developer?.developer_name}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(developer?.createdAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {formatDate(developer?.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      className="text-black dark:text-white"
                      onClick={() => handleEditClick(developer.id)}
                    >
                      <MdEditDocument className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(developer.id)}
                    >
                      <MdDeleteForever className="h-6 w-6 md:h-8 md:w-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* table body end */}
          </div>
        </div>
      </div>
      <ToastContainer />
    </DefaultLayout>
  );
}
