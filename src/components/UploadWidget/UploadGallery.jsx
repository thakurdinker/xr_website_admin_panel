import axios from "axios";
import React, { useState, useEffect } from "react";
import { DELETE_IMAGE } from "../../api/constants";

const UploadGallery = ({ onImagesChange, initialImages = [] }) => {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    // Normalize initialImages — support plain strings, String objects (from Mongoose Mixed), and {url, alt} objects
    const normalized = initialImages.map((img) => {
      // Handle both string primitives and String objects (Mongoose Mixed returns String objects)
      if (typeof img === "string" || img instanceof String) {
        return { url: String(img), alt: "" };
      }
      // Handle {url, alt} objects — check if it has a 'url' property
      if (img && typeof img.url === "string") {
        return { url: img.url, alt: img.alt || "" };
      }
      // Fallback: might be a character-indexed object from String spread — reconstruct
      if (img && typeof img === "object" && "0" in img) {
        const chars = Object.keys(img).sort((a, b) => Number(a) - Number(b)).map(k => img[k]);
        return { url: chars.join(""), alt: "" };
      }
      return { url: "", alt: "" };
    });
    setGallery(normalized);
  }, [initialImages]);

  const handleUploadClick = (event) => {
    event.preventDefault();
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dkhns25jh",
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default",
        folder: import.meta.env.VITE_CLOUDINARY_FOLDER || "xr_media",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const newImage = { url: result.info.secure_url, alt: "" };
          const updated = [...gallery, newImage];
          setGallery(updated);
          onImagesChange(updated);
        }
      }
    );
  };

  const handleAltChange = (index, newAlt) => {
    const updated = gallery.map((img, i) =>
      i === index ? { ...img, alt: newAlt } : img
    );
    setGallery(updated);
    onImagesChange(updated);
  };

  const handleDeleteImage = async (url, index) => {
    try {
      const response = await axios.post(
        DELETE_IMAGE,
        { assetUrl: url },
        {
          withCredentials: true,
        }
      );

      if (response.data.isDeleted) {
        const updatedGallery = gallery.filter((_, i) => i !== index);
        setGallery(updatedGallery);
        onImagesChange(updatedGallery);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <button
        onClick={handleUploadClick}
        className="inline-flex w-[100%] items-center justify-center rounded-md border border-black px-10 py-2 text-center font-medium text-black hover:bg-black hover:bg-opacity-90 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black lg:px-8 xl:px-6"
      >
        Upload
      </button>
      <div className="mt-4 grid grid-cols-1">
        {gallery.map((image, index) => (
          <div key={index} className="relative mb-4">
            <img
              src={image.url}
              alt={image.alt || `Uploaded ${index + 1}`}
              className="mb-2 h-20 w-20 object-cover"
            />
            <input
              type="text"
              value={image.alt || ""}
              onChange={(e) => handleAltChange(index, e.target.value)}
              placeholder="Alt text (for SEO & accessibility)"
              className="mb-1 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteImage(image.url, index);
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

export default UploadGallery;
