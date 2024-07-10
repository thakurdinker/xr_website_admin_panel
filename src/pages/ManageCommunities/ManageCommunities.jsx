import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_ALL_COMMUNITIES } from "../../api/constants";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { MdDeleteForever } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";


function ManageCommunities() {
    const [communities, setCommunities] = useState([]);
  
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchCommunities = async () => {
        try {
          const response = await axios.get(
            FETCH_ALL_COMMUNITIES
          );
  
          if (response.data.success) {
            setCommunities(response.data.communities);
          }
        } catch (error) {
          console.error("Error fetching properties:", error);
        }
      };
  
      fetchCommunities();
    }, []);
  
    const handleEditClick = (communityId) => {
      // Redirect to the AddProperty component in edit mode with the propertyId
      navigate(`/forms/add-community/${communityId}`);
    };
  
    const handleDeleteClick = async (id) => {
      try {
        const response = await axios.delete(FETCH_ALL_COMMUNITIES+`/${id}`);
        if (response.data.success) {
          setCommunities(communities.filter(community => community.id !== id));
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
              <div className="grid grid-cols-8 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
                <div className="col-span-2 flex items-center">
                  <h5 className="text-xs md:text-base font-medium text-[#637381] dark:text-bodydark">
                    Name 
                  </h5>
                </div>
  
                <div className="col-span-2 flex items-center">
                  <h5 className="text-xs md:text-base font-medium text-[#637381] dark:text-bodydark">
                    CREATED AT
                  </h5>
                </div>
  
                <div className="col-span-2 flex items-center">
                  <h5 className="text-xs md:text-base font-medium text-[#637381] dark:text-bodydark">
                    UPDATED AT
                  </h5>
                </div>
                
                <div className="col-span-2 flex items-center justify-end">
                  <Link
                    to="/forms/add-community"
                    className="text-xl md:text-2xl"
                  >
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
                    className="grid grid-cols-8 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                  >
                    <div className="col-span-2 flex items-center">
                      <p className="text-[#637381] dark:text-bodydark text-xs md:text-base">
                        {community.name}
                      </p>
                    </div>
  
                    <div className="col-span-2 flex items-center">
                      <p className="text-[#637381] dark:text-bodydark text-xs md:text-base">
                      {formatDate(community.createdAt)}
                      </p>
                    </div>
  
                    <div className="col-span-2 flex items-center">
                      <p className="text-[#637381] dark:text-bodydark text-xs md:text-base">
                      {formatDate(community.updatedAt)}
                      </p>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <button className="text-black dark:text-white" onClick={() => handleEditClick(community.id)}><MdEditDocument className="h-4 w-4 md:h-6 md:w-6"/></button>
                      <button className="text-red" onClick={() => handleDeleteClick(community.id)}><MdDeleteForever className="h-6 w-6 md:h-8 md:w-8"/></button>
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

export default ManageCommunities