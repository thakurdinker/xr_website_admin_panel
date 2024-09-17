import React from 'react';

const UploadAmenity = ({ onImagesChange, initialImages = [] }) => {
  const handleUploadClick = (event) => {
    event.preventDefault();
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkhns25jh", // Replace with your Cloudinary cloud name
        uploadPreset: "ml_default", // Replace with your Cloudinary upload preset
        folder: "xr_media", // Optional: Change to your desired folder
      },
      function (error, result) {
        if (!error && result && result.event === "success") {
          const uploadedImage = {
            icon_url: result.info.secure_url,
          };
          onImagesChange([uploadedImage]);
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
        Upload Amenity Icon
      </button>
      <div className="mt-4 grid grid-cols-1">
        {initialImages.map((image, index) => (
          <div key={index} className="relative mb-4">
            <img
              src={image.icon_url}
              alt={`Uploaded Amenity ${index + 1}`}
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

export default UploadAmenity;
