import React from "react";
import axios from "axios";
import { DELETE_IMAGE } from "../../api/constants";

const UploadReviewImages = ({ onImagesChange, initialImages = [], folder = "xr_media" }) => {
  const handleUploadClick = (event) => {
    event.preventDefault(); // Prevent form submission

    // Trigger Cloudinary upload widget
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkhns25jh", // Replace with your Cloudinary cloud name
        uploadPreset: "ml_default", // Replace with your Cloudinary upload preset
        folder: folder, // Optional: Change to your desired folder
        sources: ["local", "url", "camera"], // Sources for image selection
        multiple: false, // Allow multiple uploads
        cropping: false, // Enable cropping
        maxFileSize: 2000000, // Maximum file size in bytes (2MB)
        clientAllowedFormats: ["jpg", "png"], // Allowed file formats
      },
      function (error, result) {
        if (!error && result && result.event === "success") {
          const uploadedImage = {
            url: result.info.secure_url,
            public_id: result.info.public_id, // Add public_id for image management
          };
          onImagesChange([...initialImages, uploadedImage]); // Update parent component's state with the new image
        }
      }
    );
  };

  const handleImageDelete = async (publicId, index) => {
    try {
      const response = await axios.post(
        DELETE_IMAGE,
        { publicId },
        {
          withCredentials: true,
        }
      );

      if (response.data.isDeleted) {
        onImagesChange(initialImages.filter((_, i) => i !== index));
      }
    } catch (e) {
      console.error("Error deleting image:", e);
    }
  };

  return (
    <div>
      <button
        className="inline-flex w-[100%] items-center justify-center rounded-md border border-black px-10 py-2 text-center font-medium text-black hover:bg-black hover:bg-opacity-90 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black lg:px-8 xl:px-6"
        onClick={handleUploadClick}
      >
        Upload
      </button>
      <div className="mt-4 grid grid-cols-1">
        {initialImages.map((image, index) => (
          <div key={index} className="relative mb-4">
            <img
              src={image?.url}
              alt={`Uploaded ${index + 1}`}
              className="mb-2 h-20 w-20 object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleImageDelete(image.public_id, index);
              }}
              className="absolute right-0 top-0 text-2xl text-black dark:text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadReviewImages;
