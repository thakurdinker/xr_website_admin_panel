import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import UploadWidget from "../../components/UploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

const initialPropertyData = {
  property_name: "",
  description: "",
  price: "",
  type: "",
  location: {
    address: "",
    city: "",
    state: "",
    country: "",
    coordinates: "",
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
  status: "",
  community_name: "",
  community_name_slug: "",
  community_features: {
    project_overview: "",
    nearby_facilities: "",
    transportation: "",
    community_facilities: "",
    nearby_landmarks: "",
    unit_types: "",
  },
  show_property: false,
  featured: false,
};

const ProFormLayout = () => {
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const navigate = useNavigate();
  const resetForm = () => {
    setPropertyData(initialPropertyData);
  };

  const handleCancel = () => {
    navigate("/manage-properties");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (updatedImages) => {
    setPropertyData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  const handleGalleryChange = (updatedGallery) => {
    setPropertyData((prev) => ({
      ...prev,
      gallery: updatedGallery,
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

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log(propertyData);
      resetForm()
      // axios({
      //   method: "post",
      //   url: "REGISTER_PROPERTY",
      //   data: propertyData,
      // })
      //   .then((response) => {
      //     console.log(response);
      //   })
      //   .catch((err) => {
      //     console.log("Error adding property");
      //   });
    },
    [propertyData]
  );

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="m-10 rounded-sm border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
          <form onSubmit={handleFormSubmit}>
            <div className="p-6.5">
              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="property_name"
                    value={propertyData.property_name}
                    onChange={handleChange}
                    placeholder="Enter property name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>

                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    value={propertyData.status}
                    onChange={handleChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={propertyData.type}
                    onChange={handleChange}
                    placeholder="Enter property type"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
              </div>
              <div className="mb-5 w-full">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>
                <textarea
                  name="description"
                  value={propertyData.description}
                  onChange={handleChange}
                  placeholder="Enter property description"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                ></textarea>
              </div>
              <div className="mb-5 flex flex-col gap-6 xl:flex-row"></div>
              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={propertyData.location.address}
                    onChange={(e) =>
                      handleNestedChange(e, "location", "address")
                    }
                    placeholder="Enter address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={propertyData.location.city}
                    onChange={(e) => handleNestedChange(e, "location", "city")}
                    placeholder="Enter city"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={propertyData.location.state}
                    onChange={(e) => handleNestedChange(e, "location", "state")}
                    placeholder="Enter state"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={propertyData.location.country}
                    onChange={(e) =>
                      handleNestedChange(e, "location", "country")
                    }
                    placeholder="Enter country"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="lat"
                    value={propertyData.location.coordinates.lat}
                    onChange={(e) =>
                      handleNestedChange(e, "location", "coordinates")
                    }
                    placeholder="Enter latitude"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="lng"
                    value={propertyData.location.coordinates.lng}
                    onChange={(e) =>
                      handleNestedChange(e, "location", "coordinates")
                    }
                    placeholder="Enter longitude"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
              </div>
              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Bedrooms
                  </label>
                  <input
                    type="text"
                    name="bedrooms"
                    value={propertyData.features.bedrooms}
                    onChange={(e) =>
                      handleNestedChange(e, "features", "bedrooms")
                    }
                    placeholder="Enter number of bedrooms"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Bathrooms
                  </label>
                  <input
                    type="text"
                    name="bathrooms"
                    value={propertyData.features.bathrooms}
                    onChange={(e) =>
                      handleNestedChange(e, "features", "bathrooms")
                    }
                    placeholder="Enter number of bathrooms"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={propertyData.price}
                    onChange={handleChange}
                    placeholder="Enter property price"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Year Built
                  </label>
                  <input
                    type="text"
                    name="year_built"
                    value={propertyData.features.year_built}
                    onChange={(e) =>
                      handleNestedChange(e, "features", "year_built")
                    }
                    placeholder="Enter year built"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={propertyData.features.area}
                    onChange={(e) => handleNestedChange(e, "features", "area")}
                    placeholder="Enter property area"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Amenities
                  </label>
                  <input
                    type="text"
                    name="amenities"
                    value={propertyData.features.amenities}
                    onChange={(e) =>
                      handleNestedChange(e, "features", "amenities")
                    }
                    placeholder="Enter amenities"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Images
                  </label>
                  {/* Cloudinary Upload Widget */}
                  <UploadWidget
                    isGallery={false}
                    onImagesChange={handleImagesChange}
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Gallery
                  </label>
                  {/* Cloudinary Upload Widget */}
                  <UploadWidget
                    isGallery={true}
                    onImagesChange={handleGalleryChange}
                  />
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2"></div>
              </div>

              <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Community Name
                  </label>
                  <input
                    type="text"
                    name="community_name"
                    value={propertyData.community_name}
                    onChange={handleChange}
                    placeholder="Enter community name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Nearby Facilities
                  </label>
                  <input
                    type="text"
                    name="nearby_facilities"
                    value={propertyData.community_features.nearby_facilities}
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

                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Transportation
                  </label>
                  <input
                    type="text"
                    name="transportation"
                    value={propertyData.community_features.transportation}
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
              </div>
              <div className="mb-5 w-full">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Project Overview
                </label>
                <textarea
                  name="project_overview"
                  value={propertyData.community_features.project_overview}
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
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border-gray-300 hover:bg-gray-100 inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 font-medium text-black transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProFormLayout;
