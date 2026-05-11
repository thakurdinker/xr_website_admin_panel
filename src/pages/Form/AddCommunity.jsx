import React, { useCallback, useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UploadImages from "../../components/UploadWidget/UploadImages";
import "react-phone-number-input/style.css";
import {
  DEVELOPERS_URL,
  FETCH_ALL_AGENTS,
  FETCH_ALL_COMMUNITIES,
  FETCH_ALL_ICONS,
} from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { IoCloseCircle } from "react-icons/io5";

const CommunityForm = () => {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [profilePic, setProfilePic] = useState([]);

  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const navigate = useNavigate();

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState([]);
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogType, setOgType] = useState("");

  const [schemaType, setSchemaType] = useState("");
  const [schemaProperties, setSchemaProperties] = useState("");

  const [developers, setDevelopers] = useState([]);

  // Extract the current page number from query parameters
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get("page")) || 1;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    amenities: {
      description: "",
      icons: [],
    },
    images: [],
    faqs: [{ question: "", answer: "" }],
    seo: {
      meta_title: "",
      meta_description: "",
      keywords: [],
      meta_canonical_url: "",
    },
    schema_org: {
      type: "Person",
      properties: {},
    },
    open_graph: {
      title: "",
      description: "",
      image: "",
    },
    order: 1,
    developer: "",
    developer_name_slug: "",
  });

  const generateSchema = () => {
    return {
      // type: ogType,

      "@context": "https://schema.org",
      "@type": schemaType,
      name: seoTitle,
      description: seoDescription,

      image: ogImage,

      amenityFeature: (function () {
        let amenitiesName = [];
        getAmenitiesValue().map((amenity) => {
          let temp = {
            "@type": "LocationFeatureSpecification",
            name: amenity.label,
            value: "Yes",
          };
          amenitiesName.push(temp);
        });

        return amenitiesName;
      })(),
      url: `https://www.xrealty.ae/area/${formData?.slug}/`,
    };
  };

  useEffect(() => {
    const fetchAllDevelopers = async () => {
      const response = await axios.get(DEVELOPERS_URL, {
        withCredentials: true,
      });
      setDevelopers(response?.data?.data);
    };
    fetchAllDevelopers();
  }, []);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(FETCH_ALL_COMMUNITIES + `/${id}`, {
          withCredentials: true,
        });
        setFormData((prev) => {
          const c = response.data.community;
          return {
            ...prev,
            ...c,
            location: { ...prev.location, ...c.location, coordinates: { ...prev.location.coordinates, ...c.location?.coordinates } },
            amenities: { ...prev.amenities, ...c.amenities },
            seo: { ...prev.seo, ...c.seo },
            schema_org: { ...prev.schema_org, ...c.schema_org },
            open_graph: { ...prev.open_graph, ...c.open_graph },
          };
        });

        setSeoTitle(
          response.data.community.seo.meta_title === ""
            ? response.data.community.name
            : response.data.community.seo.meta_title
        );
        setSeoDescription(
          response.data.community?.seo?.meta_description === ""
            ? response.data.community.description
            : response.data.community?.seo?.meta_description
        );
        setSeoCanonicalUrl(
          response.data.community?.seo?.meta_canonical_url === ""
            ? ""
            : response.data.community?.seo?.meta_canonical_url
        );
        setSeoKeywords(
          response.data.community.seo.keywords[0] === ""
            ? [response.data.community.name]
            : response.data.community.seo.keywords
        );

        setOgImage(
          response.data.community.open_graph.image === ""
            ? response.data.community.images[0].url
            : response.data.community.open_graph.image
        );
        setOgType("Place");

        setSchemaType(
          response.data.community.schema_org.type === ""
            ? ""
            : response.data.community.schema_org.type
        );

        setSchemaProperties(
          !response.data.community.schema_org.properties
            ? JSON.stringify({})
            : JSON.stringify(response.data.community.schema_org.properties)
        );
      } catch (error) {
        console.error("Error fetching community data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
  }, [id]);

  const addFaq = () => {
    setFormData((prevData) => ({
      ...prevData,
      faqs: [...prevData.faqs, { question: "", answer: "" }],
    }));
  };

  useEffect(() => {
    const fetchAmenities = async () => {
      const response = await axios.get(FETCH_ALL_ICONS);

      const amenities = response.data.icons.map((amenity) => ({
        value: amenity.icon_url,
        label: amenity.icon_text,
        id: amenity.id,
      }));
      setAmenitiesOptions(amenities);
    };

    fetchAmenities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "name") {
      setSeoTitle(value);
    }

    if (name === "description") {
      setSeoDescription(value);
    }

    if (name === "developer") {
      let developer_slug = "";
      let developer_name = "";
      for (let i = 0; i < developers.length; i++) {
        if (developers[i].developer_name === value) {
          developer_slug = developers[i].developer_slug;
          developer_name = value;
          break;
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        developer_name_slug: developer_slug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;

    if (name === "schema_org.type") {
      setSchemaType(value);
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [parentKey]: { ...prevData[parentKey], [childKey]: value },
    }));

    if (name === "meta_title") {
      setSeoTitle(value);
    }

    if (name === "meta_description") {
      setSeoDescription(value);
    }

    if (name === "meta_canonical_url") {
      setSeoCanonicalUrl(value);
    }

    if (e.target.name === "schema_org.type") {
      setOgType(e.target.value);
    }

    if (e.target.name === "keywords") {
      setSeoKeywords(value);
    }
  };

  const handleDoubleNestedChange = (e, parentKey, childKey, subChildKey) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleImagesChange = (updatedImages) => {
    // Create a new array with url, alt, description and heading properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      alt: image.alt || "",
      description: image.description || "",
      heading: image.heading || "",
    }));

    setOgImage(updatedImages[0].url);

    setFormData((prev) => ({
      ...prev,
      images: imagesToSend,
    }));
  };

  const handleArrayChange = (e, index, arrayName, fieldName) => {
    const { value } = e.target;
    const updatedArray = formData[arrayName].map((item, idx) =>
      idx === index ? { ...item, [fieldName]: value } : item
    );
    setFormData((prevData) => ({ ...prevData, [arrayName]: updatedArray }));
  };

  const convertStringToArray = (field, delimiter = ",") => {
    if (typeof field === "string") {
      return field.split(delimiter).map((item) => item.trim());
    }
    return field;
  };

  const handleAmenitiesChange = (selectedOptions) => {
    setSelectedAmenities(selectedOptions);
    setFormData((prev) => {
      let tempAmenities = {
        description: prev.amenities.description,
        icons: selectedOptions.map((item) => item.id),
      };

      prev.amenities = tempAmenities;

      return prev;
    });
  };

  const getAmenitiesValue = useCallback(() => {
    let amenities = [];
    for (let i = 0; i < formData?.amenities?.icons?.length; i++) {
      amenities.push(
        ...amenitiesOptions.filter(
          (icon) => icon.id === formData.amenities.icons[i]
        )
      );
    }

    return amenities;
  });

  const handleSchemaOrgPropertiesChange = (e) => {
    const { value } = e.target;
    setSchemaProperties(value);
    try {
      // const parsedValue = JSON.parse(value);
      const parsedValue = value;
      setFormData((prevData) => ({
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

  const handleFAQDelete = (faq, faqIndex) => {
    let tempFaqs = formData.faqs.filter((faq, index) => index !== faqIndex);

    setFormData((prev) => {
      return { ...prev, faqs: tempFaqs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.specialties = convertStringToArray(formData.specialties);
    formData.languages = convertStringToArray(formData.languages);
    formData.video_links = convertStringToArray(formData.video_links);
    // formData.seo.keywords = convertStringToArray(formData.seo.keywords);
    formData.seo.keywords = convertStringToArray(seoKeywords);
    formData.seo.meta_title = seoTitle;
    formData.seo.meta_description = seoDescription;
    formData.seo.meta_canonical_url = seoCanonicalUrl;

    formData.open_graph.description = seoDescription;
    formData.open_graph.title = seoTitle;
    formData.open_graph.image = ogImage;

    // formData.schema_org = generateSchema();
    formData.schema_org.type = schemaType;

    formData.amenities = convertStringToArray(formData.amenities);

    try {
      let response;
      if (id) {
        // Update existing property
        response = await axios.put(FETCH_ALL_COMMUNITIES + `/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        // Create new property
        response = await axios.post(FETCH_ALL_COMMUNITIES, formData, {
          withCredentials: true,
        });
      }
      if (response?.data?.success === false) {
        toast.error(response?.data?.message || "Failed to save community");
      } else {
        toast.success(id ? "Community updated successfully!" : "Community created successfully!");
      }
    } catch (error) {
      console.error("Error adding/updating community:", error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      navigate(`/manage-communities?page=${currentPage}`);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1200px]">
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {id ? "Edit Community" : "Add Community"}
              </h2>
              <p className="mt-1 text-sm text-[#637381] dark:text-bodydark">
                {id ? "Update community details and settings" : "Create a new community listing"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/manage-communities?page=${currentPage}`)}
              className="rounded border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Back to Communities
            </button>
          </div>

          <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 md:grid-cols-12 lg:p-8"
            >
              {/* Section: Basic Info */}
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Basic Information</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Community name, developer, and description</p>
              </div>

              {/* Name */}
              <div className="mb-5 md:col-span-4 lg:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Slug */}
              <div className="mb-5 md:col-span-4 lg:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Order */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData?.order}
                  onChange={handleChange}
                  min={1}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Developer Name */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer Name
                </label>
                <select
                  name="developer"
                  value={formData?.developer}
                  onChange={handleChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    Select Developer
                  </option>
                  {developers.length > 0 &&
                    developers.map((developer) => {
                      return (
                        <option
                          key={developer.id}
                          value={developer.developer_name}
                        >
                          {developer.developer_name}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Developer Name Slug*/}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer Name Slug
                </label>
                <input
                  disabled
                  type="text"
                  name="developer_name_slug"
                  value={formData.developer_name_slug}
                  placeholder="Enter Developer name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Description */}
              <div className="mb-5 md:col-span-4 lg:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Section: Location */}
              <div className="md:col-span-12">
                <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
                <h3 className="text-base font-semibold text-black dark:text-white">Location</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Address and geographic coordinates</p>
              </div>

              {/* Address */}
              <div className="mb-5 md:col-span-4 lg:col-span-2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData?.location?.address}
                  onChange={(e) => handleNestedChange(e, "location", "address")}
                  placeholder="Enter address"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={formData?.location?.city}
                  onChange={(e) => handleNestedChange(e, "location", "city")}
                  placeholder="Enter city"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={formData?.location?.state}
                  onChange={(e) => handleNestedChange(e, "location", "state")}
                  placeholder="Enter state"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={formData?.location?.country}
                  onChange={(e) => handleNestedChange(e, "location", "country")}
                  placeholder="Enter country"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={Number(formData?.location?.coordinates?.lat)}
                  onChange={(e) =>
                    handleDoubleNestedChange(
                      e,
                      "location",
                      "coordinates",
                      "lat"
                    )
                  }
                  placeholder="Enter latitude"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={Number(formData?.location?.coordinates?.lng)}
                  onChange={(e) =>
                    handleDoubleNestedChange(
                      e,
                      "location",
                      "coordinates",
                      "lng"
                    )
                  }
                  placeholder="Enter longitude"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Section: Amenities & Media */}
              <div className="md:col-span-12">
                <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
                <h3 className="text-base font-semibold text-black dark:text-white">Amenities & Media</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Community amenities and images</p>
              </div>

              {/* Amenity Description */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenity Description
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData?.amenities?.description}
                  onChange={(e) =>
                    handleNestedChange(e, "amenities", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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

              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Image
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadImages
                  onImagesChange={handleImagesChange}
                  initialImages={formData?.images || []}
                />
              </div>

              {/* Section: FAQs */}
              <div className="md:col-span-12">
                <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
              </div>
              <div className="mb-5 md:col-span-12">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black dark:text-white">FAQs</h3>
                    <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Frequently asked questions about this community</p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="rounded bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-opacity-90"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="rounded-lg border border-stroke p-4 dark:border-form-strokedark">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#637381] dark:text-bodydark">FAQ {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleFAQDelete(faq, index)}
                          className="rounded p-1 text-[#637381] transition hover:bg-red/10 hover:text-red dark:text-bodydark"
                          title="Remove FAQ"
                        >
                          <IoCloseCircle size={20} />
                        </button>
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm font-medium text-black dark:text-white">Question</label>
                        <input
                          type="text"
                          name={`faqs[${index}].question`}
                          value={faq.question}
                          onChange={(e) =>
                            handleArrayChange(e, index, "faqs", "question")
                          }
                          placeholder="Enter the question..."
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-black dark:text-white">Answer</label>
                        <textarea
                          rows={3}
                          name={`faqs[${index}].answer`}
                          value={faq.answer}
                          onChange={(e) =>
                            handleArrayChange(e, index, "faqs", "answer")
                          }
                          placeholder="Enter the answer..."
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {formData.faqs.length === 0 && (
                  <div className="rounded-lg border border-dashed border-stroke py-8 text-center dark:border-form-strokedark">
                    <p className="text-sm text-[#637381] dark:text-bodydark">No FAQs added yet. Click "+ Add FAQ" to get started.</p>
                  </div>
                )}
              </div>

              {/* Section: SEO & Schema */}
              <div className="md:col-span-12">
                <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
                <h3 className="text-base font-semibold text-black dark:text-white">SEO & Structured Data</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Search engine optimization, meta tags, and schema markup</p>
              </div>

              {/* SEO */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">Meta Description</label>
                <input
                  type="text"
                  name="meta_description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Canonical URL
                </label>
                <input
                  type="text"
                  value={seoCanonicalUrl}
                  name="meta_canonical_url"
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_canonical_url")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">SEO Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={seoKeywords}
                  onChange={(e) => handleNestedChange(e, "seo", "keywords")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Schema */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">Schema Type</label>
                <input
                  type="text"
                  name="schema_org.type"
                  value={schemaType}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">Schema Properties (JSON)</label>
                <textarea
                  rows={4}
                  name="schema_org.properties"
                  value={schemaProperties}
                  onChange={handleSchemaOrgPropertiesChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSchemaProperties(JSON.stringify(generateSchema()));
                    setFormData((prevData) => ({
                      ...prevData,
                      schema_org: {
                        ...prevData?.schema_org,
                        properties: generateSchema(),
                      },
                    }));
                  }}
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90"
                >
                  Generate Schema
                </button>
              </div>

              {/* Open Graph */}
              <div className="md:col-span-12">
                <h4 className="text-sm font-semibold text-black dark:text-white">Open Graph</h4>
                <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Social media sharing preview</p>
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">OG Title</label>
                <input
                  type="text"
                  name="title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">OG Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={ogImage}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">OG Description</label>
                <input
                  type="text"
                  name="description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-12">
                <div className="my-1 border-t border-stroke dark:border-strokedark"></div>
              </div>
              <div className="flex justify-end gap-3 md:col-span-12">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded border border-stroke px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  {id ? "Save Changes" : "Create Community"}
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

export default CommunityForm;
