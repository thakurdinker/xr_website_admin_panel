// import React, { useEffect, useState } from "react";
// import DefaultLayout from "../../layout/DefaultLayout";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import { FETCH_ALL_ICONS, FETCH_ICONS } from "../../api/constants";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ContentForm = () => {
//   const query = new URLSearchParams(location.search);
//   const currentPage = parseInt(query.get("page")) || 1;
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     icon_text: "",
//     icon_url: "",
//   });

//   const handleIconChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   useEffect(() => {
//     async function fetchIcon() {
//       let response = await axios.get(`${FETCH_ICONS}/${id}`, formData, {
//         withCredentials: true,
//       }); 

//       if (response.data.success) {
//         setFormData({
//           icon_text: response.data.icon.icon_text,
//           icon_url: response.data.icon.icon_url,
//         });
//       }
//     }

//     fetchIcon();
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     let response;

//     try {
//       if (id) {
//         response = await axios.put(`${FETCH_ICONS}/${id}`, formData, {
//           withCredentials: true,
//         });
//       } else {
//         response = await axios.post(FETCH_ALL_ICONS, formData, {
//           withCredentials: true,
//         });
//       }

//       if (response?.data?.success) {
//         toast.success(response?.data?.message);
//         navigate("/manage-icons");
//       } else {
//         toast.error(response?.data?.message);
//       }
//     } catch (error) {
//       console.error("Error adding/updating icons:", error);
//     }
//   };

//   const handleCancel = () => {
//     const confirmCancel = window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.");
//     if (confirmCancel) {
//       navigate(`/manage-icons?page=${currentPage}`);
//     }
//   };


//   return (
//     <DefaultLayout>
//       <div className="flex justify-center">
//         <div className="grid w-[95vw] lg:w-[60vw]">
//           <div className="col-span-full">
//             <div className="rounded-lg border bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
//               <form
//                 onSubmit={handleSubmit}
//                 className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-12"
//               >
//                 <div className="mb-5 md:col-span-5">
//                   <label className="block">Description</label>
//                   <input
//                     type="text"
//                     name="icon_text"
//                     value={formData.icon_text}
//                     onChange={handleIconChange}
//                     className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                   />
//                 </div>
//                 <div className="mb-5 md:col-span-5">
//                   <label className="block">Url</label>
//                   <input
//                     type="text"
//                     name="icon_url"
//                     value={formData.icon_url}
//                     onChange={handleIconChange}
//                     className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                   />
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-end gap-4 md:col-span-12">
//                   <button
//                     type="submit"
//                     className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
//                   >
//                     Save
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleCancel}
//                     className="border-gray-300 hover:bg-gray-100 inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 font-medium text-black transition"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer />
//     </DefaultLayout>
//   );
// };

// export default ContentForm;






import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FETCH_ALL_ICONS, FETCH_ICONS } from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadAmenity from "../../components/UploadWidget/UploadAmenity"; // Adjust the path as needed

const ContentForm = () => {
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get("page")) || 1;
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    icon_text: "",
    icon_url: "",
  });

  const handleIconChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    async function fetchIcon() {
      let response = await axios.get(`${FETCH_ICONS}/${id}`, {
        withCredentials: true,
      }); 

      if (response.data.success) {
        setFormData({
          icon_text: response.data.icon.icon_text,
          icon_url: response.data.icon.icon_url,
        });
      }
    }

    if (id) {
      fetchIcon();
    }
  }, [id]);

  const handleImagesChange = (images) => {
    if (images.length > 0) {
      setFormData({
        ...formData,
        icon_url: images[0].icon_url,
        icon_text: images[0].icon_text,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;

    try {
      if (id) {
        response = await axios.put(`${FETCH_ICONS}/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(FETCH_ICONS, formData, {
          withCredentials: true,
        });
      }

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/manage-icons");
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error adding/updating icons:", error);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.");
    if (confirmCancel) {
      navigate(`/manage-icons?page=${currentPage}`);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-center">
        <div className="grid w-[95vw] lg:w-[60vw]">
          <div className="col-span-full">
            <div className="rounded-lg border bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-12"
              >
                {/* Icon Description */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Description</label>
                  <input
                    type="text"
                    name="icon_text"
                    value={formData.icon_text}
                    onChange={handleIconChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Upload Amenity Icon */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Upload Icon</label>
                  <UploadAmenity 
                    onImagesChange={handleImagesChange}
                    initialImages={formData.icon_url ? [{ icon_url: formData.icon_url, icon_text: formData.icon_text }] : []}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 md:col-span-12">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-100 inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 font-medium text-black transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </DefaultLayout>
  );
};

export default ContentForm;

