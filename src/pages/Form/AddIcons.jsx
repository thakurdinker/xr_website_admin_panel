import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import { FETCH_ICONS } from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadAmenity from "../../components/UploadWidget/UploadAmenity";

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
      try {
        const res = await fetch(`${FETCH_ICONS}/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.success) {
          setFormData({
            icon_text: data.icon.icon_text,
            icon_url: data.icon.icon_url,
          });
        }
      } catch (error) {
        console.error("Error fetching icon:", error);
        toast.error("Failed to load icon data");
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
    try {
      const url = id ? `${FETCH_ICONS}/${id}` : FETCH_ICONS;
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message || (id ? "Icon updated!" : "Icon created!"));
        setTimeout(() => navigate("/manage-icons"), 1000);
      } else {
        toast.error(data?.message || "Failed to save icon");
      }
    } catch (error) {
      console.error("Error adding/updating icon:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      navigate(`/manage-icons?page=${currentPage}`);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[800px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              {id ? "Edit Icon" : "Add Icon"}
            </h2>
            <p className="mt-1 text-sm text-[#637381] dark:text-bodydark">
              {id ? "Update icon details" : "Upload a new amenity icon"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/manage-icons?page=${currentPage}`)}
            className="rounded border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Back to Icons
          </button>
        </div>

        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 p-6 md:grid-cols-12 lg:p-8"
          >
            {/* Section header */}
            <div className="md:col-span-12">
              <h3 className="text-base font-semibold text-black dark:text-white">Icon Details</h3>
              <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Icon name and image upload</p>
            </div>

            {/* Icon Description */}
            <div className="mb-5 md:col-span-12">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Icon Name / Description
              </label>
              <input
                type="text"
                name="icon_text"
                value={formData.icon_text}
                onChange={handleIconChange}
                placeholder="Enter icon name (e.g. Swimming Pool, Gym, Parking)"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Upload Amenity Icon */}
            <div className="mb-5 md:col-span-12">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Upload Icon
              </label>
              <UploadAmenity
                onImagesChange={handleImagesChange}
                initialImages={
                  formData.icon_url
                    ? [{ icon_url: formData.icon_url, icon_text: formData.icon_text }]
                    : []
                }
              />
            </div>

            {/* Icon URL (read-only preview) */}
            {formData.icon_url && (
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Icon URL
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.icon_url}
                    alt={formData.icon_text || "Icon preview"}
                    className="h-12 w-12 rounded border border-stroke object-contain p-1 dark:border-form-strokedark"
                  />
                  <input
                    type="text"
                    value={formData.icon_url}
                    readOnly
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-[#637381] outline-none dark:border-form-strokedark dark:bg-form-input dark:text-bodydark"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="md:col-span-12">
              <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
            </div>
            <div className="flex justify-end gap-3 md:col-span-12">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border border-stroke px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
              >
                {id ? "Save Changes" : "Create Icon"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </DefaultLayout>
  );
};

export default ContentForm;
