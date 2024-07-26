import axios from "axios";
import React from "react";
import { useLocation } from "react-router-dom";
import { DELETE_IMAGE } from "../../api/constants";

const UploadImages = ({ onImagesChange, initialImages = [], newsAndBlog }) => {
  const { pathname } = useLocation();
  const handleUploadClick = (event) => {
    event.preventDefault(); // Prevent form submission
    // Trigger Cloudinary upload widget
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkhns25jh", // Replace with your Cloudinary cloud name
        uploadPreset: "ml_default", // Replace with your Cloudinary upload preset
        folder: "xr_media", // Optional: Change to your desired folder
      },
      function (error, result) {
        console.log(initialImages,"99999999999");
        if (!error && result && result.event === "success") {
          const uploadedImage = {
            url: result.info.secure_url,
          };
          onImagesChange([...initialImages, uploadedImage]); // Update parent component's state
        }
      }
    );
  };

  const handleImageDelete = async (assetUrl, initialImages, index) => {
    try {
      const response = await axios.post(
        DELETE_IMAGE,
        { assetUrl },
        {
          withCredentials: true,
        }
      );

      if (response.data.isDeleted) {
        onImagesChange(initialImages.filter((_, i) => i !== index));
      }
    } catch (e) {
      console.error(e);
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
            {!pathname.includes("/forms/add-agent") && (
              <>
                {newsAndBlog ? (
                  <input
                    type="text"
                    name="imageUrl"
                    value={image?.url}
                    readOnly
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    
                  />
                ) : (
                  <>
                    <textarea
                      name="description"
                      value={image?.description}
                      onChange={(event) =>
                        onImagesChange(
                          initialImages.map((img, i) =>
                            i === index
                              ? {
                                  ...img,
                                  description: event.target.value || "",
                                }
                              : img
                          )
                        )
                      }
                      placeholder="Enter image description"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      
                    ></textarea>
                    <textarea
                      name="heading"
                      value={image?.heading}
                      onChange={(event) =>
                        onImagesChange(
                          initialImages.map((img, i) =>
                            i === index
                              ? { ...img, heading: event.target.value || "" }
                              : img
                          )
                        )
                      }
                      placeholder="Enter image heading"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      
                    ></textarea>
                  </>
                )}
              </>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();

                handleImageDelete(image.url, initialImages, index);
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

export default UploadImages;
