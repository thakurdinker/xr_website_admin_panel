import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DEVELOPERS_URL } from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadImages from "../../components/UploadWidget/UploadImages";
import UploadDeveloperImage from "../../components/UploadWidget/UploadDeveloperImage";

export default function AddDeveloper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    logo_img_url: "",
    logo_img_url_alt: "",
    developer_name: "",
    developer_slug: "",
    description: "",
    heading: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (id) {
        response = await axios.put(`${DEVELOPERS_URL}/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(DEVELOPERS_URL, formData, {
          withCredentials: true,
        });
      }

      if (response?.data?.success) {
        toast.success(response?.data?.message);
        navigate("/manage-developers");
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error adding/updating Developer:", error);
    }
  };

  const handleImagesChange = (updatedImages) => {
    setFormData((prev) => ({
      ...prev,
      logo_img_url: updatedImages[0]?.url || "",
    }));
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(DEVELOPERS_URL + `/${id}`, {
          withCredentials: true,
        });
        setFormData(response.data.data);
      } catch (error) {
        console.error("Error fetching Developer data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
  }, [id]);

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
                  <label className="block">Developer Name</label>
                  <input
                    type="text"
                    name="developer_name"
                    value={formData.developer_name}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                <div className="mb-5 md:col-span-5">
                  <label className="block">Developer Name Slug</label>
                  <input
                    type="text"
                    name="developer_slug"
                    value={formData.developer_slug}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                <div className="mb-5 md:col-span-5">
                  <label className="block">Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
                <div className="mb-5 md:col-span-5">
                  <label className="block">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Images */}
                <div className="mb-5 md:col-span-12">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Images
                  </label>
                  {/* Cloudinary Upload Widget */}
                  <UploadDeveloperImage
                    onImagesChange={handleImagesChange}
                    initialImages={
                      formData.logo_img_url
                        ? [{ url: formData.logo_img_url }]
                        : []
                    }
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
                    onClick={() => navigate("/manage-developers")}
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
}
