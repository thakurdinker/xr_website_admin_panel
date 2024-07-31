import React from "react";

const UploadDeveloperImage = ({ onImagesChange, initialImages = [] }) => {
  const handleUploadClick = (event) => {
    event.preventDefault();
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkhns25jh",
        uploadPreset: "ml_default",
        folder: "xr_media",
      },
      function (error, result) {
        if (!error && result && result.event === "success") {
          const uploadedImage = {
            url: result.info.secure_url,
          };
          onImagesChange([...initialImages, uploadedImage]);
        }
      }
    );
  };

  return (
    <div>
      <button
        onClick={handleUploadClick}
        className="inline-flex w-[100%] items-center justify-center rounded-md border border-black px-10 py-2 text-center font-medium text-black hover:bg-black hover:bg-opacity-90 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black lg:px-8 xl:px-6"
      >
        Upload Images
      </button>
      <div className="mt-4 grid grid-cols-1">
        {initialImages.map((image, index) => (
          <div key={index} className="relative mb-4">
            <img
              src={image.url}
              alt={`Uploaded Image ${index + 1}`}
              className="mb-2 h-20 w-20 object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                onImagesChange(initialImages.filter((_, i) => i !== index));
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

export default UploadDeveloperImage;
