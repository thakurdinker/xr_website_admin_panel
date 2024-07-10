import React, { useState, useEffect } from "react";

const UploadGallery = ({ onImagesChange, initialImages = [] }) => {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    // Convert initialImages to gallery format (array of URLs)
    setGallery(initialImages);
  }, [initialImages]);

  const handleUploadClick = (event) => {
    event.preventDefault();
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkhns25jh",
        uploadPreset: "ml_default",
        folder: "xr_media",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const newImageUrl = result.info.secure_url;
          setGallery([...gallery, newImageUrl]);
          onImagesChange([...gallery, newImageUrl]);
        }
      }
    );
  };

  const handleDeleteImage = (url) => {
    const updatedGallery = gallery.filter((imgUrl) => imgUrl !== url);
    setGallery(updatedGallery);
    onImagesChange(updatedGallery);
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
              src={image}
              alt={`Uploaded ${index + 1}`}
              className="mb-2 h-20 w-20 object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteImage(image);
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
