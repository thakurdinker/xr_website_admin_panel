import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import UploadGallery from "../../components/UploadWidget/UploadGallery";
import UploadImages from "../../components/UploadWidget/UploadImages";
import UploadAmenity from "../../components/UploadWidget/UploadAmenity";
import { useNavigate, useParams } from "react-router-dom";
import {
  FETCH_ALL_AGENTS,
  FETCH_ALL_PROPERTIES,
  FETCH_ALL_PROPERTY_TYPES,
  FETCH_ALL_COMMUNITIES,
} from "../../api/constants";

const initialPropertyData = {
  property_name: "",
  property_name_slug: "",
  description: "",
  price: "",
  developer: "",
  developer_name_slug: "",
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
  },
  images: [],
  gallery_title_1: "",
  gallery_title_2: "",
  gallery_description_1: "",
  gallery_description_2: "",
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
  section_1: {
    heading: "",
    title: "",
    description: "",
    image: "",
  },
  about_project: {
    heading: "",
    title: "",
    description: "",
  },
  amenities: {
    description: "",
    icons: [
      {
        icon_url: "",
        icon_text: "",
      },
    ],
  },
  faqs: [{ question: "", answer: "" }],
  seo: { meta_title: "", meta_description: "", keywords: "" },
  schema_org: {
    type: "Person",
    properties: {
      context: "https://json-ld.org/contexts/person.jsonld",
      id: "http://dbpedia.org/resource/John_Lennon",
      name: "John Lennon",
      born: "1940-10-09",
      spouse: "http://dbpedia.org/resource/Cynthia_Lennon",
    },
  },
  open_graph: { title: "", description: "", image: "", type: "" },
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
        const response = await axios.get(FETCH_ALL_PROPERTIES + `/${id}`);
        setPropertyData((prev) => ({
          ...prev,
          ...response.data.property,
        }));
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };

    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      const response = await axios.get(FETCH_ALL_PROPERTY_TYPES);
      setPropertyType(response?.data?.propertyTypes);
    };
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const fetchAllCommunities = async () => {
      const response = await axios.get(FETCH_ALL_COMMUNITIES);
      setCommunity(response?.data?.communities);
    };
    fetchAllCommunities();
  }, []);

  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [propertyType, setPropertyType] = useState("");
  const [community, setCommunity] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "community_name") {
      let community_slug = "";
      for (let i = 0; i < community.length; i++) {
        if (community[i].slug === value) {
          community_slug = value;
          break;
        }
      }
      setPropertyData((prev) => ({ 
        ...prev,
        [name]: value,
        community_name_slug: community_slug,
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const handleImagesChange = (updatedImages) => {
    // Create a new array with only the url and description properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      description: image.description || "", // Add this line to handle missing description
      heading: image.heading || "",
    }));

    setPropertyData((prev) => ({
      ...prev,
      images: imagesToSend,
    }));
  };
  const handleAmenitiesChange = (updatedAmenities) => {
    setPropertyData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        icons: updatedAmenities,
      },
    }));
  };

  const handleGalleryChange = (updatedGallery) => {
    // Store full objects in state
    setPropertyData((prev) => ({
      ...prev,
      gallery: updatedGallery,
    }));

    // Extract URLs to send to the server
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

  const handleArrayChange = (e, index, arrayName, fieldName) => {
    const { value } = e.target;
    const updatedArray = propertyData[arrayName].map((item, idx) =>
      idx === index ? { ...item, [fieldName]: value } : item
    );
    setPropertyData((prevData) => ({ ...prevData, [arrayName]: updatedArray }));
  };

  const addFaq = () => {
    setPropertyData((prevData) => ({
      ...prevData,
      faqs: [...prevData.faqs, { question: "", answer: "" }],
    }));
  }; 

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setPropertyData((prev) => {
      const newTypes = checked
        ? [...prev.type, value]
        : prev.type.filter((type) => type !== value);
      return {
        ...prev,
        type: newTypes,
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Convert string fields to arrays
    propertyData.type = convertStringToArray(propertyData.type);
    propertyData.status = convertStringToArray(propertyData.status);
    propertyData.features.amenities = convertStringToArray(
      propertyData.features.amenities
    );
    propertyData.community_features.nearby_facilities = convertStringToArray(
      propertyData.community_features.nearby_facilities
    );
    propertyData.community_features.transportation = convertStringToArray(
      propertyData.community_features.transportation
    );

    // Make API request using axios
    try {
      const payload = {
        ...propertyData,
        gallery: propertyData.galleryToSend, // Ensure only URLs are sent
      };
      if (id) {
        // Update existing property
        const response = await axios.put(
          FETCH_ALL_PROPERTIES + `/${id}`,
          propertyData
        );
      } else {
        // Create new property
        const response = await axios.post(FETCH_ALL_PROPERTIES, propertyData);
      }
      navigate("/manage-properties");
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
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Property Name
                </label>
                <input
                  type="text"
                  name="property_name"
                  value={propertyData?.property_name}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Property Name  Slug*/}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Property Name Slug
                </label>
                <input
                  type="text"
                  name="property_name_slug"
                  value={propertyData?.property_name_slug}
                  onChange={handleChange}
                  placeholder="Enter property name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Price */}
              <div className="mb-5 md:col-span-4 lg:col-span-3">
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
                  required
                />
              </div>

              {/* Status */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Status
                </label>
                <input
                  type="text"
                  name="status"
                  value={propertyData?.status}
                  onChange={handleChange}
                  placeholder="Enter status"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>
                <textarea
                  name="description"
                  value={propertyData?.description}
                  onChange={handleChange}
                  placeholder="Enter property description"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                ></textarea>
              </div>

              {/* Developer */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer
                </label>
                <input
                  type="text"
                  name="developer"
                  value={propertyData.developer}
                  onChange={handleChange}
                  placeholder="Enter developer name"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Developer Name Slug */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer Name Slug
                </label>
                <input
                  type="text"
                  name="developer_name_slug"
                  value={propertyData.developer_name_slug}
                  onChange={handleChange}
                  placeholder="Enter developer name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Section 1 Heading */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Heading
                </label>
                <input
                  type="text"
                  name="heading"
                  value={propertyData?.section_1?.heading}
                  onChange={(e) =>
                    handleNestedChange(e, "section_1", "heading")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Section 1 Title */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={propertyData?.section_1?.title}
                  onChange={(e) => handleNestedChange(e, "section_1", "title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Section 1 Description */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={propertyData?.section_1?.description}
                  onChange={(e) =>
                    handleNestedChange(e, "section_1", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Section 1 Image */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Image
                </label>
                <input
                  type="text"
                  name="description"
                  value={propertyData?.section_1?.image}
                  onChange={(e) => handleNestedChange(e, "section_1", "image")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Type */}
              {/* <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <select
                  name="type"
                  value={propertyData?.type || ""}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {Array.isArray(propertyType) &&
                    propertyType.map((type) => (
                      <option key={type.name_slug} value={type.name_slug}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div> */}

              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <div>
                  {Array.isArray(propertyType) &&
                    propertyType.map((type) => (
                      <div key={type.name_slug}>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="type"
                            value={type.name_slug}
                            checked={propertyData.type.includes(type.name_slug)}
                            onChange={handleCheckboxChange}
                            className="form-checkbox"
                          />
                          <span className="ml-2">{type.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
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
                  required
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
                  required
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
                  required
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
                  required
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
                    handleDoubleNestedChange(
                      e,
                      "location",
                      "coordinates",
                      "lat"
                    );
                  }}
                  placeholder="Enter latitude"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>

              {/* Images */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Images
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadImages
                  isGallery={false}
                  onImagesChange={handleImagesChange}
                  initialImages={propertyData?.images || []}
                />
              </div>

              {/* Gallery */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadGallery
                  onImagesChange={handleGalleryChange}
                  initialImages={propertyData.gallery || []}
                />
              </div>

              {/* Gallery Title 1 */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery Title 1
                </label>
                <input
                  type="text"
                  name="gallery_title_1"
                  value={propertyData?.gallery_title_1}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Gallery Title 2 */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery Title 2
                </label>
                <input
                  type="text"
                  name="gallery_title_2"
                  value={propertyData?.gallery_title_2}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Gallery Description 1 */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery Description 1
                </label>
                <input
                  type="text"
                  name="gallery_description_1"
                  value={propertyData?.gallery_description_1}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Gallery Description 2 */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery Description 2
                </label>
                <input
                  type="text"
                  name="gallery_description_2"
                  value={propertyData?.gallery_description_2}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Amenity Description */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenity Description
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={propertyData?.amenities?.description}
                  onChange={(e) =>
                    handleNestedChange(e, "amenities", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Amenity Icon */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenity Icon
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadAmenity
                  onImagesChange={handleAmenitiesChange}
                  initialImages={propertyData.amenities.icons || []}
                />
              </div>

              {/* Community Name */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Community Name
                </label>
                <select
                  name="community_name"
                  value={propertyData?.community_name}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                >
                  <option value="" disabled>
                    Select community
                  </option>
                  {Array.isArray(community) &&
                    community.map((comm) => (
                      <option key={comm.id} value={comm.slug}>
                        {comm.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Community Name Slug*/}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Community Name Slug
                </label>
                <input
                  disabled
                  type="text"
                  name="community_name_slug"
                  value={propertyData?.community_name_slug}
                  onChange={handleChange}
                  placeholder="Enter community name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
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
                  required
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
                  required
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
                  required
                ></textarea>
              </div>

              {/* Show Property */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Show property
                </label>
                <select
                  name="show_property"
                  value={propertyData?.show_property}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* Featured */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Featured
                </label>
                <select
                  name="featured"
                  value={propertyData?.featured}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* About Project Heading */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  About Project Heading
                </label>
                <input
                  type="text"
                  name="heading"
                  value={propertyData?.about_project?.heading}
                  onChange={(e) =>
                    handleNestedChange(e, "about_project", "heading")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* About Project Title */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  About Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={propertyData?.about_project?.title}
                  onChange={(e) =>
                    handleNestedChange(e, "about_project", "title")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* About Project Description */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  About Project Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={propertyData?.about_project?.description}
                  onChange={(e) =>
                    handleNestedChange(e, "about_project", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* SEO */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={propertyData?.seo?.meta_title}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="meta_description"
                  value={propertyData?.seo?.meta_description}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  SEO Keywords{" "}
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={propertyData?.seo?.keywords}
                  onChange={(e) => handleNestedChange(e, "seo", "keywords")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Schema */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Schema Type
                </label>
                <input
                  name="schema_org.type"
                  value={JSON.stringify(propertyData.schema_org.type)}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-12">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={JSON.stringify(propertyData.schema_org.properties)}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* Open Graph */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={propertyData.open_graph.title}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Image
                </label>
                <input
                  type="text"
                  name="image"
                  value={propertyData.open_graph.image}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={propertyData.open_graph.description}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                  required
                />
              </div>

              {/* FAQs */}
              <div className="mb-5 md:col-span-12">
                <h3 className="mb-2">FAQs</h3>
                {propertyData.faqs.map((faq, index) => (
                  <div key={index} className="mb-2">
                    <label className="block">Question {index + 1}</label>
                    <input
                      type="text"
                      name={`faqs[${index}].question`}
                      value={faq.question}
                      onChange={(e) =>
                        handleArrayChange(e, index, "faqs", "question")
                      }
                      className="mb-2 w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      required
                    />
                    <label className="block">Answer {index + 1}</label>
                    <textarea
                      name={`faqs[${index}].answer`}
                      value={faq.answer}
                      onChange={(e) =>
                        handleArrayChange(e, index, "faqs", "answer")
                      }
                      className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-gray-200 hover:bg-gray-300 mt-2 rounded border border-stroke px-4 py-2 text-black transition dark:border-form-strokedark dark:bg-form-input dark:text-white dark:hover:bg-form-input"
                  required
                >
                  Add FAQ
                </button>
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
