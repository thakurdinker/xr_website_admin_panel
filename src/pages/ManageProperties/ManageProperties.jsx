import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ALL_PROPERTIES } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';


const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          FETCH_ALL_PROPERTIES + `?page=${currentPage}`
        );

        if (response.data.success) {
          setProperties(response.data.properties);
          setTotalPages(response.data.totalPages);
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, [currentPage]);

  const handleEditClick = (propertyId) => {
    // Redirect to the AddProperty component in edit mode with the propertyId
    navigate(`/forms/add-property/${propertyId}`);
  };

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1170px]">
            {/* table header start */}
            <div className="grid grid-cols-10 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
              <div className="col-span-4 flex items-center">
                <h5 className="font-medium text-[#637381] dark:text-bodydark">
                  NAME
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="font-medium text-[#637381] dark:text-bodydark">
                  CREATED AT
                </h5>
              </div>

              <div className="col-span-2 flex items-center">
                <h5 className="font-medium text-[#637381] dark:text-bodydark">
                  UPDATED AT
                </h5>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <Link
                  to="/forms/add-property"
                  className="inline-flex items-center justify-center rounded-md border border-black px-10 py-2 text-center font-medium text-black hover:bg-opacity-90 lg:px-8 xl:px-6 hover:text-white hover:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
                >
                  ADD PROPERTY
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
                  <div className="col-span-4 flex items-center">
                    <p className="text-[#637381] dark:text-bodydark">
                      {property.community_name}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-[#637381] dark:text-bodydark">
                      {property.createdAt}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <p className="text-[#637381] dark:text-bodydark">
                      {property.updatedAt}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <button className="text-primary" onClick={() => handleEditClick(property.id)}>Edit</button>
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
};

export default ManageProperties;
