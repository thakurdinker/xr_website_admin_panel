import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import { FETCH_ALL_AGENTS } from "../../api/constants";

function ManageAgents() {
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          FETCH_ALL_AGENTS + `?page=${currentPage}`
        );
        console.log(response.data.agents, "------");
        if (response.data.success) {
          setProperties(response.data.agents);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, [currentPage]);

  const handleEditClick = (propertyId) => {
    // Redirect to the AddProperty component in edit mode with the propertyId
    navigate(`/forms/add-agent/${propertyId}`);
  };

  const handleDeleteClick = async (id) => {
    console.log(id,"----");
    try {
      const response = await axios.delete(FETCH_ALL_AGENTS + `/${id}`);
      if (response.data.success) {
        setProperties(properties.filter((property) => property.id !== id));
      } else {
        console.error("Error deleting property:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
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
                  PROFILE PICURE
                </h5>
              </div>
              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  NAME
                </h5>
              </div>
              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  EMAIL
                </h5>
              </div>
              <div className="col-span-2 flex items-center">
                <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">
                  PHONE
                </h5>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <Link to="/forms/add-agent" className="text-xl md:text-2xl">
                  <IoAddCircle />
                </Link>
              </div>
            </div>
            {/* table header end */}

            {/* table body start */}
            <div className="bg-white dark:bg-boxdark">
              {properties.map((property, index) => (
                <div
                  key={index}
                  className="grid grid-cols-10 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      <img className="w-35 h-20 object-cover rounded-lg" src={property.profile_picture} alt="profile picture" />
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {property.name}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {property.email}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {property.phone}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      className="text-black dark:text-white"
                      onClick={() => handleEditClick(property._id)}
                    >
                      <MdEditDocument className="h-4 w-4 md:h-6 md:w-6" />
                    </button>
                    <button
                      className="text-red"
                      onClick={() => handleDeleteClick(property._id)}
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
    </DefaultLayout>
  );
}

export default ManageAgents;
