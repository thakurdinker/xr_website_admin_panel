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
            icon_text: result.info.icon_text, // If needed from Cloudinary
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
            <textarea
              value={image.icon_text}
              onChange={(e) => {
                const updatedImages = [...initialImages];
                updatedImages[index].icon_text = e.target.value;
                onImagesChange(updatedImages);
              }}
              placeholder="Enter description"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              
            ></textarea>
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
