import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { REVIEWS } from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadReviewImages from "../../components/UploadWidget/UploadReviewImages"; // Adjust the import path if needed

const ContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    imageUrl: "", // This will be updated with the Cloudinary URL
    numberOfStars: 5,
    showReview: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'showReview' ? (value === 'true') : value,
    });
  };

  useEffect(() => {
    async function fetchReview() {
      if (id) {
        let response = await axios.get(`${REVIEWS}/${id}`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setFormData({
            name: response.data.review.name,
            message: response.data.review.message,
            imageUrl: response.data.review.imageUrl,
            numberOfStars: response.data.review.numberOfStars,
            showReview: response.data.review.showReview,
          });
        }
      }
    }

    fetchReview();
  }, [id]);

  const handleImageChange = (images) => {
    // Update the formData with the URL of the uploaded image
    setFormData({
      ...formData,
      imageUrl: images.length > 0 ? images[0].url : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;

    try {
      if (id) {
        response = await axios.put(`${REVIEWS}/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(REVIEWS, formData, {
          withCredentials: true,
        });
      }

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/manage-reviews");
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error adding/updating review:", error);
      toast.error("An error occurred. Please try again.");
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
                <div className="mb-5 md:col-span-5">
                  <label className="block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                <div className="mb-5 md:col-span-5">
                  <label className="block">Message</label>
                  <input
                    type="text"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                
                {/* Cloudinary Image Upload */}
                <div className="mb-5 md:col-span-5">
                  <label className="block">Image Upload</label>
                  <UploadReviewImages 
                    onImagesChange={handleImageChange} 
                    initialImages={formData.imageUrl ? [{ url: formData.imageUrl }] : []}
                  />
                </div>

                <div className="mb-5 md:col-span-5">
                  <label className="block">Number Of Stars</label>
                  <input
                    type="text"
                    name="numberOfStars"
                    value={formData.numberOfStars}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Show Review */}
                <div className="mb-5 md:col-span-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Show Review
                  </label>
                  <select
                    name="showReview"
                    value={formData.showReview}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
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
                    onClick={() => navigate("/manage-reviews")}
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
