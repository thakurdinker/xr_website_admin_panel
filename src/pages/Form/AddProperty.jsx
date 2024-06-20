import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import UploadWidget from "../../components/UploadWidget/UploadWidget";
import { useNavigate, useParams } from "react-router-dom";

const initialPropertyData = {
  property_name: "",
  description: "",
  price: "",
  type: [],
  location: {
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: {
      lat: "",
      lng: "",
    },
  },
  features: {
    bedrooms: "",
    bathrooms: "",
    area: "",
    year_built: "",
    amenities: "",
  },
  images: [],
  gallery: [],
  status: [],
  community_name: "",
  community_name_slug: "",
  community_features: {
    project_overview: "",
    nearby_facilities: [],
    transportation: [],
  },
  show_property: false,
  featured: false,
};

const AddProperty = () => {
  const { id } = useParams();

  const updatePropertyData = (propertyData, apiData) => {
    const updatedData = { ...propertyData };

    Object.keys(propertyData).forEach((key) => {
      if (key in apiData) {
        if (
          typeof propertyData[key] === "object" &&
          !Array.isArray(propertyData[key])
        ) {
          updatedData[key] = updatePropertyData(
            propertyData[key],
            apiData[key]
          );
        } else {
          updatedData[key] = apiData[key];
        }
      }
    });

    return updatedData;
  };

  useEffect(() => {
    // Fetch property data based on the ID from your API
    const fetchPropertyData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3333/properties/${id}`
        );
        setPropertyData((prev) =>
          updatePropertyData(prev, response.data.property)
        );
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };

    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (updatedImages) => {
    // Create a new array with only the url and description properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      description: image.description || "", // Add this line to handle missing description
    }));

    setPropertyData((prev) => ({
      // ...prev,
      images: imagesToSend,
    }));
  };

  const handleGalleryChange = (updatedGallery) => {
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      description: image.description || "", // Add this line to handle missing description
    }));
    setPropertyData((prev) => ({
      // ...prev,
      gallery: imagesToSend,
    }));
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
  };
  const handleDoubleNestedChange = (e, parentKey, childKey, subChildKey) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: {
          ...prev[parentKey][childKey],
          [subChildKey]: value,
        },
      },
    }));
  };
  const convertStringToArray = (field, delimiter = ",") => {
    if (typeof field === "string") {
      return field.split(delimiter).map((item) => item.trim());
    }
    return field;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Convert string fields to arrays
    propertyData.type = convertStringToArray(propertyData.type);
    propertyData.status = convertStringToArray(propertyData.status);
    propertyData.features.amenities = convertStringToArray(propertyData.features.amenities);
    propertyData.community_features.nearby_facilities = convertStringToArray(propertyData.community_features.nearby_facilities);
    propertyData.community_features.transportation = convertStringToArray(propertyData.community_features.transportation);
  
    // Make API request using axios
    try {
      if (id) {
        // Update existing property
        const response = await axios.put(
          `http://localhost:3333/properties/${id}`,
          propertyData
        );
        console.log(response.data, "id");
      } else {
        // Create new property
        const response = await axios.post(
          "http://localhost:3333/properties",
          propertyData
        );
        console.log(propertyData, "no id");
        console.log(response.data, "no id");
      }
      // Reset form after successful submission
      // setPropertyData(initialPropertyData);
    } catch (error) {
      console.error("Error adding/updating property:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="grid w-[95vw] lg:w-[60vw]">
        <div className="col-span-full">
          <div className="rounded-lg border bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-12"
            >
              {/* Property Name */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Property Name
                </label>
                <input
                  type="text"
                  name="property_name"
                  value={propertyData?.property_name}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Status */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Status
                </label>
                <input
                  type="text"
                  name="status"
                  value={propertyData?.status}
                  onChange={handleChange}
                  placeholder="Enter status"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Type */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={propertyData?.type}
                  onChange={handleChange}
                  placeholder="Enter property type"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Description */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>
                <textarea
                  name="description"
                  value={propertyData?.description}
                  onChange={handleChange}
                  placeholder="Enter property description"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                ></textarea>
              </div>

              {/* Address */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={propertyData?.location?.address}
                  onChange={(e) => handleNestedChange(e, "location", "address")}
                  placeholder="Enter address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* City */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={propertyData?.location?.city}
                  onChange={(e) => handleNestedChange(e, "location", "city")}
                  placeholder="Enter city"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* State */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={propertyData?.location?.state}
                  onChange={(e) => handleNestedChange(e, "location", "state")}
                  placeholder="Enter state"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Country */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={propertyData?.location?.country}
                  onChange={(e) => handleNestedChange(e, "location", "country")}
                  placeholder="Enter country"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Latitude */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Latitude
                </label>
                <input
                  type="text"
                  name="lat"
                  value={propertyData?.location?.coordinates?.lat}
                  onChange={(e) => {
                    console.log(e.target.value);
                    handleDoubleNestedChange(
                      e,
                      "location",
                      "coordinates",
                      "lat"
                    );
                  }}
                  placeholder="Enter latitude"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Longitude */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Longitude
                </label>
                <input
                  type="text"
                  name="lng"
                  value={propertyData?.location?.coordinates?.lng}
                  onChange={(e) =>
                    handleDoubleNestedChange(
                      e,
                      "location",
                      "coordinates",
                      "lng"
                    )
                  }
                  placeholder="Enter longitude"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Bedrooms */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Bedrooms
                </label>
                <input
                  type="text"
                  name="bedrooms"
                  value={propertyData?.features?.bedrooms}
                  onChange={(e) =>
                    handleNestedChange(e, "features", "bedrooms")
                  }
                  placeholder="Enter number of bedrooms"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Bathrooms */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Bathrooms
                </label>
                <input
                  type="text"
                  name="bathrooms"
                  value={propertyData?.features?.bathrooms}
                  onChange={(e) =>
                    handleNestedChange(e, "features", "bathrooms")
                  }
                  placeholder="Enter number of bathrooms"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Price */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={propertyData?.price}
                  onChange={handleChange}
                  placeholder="Enter property price"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Year Built */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Year Built
                </label>
                <input
                  type="text"
                  name="year_built"
                  value={propertyData?.features?.year_built}
                  onChange={(e) =>
                    handleNestedChange(e, "features", "year_built")
                  }
                  placeholder="Enter year built"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Area */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={propertyData?.features?.area}
                  onChange={(e) => handleNestedChange(e, "features", "area")}
                  placeholder="Enter property area"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Amenities */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenities
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={propertyData?.features?.amenities}
                  onChange={(e) =>
                    handleNestedChange(e, "features", "amenities")
                  }
                  placeholder="Enter amenities"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Images */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Images
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadWidget
                  isGallery={false}
                  onImagesChange={handleImagesChange}
                />
              </div>

              {/* Gallery */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadWidget
                  isGallery={true}
                  onImagesChange={handleGalleryChange}
                />
              </div>

              {/* Community Name */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Community Name
                </label>
                <input
                  type="text"
                  name="community_name"
                  value={propertyData?.community_name}
                  onChange={handleChange}
                  placeholder="Enter community name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div> 
              
              {/* Community Name Slug*/}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Community Name Slug
                </label>
                <input
                  type="text"
                  name="community_name_slug"
                  value={propertyData?.community_name_slug}
                  onChange={handleChange}
                  placeholder="Enter community name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Nearby Facilities */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nearby Facilities
                </label>
                <input
                  type="text"
                  name="nearby_facilities"
                  value={propertyData?.community_features?.nearby_facilities}
                  onChange={(e) =>
                    handleNestedChange(
                      e,
                      "community_features",
                      "nearby_facilities"
                    )
                  }
                  placeholder="Enter nearby facilities"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Transportation */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Transportation
                </label>
                <input
                  type="text"
                  name="transportation"
                  value={propertyData?.community_features?.transportation}
                  onChange={(e) =>
                    handleNestedChange(
                      e,
                      "community_features",
                      "transportation"
                    )
                  }
                  placeholder="Enter Transportation Services"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Project Overview */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Project Overview
                </label>
                <textarea
                  name="project_overview"
                  value={propertyData?.community_features?.project_overview}
                  onChange={(e) =>
                    handleNestedChange(
                      e,
                      "community_features",
                      "project_overview"
                    )
                  }
                  placeholder="Enter project overview"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                ></textarea>
              </div>

              {/* Show Property */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Show property
                </label>
                <select
                  name="show_property"
                  value={propertyData?.show_property}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* Featured */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Featured
                </label>
                <select
                  name="featured"
                  value={propertyData?.featured}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
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
                  onClick={() => navigate("/manage-properties")}
                  className="border-gray-300 hover:bg-gray-100 inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 font-medium text-black transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};
export default AddProperty;
