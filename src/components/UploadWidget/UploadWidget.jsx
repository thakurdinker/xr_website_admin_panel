import { useEffect, useRef, useState } from "react";

const UploadWidget = ({ isGallery, onImagesChange, initialImages = [], isProfilePic }) => {
  const widgetRef = useRef();
  const [images, setImages] = useState(initialImages);

  useEffect(() => {
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "dkhns25jh",
        uploadPreset: "ml_default",
        folder: "xr_media",
      },
      function (error, result) {
        if (!error && result && result.event === "success") {
          const uploadedImage = {
            url: result.info.secure_url,
            description: "",
          };
          setImages((prevImages) => [...prevImages, uploadedImage]);
          onImagesChange([...images, uploadedImage]); // Update parent component's state
        }
      }
    );
  }, [onImagesChange]);

  useEffect(() => {
    // Update images when initialImages prop changes
    setImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    // Notify parent component of initial images
    onImagesChange(images);
  }, []);

  const handleDescriptionChange = (index, event) => {
    const updatedImages = images.map((image, i) =>
      i === index ? { ...image, description: event.target.value || "" } : image
    );
    setImages(updatedImages);
    onImagesChange(updatedImages); // Update parent component's state
  };

  const handleDelete = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages); // Update parent component's state
  };

  const handleUploadClick = (event) => {
    event.preventDefault(); // Prevent form submission
    widgetRef.current.open();
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
        {images.map((image, index) => (
          <div key={index} className="relative mb-4">
            <img 
              src={image.url}
              alt={`Uploaded ${index + 1}`}
              className="mb-2 h-20 w-20"
            />
            {!isGallery &&(<textarea
              name="description"
              value={image.description}
              onChange={(event) => handleDescriptionChange(index, event)}
              placeholder="Enter image description"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            ></textarea>)}
            
            <button
              onClick={() => handleDelete(index)}
              className="absolute right-0 top-0  text-2xl text-black dark:text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadWidget;
