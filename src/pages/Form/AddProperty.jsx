import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import UploadGallery from "../../components/UploadWidget/UploadGallery";
import UploadImages from "../../components/UploadWidget/UploadImages";
import UploadAmenity from "../../components/UploadWidget/UploadAmenity";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import {
  FETCH_ALL_AGENTS,
  FETCH_ALL_PROPERTIES,
  FETCH_ALL_PROPERTY_TYPES,
  FETCH_ALL_COMMUNITIES,
  FETCH_ICONS,
} from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    // bedrooms: "",
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
    icons: [],
  },
  faqs: [{ question: "", answer: "" }],
  seo: { meta_title: "", meta_description: "", keywords: "" },
  schema_org: {
    type: "Person",
    properties: {},
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
        const response = await axios.get(FETCH_ALL_PROPERTIES + `/${id}`, {
          withCredentials: true,
        });
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
      const response = await axios.get(FETCH_ALL_PROPERTY_TYPES, {
        withCredentials: true,
      });
      setPropertyType(response?.data?.propertyTypes);
    };
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const fetchAllCommunities = async () => {
      const response = await axios.get(FETCH_ALL_COMMUNITIES, {
        withCredentials: true,
      });
      setCommunity(response?.data?.communities);
    };
    fetchAllCommunities();
  }, []);

  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Fetch the amenities data and set it in state
  useEffect(() => {
    const fetchAmenities = async () => {
      const response = await axios.get(FETCH_ICONS);
      const amenities = response.data.icons.map((amenity) =>
        // console.log(amenity),
        ({
          value: amenity.icon_url,
          label: amenity.icon_text,
          id: amenity.id,
        })
      );
      setAmenitiesOptions(amenities);
    };

    fetchAmenities();
  }, []);

  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [propertyType, setPropertyType] = useState([]);
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
  const handleSchemaOrgPropertiesChange = (e) => {
    const { value } = e.target;
    try {
      const parsedValue = JSON.parse(value);
      setPropertyData((prevData) => ({
        ...prevData,
        schema_org: {
          ...prevData?.schema_org,
          properties: parsedValue,
        },
      }));
    } catch (error) {
      // Handle JSON parse error if needed
      console.error("Invalid JSON format");
    }
  };

  const getAmenitiesValue = useCallback(() => {
    let amenities = [];
    for (let i = 0; i < propertyData.amenities.icons.length; i++) {
      amenities.push(
        ...amenitiesOptions.filter(
          (icon) => icon.id === propertyData.amenities.icons[i]
        )
      );
    }

    return amenities;
  });

  const handleAmenitiesChange = (selectedOptions) => {
    setSelectedAmenities(selectedOptions);
    // console.log(selectedOptions, "000099090");
    // setPropertyData((prev) => ({
    //   ...prev,
    //   amenities: selectedOptions.map((item) => item.id),
    // }));

    setPropertyData((prev) => {
      let tempAmenities = {
        description: prev.amenities.description,
        icons: selectedOptions.map((item) => item.id),
      };

      prev.amenities = tempAmenities;

      return prev;
    });
  };

  // const handleAmenitiesChange = (selectedOptions) => {
  //   setSelectedAmenities(selectedOptions);
  //   setPropertyData((prev) => ({
  //     ...prev,
  //     amenities: {
  //       ...prev.amenities,
  //       icons: selectedOptions.map((item) => ({
  //         _id: item.id
  //       }))
  //     }
  //   }));
  // };

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

  // const handleCheckboxChange = (e) => {
  //   const { name, value, checked } = e.target;
  //   setPropertyData((prev) => {
  //     const newTypes = checked
  //       ? [...prev.type, value]
  //       : prev.type.filter((type) => type !== value);
  //     return {
  //       ...prev,
  //       type: newTypes,
  //     };
  //   });
  // };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setPropertyData((prev) => {
      let newTypes = [];
      if (checked) {
        newTypes = [...prev.type, { name: value, bedrooms: "" }];
      } else {
        newTypes = prev.type.filter((type) => type.name !== value);
      }
      return {
        ...prev,
        type: newTypes,
      };
    });
  };

  const handleBedroomsChange = (e, typeSlug) => {
    const { value } = e.target;
    setPropertyData((prev) => {
      const updatedTypes = prev.type.map((type) =>
        type.name === typeSlug ? { ...type, bedrooms: value } : type
      );
      return {
        ...prev,
        type: updatedTypes,
      };
    });
  };

  const cleanTypeData = (typeData) => {
    return typeData.filter((item) => item.name && item.bedrooms);
  };

  useEffect(() => {
    setPropertyData((prev) => ({
      ...prev,
      type: cleanTypeData(prev.type),
    }));
  }, []);

  // const handleFormSubmit = async (e) => {
  //   e.preventDefault();

  //   // Convert string fields to arrays
  //   propertyData.type = convertStringToArray(propertyData.type);
  //   propertyData.status = convertStringToArray(propertyData.status);
  //   propertyData.features.amenities = convertStringToArray(
  //     propertyData.features.amenities
  //   );
  //   propertyData.community_features.nearby_facilities = convertStringToArray(
  //     propertyData.community_features.nearby_facilities
  //   );
  //   propertyData.community_features.transportation = convertStringToArray(
  //     propertyData.community_features.transportation
  //   );
  //   propertyData.seo.keywords = convertStringToArray(propertyData.seo.keywords);

  //   // Make API request using axios
  //   try {
  //     let response;
  //     const payload = {
  //       ...propertyData,
  //       gallery: propertyData.galleryToSend, // Ensure only URLs are sent
  //     };
  //     if (id) {
  //       // Update existing property
  //       response = await axios.put(FETCH_ALL_PROPERTIES + `/${id}`, payload, {
  //         withCredentials: true,
  //       });
  //     } else {
  //       // Create new property
  //       response = await axios.post(FETCH_ALL_PROPERTIES, payload, {
  //         withCredentials: true,
  //       });
  //     }

  //     if (response?.data?.success === false) {
  //       toast.error(response?.data?.message);
  //       return;
  //     } else {
  //       toast.success(response?.data?.message);
  //     }
  //     navigate("/manage-properties");
  //   } catch (error) {
  //     console.error("Error adding/updating property:", error);
  //   }
  // };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Make API request using axios

    // propertyData.type = convertStringToArray(propertyData.type);
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
    propertyData.seo.keywords = convertStringToArray(propertyData.seo.keywords);
    try {
      let response;
      if (id) {
        // Update existing property
        response = await axios.put(
          FETCH_ALL_PROPERTIES + `/${id}`,
          propertyData,
          {
            withCredentials: true,
          }
        );
      } else {
        // Create new property
        response = await axios.post(FETCH_ALL_PROPERTIES, propertyData, {
          withCredentials: true,
        });
      }
      console.log(propertyData, "8888888888888");
      console.log(response.data, "-=-=--=--=-=");
      if (response?.data?.success === false) {
        toast.error(response?.data?.message);
        return;
      } else {
        toast.success(response?.data?.message);
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

              {/* <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <div>
                  {Array.isArray(propertyType) &&
                    propertyType.map((type) => (
                      <div
                        key={type.name_slug}
                        className="mb-2 flex items-center"
                      >
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="type"
                            value={type.name_slug}
                            checked={propertyData.type.some(
                              (t) => t.name === type.name_slug
                            )}
                            onChange={handleCheckboxChange}
                            className="form-checkbox"
                          />
                          <span className="ml-2">{type.name}</span>
                        </label>
                        {propertyData.type.some(
                          (t) => t.name === type.name_slug
                        ) && (
                          <input
                            type="number"
                            min="0"
                            name={`bedrooms-${type.name_slug}`}
                            value={
                              propertyData.type.find(
                                (t) => t.name === type.name_slug
                              )?.bedrooms || ""
                            }
                            onChange={(e) =>
                              handleBedroomsChange(e, type.name_slug)
                            }
                            placeholder="Bedrooms"
                            className="border-gray-300 ml-4 rounded border p-2"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div> */}

              <div className="mb-6 md:col-span-12">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <div className="space-y-4">
                  {Array.isArray(propertyType) &&
                    propertyType.map((type) => (
                      <div
                        key={type.name_slug}
                        className="border-gray-300 ark:border-form-strokedark flex transform items-center justify-between rounded-lg border bg-white p-4 shadow-lg transition-transform hover:scale-105 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                      >
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="type"
                            value={type.name_slug}
                            checked={propertyData.type.some(
                              (t) => t.name === type.name_slug
                            )}
                            onChange={handleCheckboxChange}
                            className="border-gray-300 h-5 w-5 rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-gray-800 dark:text-gray-200 text-lg font-medium">
                            {type.name}
                          </span>
                        </label>
                        {propertyData.type.some(
                          (t) => t.name === type.name_slug
                        ) && (
                          <div className="ml-4 flex items-center space-x-2">
                            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                              Bedrooms
                            </label>

                            <input
                              type="number"
                              min="0"
                              name={`bedrooms-${type.name_slug}`}
                              value={
                                propertyData.type.find(
                                  (t) => t.name === type.name_slug
                                )?.bedrooms || ""
                              }
                              onChange={(e) =>
                                handleBedroomsChange(e, type.name_slug)
                              }
                              placeholder="0"
                              className="border-gray-300 bg-gray-50 text-gray-800 ark:border-form-strokedark w-20 rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white  dark:focus:border-black"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Address */}
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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

              {/* Bathrooms */}
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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
              <div className="mb-5 md:col-span-4 lg:col-span-4">
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

              {/* Amenities  */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenities
                </label>
                <Select
                  isMulti
                  name="amenities"
                  options={amenitiesOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={getAmenitiesValue()}
                  onChange={handleAmenitiesChange}
                  placeholder="Select amenities"
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
              <div className="mb-5 md:col-span-4">
                <label className="block">Schema Type</label>
                <textarea
                  name="schema_org.type"
                  value={propertyData.schema_org.type}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={JSON.stringify(propertyData.schema_org.properties)}
                  onChange={handleSchemaOrgPropertiesChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* Open Graph */}
              <div className="mb-5 md:col-span-3">
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

              <div className="mb-5 md:col-span-3">
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

              <div className="mb-5 md:col-span-3">
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

              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={propertyData.open_graph.type}
                  onChange={(e) => handleNestedChange(e, "open_graph", "type")}
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
      <ToastContainer />
    </DefaultLayout>
  );
};
export default AddProperty;
