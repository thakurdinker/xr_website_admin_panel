// import React, { useCallback, useEffect, useState } from "react";
// import DefaultLayout from "../../layout/DefaultLayout";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Select from "react-select";
// import { FETCH_ALL_ICONS, PROJECT_OF_THE_MONTH } from "../../api/constants";

// const ProjectOfTheMonth = () => {
//   const navigate = useNavigate();

//   const [amenitiesOptions, setAmenitiesOptions] = useState([]);
//   const [selectedAmenities, setSelectedAmenities] = useState([]);
//   const initialFormData = {
//     videoUrl: "",
//     projectName: "",
//     description: "",
//     selectedIcon: null,
//     amenities: {
//       description: "",
//       icons: [],
//     },
//     headings: [
//       { heading: "", description: "" },
//       { heading: "", description: "" },
//       { heading: "", description: "" },
//       { heading: "", description: "" },
//     ],
//   };

//   const [formData, setFormData] = useState(initialFormData);

//   useEffect(() => {
//     const fetchProjectOfTheMonth = async () => {
//       try {
//         const response = await axios.get(PROJECT_OF_THE_MONTH, {
//           withCredentials: true,
//         });
//         if (response?.data?.success) {
//           setFormData(response?.data?.project); // Populate form with data from the backend
//           setSelectedAmenities(
//             response?.data?.project?.amenities?.icons?.map((icon) => ({
//               value: icon,
//               label:
//                 amenitiesOptions?.find((option) => option?.value === icon)
//                   ?.label || icon,
//             }))
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching project of the month:", error);
//       }
//     };

//     const fetchAmenities = async () => {
//       const response = await axios.get(FETCH_ALL_ICONS);
//       const amenities = response.data.icons.map((amenity) => ({
//         value: amenity?.icon_url,
//         label: amenity?.icon_text,
//         id: amenity?.id,
//       }));
//       setAmenitiesOptions(amenities);
//     };

//     fetchAmenities();
//     fetchProjectOfTheMonth(); // Fetch existing project data
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const getAmenitiesValue = useCallback(() => {
//     let amenities = [];
//     for (let i = 0; i < formData?.amenities?.icons?.length; i++) {
//       amenities.push(
//         ...amenitiesOptions.filter(
//           (icon) => icon.id === formData.amenities.icons[i]
//         )
//       );
//     }
//     return amenities;
//   }, [formData.amenities, amenitiesOptions]);

//   const handleAmenitiesChange = (selectedOptions) => {
//     setSelectedAmenities(selectedOptions);
//     setFormData((prev) => {
//       let tempAmenities = {
//         description: prev?.amenities?.description,
//         icons: selectedOptions?.map((item) => item.id),
//       };
//       prev.amenities = tempAmenities;
//       return prev;
//     });
//   };

//   const handleHeadingChange = (e, index) => {
//     const { name, value } = e.target;
//     const updatedHeadings = formData.headings.map((item, idx) =>
//       idx === index ? { ...item, [name]: value } : item
//     );
//     setFormData({
//       ...formData,
//       headings: updatedHeadings,
//     });
//   };

//   const handleIconChange = (selectedOption) => {
//     setFormData({
//       ...formData,
//       selectedIcon: selectedOption,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(PROJECT_OF_THE_MONTH, formData, {
//         withCredentials: true,
//       });
//       if (response?.data?.success) {
//         toast.success(response?.data?.message);
//         navigate(`/project-of-the-month`);
//       } else {
//         toast.error(response?.data?.message);
//       }
//     } catch (error) {
//       console.error("Error adding/updating project:", error);
//       toast.error("An error occurred. Please try again.");
//     }
//   };

//   const handleCancel = () => {
//     const confirmCancel = window.confirm(
//       "Are you sure you want to cancel? Unsaved changes will be lost."
//     );
//     if (confirmCancel) {
//       resetForm();
//     }
//   };

//   // Reset form function
//   const resetForm = () => {
//     setFormData(initialFormData);
//     setSelectedAmenities([]);
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
//                 {/* Video Url */}
//                 <div className="mb-5 md:col-span-12">
//                   <label className="block">Video Url</label>
//                   <input
//                     type="text"
//                     name="videoUrl"
//                     value={formData.videoUrl}
//                     onChange={handleChange}
//                     className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                   />
//                 </div>
//                 {/* Project Name */}
//                 <div className="mb-5 md:col-span-6">
//                   <label className="block">Project Name</label>
//                   <input
//                     type="text"
//                     name="projectName"
//                     value={formData.projectName}
//                     onChange={handleChange}
//                     className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="mb-5 md:col-span-6">
//                   <label className="block">Description</label>
//                   <input
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                   />
//                 </div>

//                 {/* Amenities  */}
//                 <div className="mb-5 md:col-span-12">
//                   <label className="block">Amenities</label>
//                   <Select
//                     isMulti
//                     name="amenities"
//                     options={amenitiesOptions}
//                     className="basic-multi-select"
//                     classNamePrefix="select"
//                     value={getAmenitiesValue()}
//                     onChange={handleAmenitiesChange}
//                     placeholder="Select amenities"
//                   />
//                 </div>

//                 {/* Headings and Descriptions */}
//                 {formData.headings.map((item, index) => (
//                   <React.Fragment key={index}>
//                     <div className="mb-5 md:col-span-6">
//                       <label className="block">Heading {index + 1}</label>
//                       <input
//                         type="text"
//                         name="heading"
//                         value={item.heading}
//                         onChange={(e) => handleHeadingChange(e, index)}
//                         className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                       />
//                     </div>
//                     <div className="mb-5 md:col-span-6">
//                       <label className="block">Description {index + 1}</label>
//                       <input
//                         name="description"
//                         value={item.description}
//                         onChange={(e) => handleHeadingChange(e, index)}
//                         className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
//                       />
//                     </div>
//                   </React.Fragment>
//                 ))}

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

// export default ProjectOfTheMonth;









import React, { useCallback, useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { FETCH_ALL_ICONS, PROJECT_OF_THE_MONTH } from "../../api/constants";
import UploadGallery from "../../components/UploadWidget/UploadGallery"; // Import the component

const ProjectOfTheMonth = () => {
  const navigate = useNavigate();

  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const initialFormData = {
    videoUrl: "",
    projectName: "",
    description: "",
    selectedIcon: null,
    amenities: {
      description: "",
      icons: [],
    },
    headings: [
      { heading: "", description: "" },
      { heading: "", description: "" },
      { heading: "", description: "" },
      { heading: "", description: "" },
    ],
    images: [], // Add images to the initial form data
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchProjectOfTheMonth = async () => {
      try {
        const response = await axios.get(PROJECT_OF_THE_MONTH, {
          withCredentials: true,
        });
        if (response?.data?.success) {
          setFormData(response?.data?.project); // Populate form with data from the backend
          setSelectedAmenities(
            response?.data?.project?.amenities?.icons?.map((icon) => ({
              value: icon,
              label:
                amenitiesOptions?.find((option) => option?.value === icon)
                  ?.label || icon,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching project of the month:", error);
      }
    };

    const fetchAmenities = async () => {
      const response = await axios.get(FETCH_ALL_ICONS);
      const amenities = response.data.icons.map((amenity) => ({
        value: amenity?.icon_url,
        label: amenity?.icon_text,
        id: amenity?.id,
      }));
      setAmenitiesOptions(amenities);
    };

    fetchAmenities();
    fetchProjectOfTheMonth(); // Fetch existing project data
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getAmenitiesValue = useCallback(() => {
    let amenities = [];
    for (let i = 0; i < formData?.amenities?.icons?.length; i++) {
      amenities.push(
        ...amenitiesOptions.filter(
          (icon) => icon.id === formData.amenities.icons[i]
        )
      );
    }
    return amenities;
  }, [formData.amenities, amenitiesOptions]);

  const handleAmenitiesChange = (selectedOptions) => {
    setSelectedAmenities(selectedOptions);
    setFormData((prev) => {
      let tempAmenities = {
        description: prev?.amenities?.description,
        icons: selectedOptions?.map((item) => item.id),
      };
      prev.amenities = tempAmenities;
      return prev;
    });
  };

  const handleHeadingChange = (e, index) => {
    const { name, value } = e.target;
    const updatedHeadings = formData.headings.map((item, idx) =>
      idx === index ? { ...item, [name]: value } : item
    );
    setFormData({
      ...formData,
      headings: updatedHeadings,
    });
  };

  const handleIconChange = (selectedOption) => {
    setFormData({
      ...formData,
      selectedIcon: selectedOption,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(PROJECT_OF_THE_MONTH, formData, {
        withCredentials: true,
      });
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate(`/project-of-the-month`);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error adding/updating project:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      resetForm();
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedAmenities([]);
  };

  // Handle image upload
  const handleImagesChange = (images) => {
    setFormData({
      ...formData,
      images,
    });
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
                {/* Video Url */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Video Url</label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                {/* Project Name */}
                <div className="mb-5 md:col-span-6">
                  <label className="block">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Description */}
                <div className="mb-5 md:col-span-6">
                  <label className="block">Description</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Amenities  */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Amenities</label>
                  <Select
                    isMulti
                    name="amenities"
                    options={amenitiesOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={getAmenitiesValue()}
                    onChange={handleAmenitiesChange}
                    placeholder="Select amenities"
                  />
                </div>

                {/* Headings and Descriptions */}
                {formData.headings.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="mb-5 md:col-span-6">
                      <label className="block">Heading {index + 1}</label>
                      <input
                        type="text"
                        name="heading"
                        value={item.heading}
                        onChange={(e) => handleHeadingChange(e, index)}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div className="mb-5 md:col-span-6">
                      <label className="block">Description {index + 1}</label>
                      <input
                        name="description"
                        value={item.description}
                        onChange={(e) => handleHeadingChange(e, index)}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      />
                    </div>
                  </React.Fragment>
                ))}

                {/* Upload Images */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Upload Gallery Images</label>
                  <UploadGallery
                    onImagesChange={handleImagesChange}
                    initialImages={formData.images}
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

export default ProjectOfTheMonth;

