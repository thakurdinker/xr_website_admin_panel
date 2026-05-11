import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import UploadGallery from "../../components/UploadWidget/UploadGallery";
import UploadImages from "../../components/UploadWidget/UploadImages";

import Select from "react-select";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FETCH_ALL_AGENTS,
  FETCH_ALL_PROPERTIES,
  FETCH_ALL_PROPERTY_TYPES,
  FETCH_ALL_COMMUNITIES,
  FETCH_ICONS,
  FETCH_ALL_ICONS,
  GET_ALL_COMMUNITIES_DROP_DOWN,
  DEVELOPERS_URL,
} from "../../api/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloseCircle } from "react-icons/io5";
import slugify from "slugify";

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

  payment_plan: "",
  images: [],
  gallery_title_1: "",
  gallery_title_2: "",
  gallery_description_1: "",
  gallery_description_2: "",
  gallery1: [],
  gallery2: [],
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
  show_slideShow: false,
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
  faqs_schema: {
    properties: {},
  },
  seo: {
    meta_title: "",
    meta_description: "",
    keywords: "",
    meta_canonical_url: "",
  },
  schema_org: {
    type: "",
    properties: {},
  },
  open_graph: { title: "", description: "", image: "", type: "" },
  order: 1,
};

const AddProperty = () => {
  const { id } = useParams();
  // Extract the current page number from query parameters
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get("page")) || 1;

  const [developers, setDevelopers] = useState([]);
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [propertyType, setPropertyType] = useState([]);
  const [community, setCommunity] = useState("");
  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [activeTab, setActiveTab] = useState("basic");
  const [seoTitle, setSeoTitle] = useState();
  const [seoDescription, setSeoDescription] = useState();
  const [seoKeywords, setSeoKeywords] = useState([]);
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState([]);

  const [ogImage, setOgImage] = useState();
  const [ogType, setOgType] = useState();
  const [schemaType, setSchemaType] = useState();
  const [schemaProperties, setSchemaProperties] = useState();
  const [faqsSchemaProperties, setFaqsSchemaProperties] = useState();
  const navigate = useNavigate();

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

  const getAmenitiesValue = useCallback(() => {
    let amenities = [];
    for (let i = 0; i < propertyData?.amenities?.icons?.length; i++) {
      amenities.push(
        ...amenitiesOptions.filter(
          (icon) => icon.id === propertyData.amenities.icons[i]
        )
      );
    }

    return amenities;
  });

  const generateFaqsSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: propertyData.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  };

  const cleanPrice = (raw) => {
    if (!raw) return "0";
    return raw.replace(/AED/gi, "").replace(/,/g, "").trim() || "0";
  };

  const generateSchema = () => {
    const propertyUrl = `https://www.xrealty.ae/property/${propertyData?.property_name_slug}/`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: seoTitle || propertyData.property_name,
      description: seoDescription || propertyData.description,
      url: propertyUrl,
      image: ogImage || propertyData.images?.[0]?.url || "",
      offers: {
        "@type": "Offer",
        priceCurrency: "AED",
        price: cleanPrice(propertyData.price),
        url: propertyUrl,
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        )
          .toISOString()
          .split("T")[0],
        availability: "https://schema.org/LimitedAvailability",
      },
    };

    if (propertyData.developer) {
      schema.brand = {
        "@type": "Brand",
        name: propertyData.developer,
      };
    }

    return schema;
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

        setSeoTitle(
          response.data.property.seo.meta_title === ""
            ? response.data.property.property_name
            : response.data.property.seo.meta_title
        );
        setSeoDescription(
          response.data.property.seo.meta_description === ""
            ? response.data.property.section_1.description
            : response.data.property.seo.meta_description
        );
        setSeoKeywords(
          response.data.property.seo.keywords[0] === ""
            ? [
                response.data.property.property_name,
                response.data.property.developer,
                response.data.property.community_name,
              ]
            : response.data.property.seo.keywords
        );

        setOgImage(
          response.data.property.open_graph.image === ""
            ? (typeof response.data.property.gallery1[0] === "string"
                ? response.data.property.gallery1[0]
                : response.data.property.gallery1[0]?.url || "")
            : response.data.property.open_graph.image
        );
        setOgType(
          response.data.property.open_graph.type === ""
            ? response.data.property.type[0].name
            : response.data.property.open_graph.type
        );

        setSchemaType(
          response.data.property.schema_org.type === ""
            ? ""
            : response.data.property.schema_org.type
        );

        setSchemaProperties(
          !response.data.property.schema_org.properties
            ? JSON.stringify({})
            : JSON.stringify(response.data.property.schema_org.properties)
        );

        setFaqsSchemaProperties(
          !response.data.property.faqs_schema.properties
            ? JSON.stringify({})
            : JSON.stringify(response.data.property.faqs_schema.properties)
        );
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
      const response = await axios.get(GET_ALL_COMMUNITIES_DROP_DOWN, {
        withCredentials: true,
      });
      setCommunity(response?.data?.communities);
    };
    fetchAllCommunities();
  }, []);

  useEffect(() => {
    const fetchAllDevelopers = async () => {
      const response = await axios.get(DEVELOPERS_URL, {
        withCredentials: true,
      });
      setDevelopers(response?.data?.data);
    };
    fetchAllDevelopers();
  }, []);

  // Fetch the amenities data and set it in state
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

  const handleFAQDelete = (faq, faqIndex) => {
    let tempFaqs = propertyData.faqs.filter((faq, index) => index !== faqIndex);

    setPropertyData((prev) => {
      return { ...prev, faqs: tempFaqs };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // console.log(e.target.name);

    if (name === "property_name") {
      setSeoTitle(e.target.value);
      setPropertyData((prev) => ({
        ...prev,
        property_name_slug: slugify(value, { lower: true }),
      }));
    }

    if (name === "property_name_slug") {
      setPropertyData((prev) => ({
        ...prev,
        [name]: slugify(value, { lower: true }),
      }));

      return;
    }

    if (name === "community_name") {
      let community_slug = "";
      for (let i = 0; i < community.length; i++) {
        if (community[i].name === value) {
          community_slug = community[i].slug;
          break;
        }
      }

      setSeoKeywords((prev) => {
        if (prev) {
          const newKeywords = [...prev?.filter((i) => i !== value)];
          newKeywords.push(value);
          return newKeywords;
        } else {
          return [value];
        }
      });

      setPropertyData((prev) => ({
        ...prev,
        [name]: value,
        community_name_slug: community_slug,
      }));
    } else if (name === "developer") {
      let developer_slug = "";
      let developer_name = "";
      for (let i = 0; i < developers.length; i++) {
        if (developers[i].developer_name === value) {
          developer_slug = developers[i].developer_slug;
          developer_name = value;
          break;
        }
      }

      setSeoKeywords((prev) => {
        if (prev) {
          const newKeywords = [...prev?.filter((i) => i !== value)];
          newKeywords.push(value);
          return newKeywords;
        } else {
          return [value];
        }
      });

      setPropertyData((prev) => ({
        ...prev,
        [name]: value,
        developer_name_slug: developer_slug,
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImagesChange = (updatedImages) => {
    // Create a new array with only the url, alt, description and heading properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      alt: image.alt || "",
      description: image.description || "",
      heading: image.heading || "",
    }));

    setPropertyData((prev) => ({
      ...prev,
      images: imagesToSend,
    }));
  };

  const handleSchemaOrgPropertiesChange = (e) => {
    const { value } = e.target;

    setSchemaProperties(value);
    try {
      // const parsedValue = JSON.parse(value);
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

  const handleAmenitiesChange = (selectedOptions) => {
    setSelectedAmenities(selectedOptions);
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

  const handleGallery1Change = (updatedGallery) => {
    // Store full objects in state
    setPropertyData((prev) => ({
      ...prev,
      gallery1: updatedGallery,
    }));
  };
  const handleGallery2Change = (updatedGallery) => {
    // Store full objects in state
    setPropertyData((prev) => ({
      ...prev,
      gallery2: updatedGallery,
    }));
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;

    if (name === "meta_title" || name === "title") {
      setSeoTitle(e.target.value);
    }

    if (name === "meta_description" || name === "description") {
      setSeoDescription(e.target.value);
    }

    if (name === "keywords") {
      setSeoKeywords(e.target.value);
    }

    if (name === "image") {
      setOgImage(e.target.value);
    }

    if (name === "type") {
      setOgType(e.target.value);
    }

    if (name === "schema_org.type") {
      setSchemaType(e.target.value);
    }

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

  const handleFaqsSchemaPropertiesChange = (e) => {
    const { value } = e.target;
    setFaqsSchemaProperties(value);

    setPropertyData((prev) => ({
      ...prev,
      faqs_schema: {
        ...prev?.faqs_schema,
        properties: JSON.parse(value),
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

  const handleImageChange = (images) => {
    const lastImage = images[images.length - 1];
    const imagesToSend = {
      image: lastImage.url,
      alt: lastImage.alt || "",
      description: lastImage.description || "",
      heading: lastImage.heading || "",
    };

    setPropertyData((prev) => ({
      ...prev,
      section_1: {
        ...prev.section_1,
        image: imagesToSend.image,
        alt: imagesToSend.alt,
        description: imagesToSend.description,
        heading: imagesToSend.heading,
      },
    }));

    setSeoDescription(imagesToSend.description);

    // if (images.length > 0) {
    //   const imageUrl = images[images.length - 1].url;
    //   const description = images[images.length - 1].description;
    //   const heading = images[images.length - 1].heading;
    //   setPropertyData((prevData) => ({
    //     ...prevData,
    //     section_1: { ...prevData.section_1, image: imageUrl , description:description, heading:heading},
    //   }));
    // }
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

  // const handleFormSubmit = async (e) => {
  //   e.preventDefault();
  //   // Make API request using axios

  //   // propertyData.type = convertStringToArray(propertyData.type);
  //   propertyData.status = convertStringToArray(propertyData.status);
  //   // propertyData.features.amenities = convertStringToArray(
  //   //   propertyData.features.amenities
  //   // );
  //   propertyData.community_features.nearby_facilities = convertStringToArray(
  //     propertyData.community_features.nearby_facilities
  //   );
  //   propertyData.community_features.transportation = convertStringToArray(
  //     propertyData.community_features.transportation
  //   );
  //   // propertyData.seo.keywords = convertStringToArray(propertyData.seo.keywords);
  //   propertyData.seo.keywords = convertStringToArray(seoKeywords);

  //   propertyData.seo.meta_title = seoTitle;
  //   propertyData.seo.meta_description = seoDescription;

  //   propertyData.open_graph.description = seoDescription;
  //   propertyData.open_graph.title = seoTitle;
  //   propertyData.open_graph.image = ogImage;
  //   propertyData.open_graph.type = ogType;

  //   propertyData.schema_org.type = ogType;
  //   propertyData.schema_org = generateSchema();

  //   try {
  //     let response;
  //     if (id) {
  //       // Update existing property
  //       response = await axios.put(
  //         FETCH_ALL_PROPERTIES + `/${id}`,
  //         propertyData,
  //         {
  //           withCredentials: true,
  //         }
  //       );
  //     } else {
  //       // Create new property
  //       response = await axios.post(FETCH_ALL_PROPERTIES, propertyData, {
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

    // Validation
    const errors = [];
    if (!propertyData.property_name?.trim()) errors.push("Property Name is required");
    if (!propertyData.property_name_slug?.trim()) errors.push("Property Name Slug is required");
    if (!propertyData.price?.trim()) errors.push("Price is required");
    if (!propertyData.developer?.trim()) errors.push("Developer is required");
    if (!propertyData.community_name?.trim()) errors.push("Community Name is required");

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      // Switch to the tab containing the first error
      if (!propertyData.property_name?.trim() || !propertyData.property_name_slug?.trim() || !propertyData.price?.trim() || !propertyData.developer?.trim()) {
        setActiveTab("basic");
      } else if (!propertyData.community_name?.trim()) {
        setActiveTab("community");
      }
      return;
    }

    // Auto-generate schema_org and faqs_schema before submit
    const payload = {
      ...propertyData,
      schema_org: {
        type: "RealEstateListing",
        properties: generateSchema(),
      },
      faqs_schema: {
        properties:
          propertyData.faqs?.length > 0 && propertyData.faqs[0]?.question
            ? generateFaqsSchema()
            : propertyData.faqs_schema?.properties || {},
      },
      open_graph: {
        ...propertyData.open_graph,
        image: ogImage || propertyData.open_graph?.image || "",
        type: ogType || propertyData.open_graph?.type || "",
      },
    };

    try {
      let response;
      if (id) {
        // Update existing property
        response = await axios.put(
          `${FETCH_ALL_PROPERTIES}/${id}`,
          payload,
          {
            withCredentials: true,
          }
        );
      } else {
        // Create new property
        response = await axios.post(FETCH_ALL_PROPERTIES, payload, {
          withCredentials: true,
        });
      }

      if (response?.data?.success === false) {
        toast.error(response?.data?.message || "Failed to save property");
      } else {
        toast.success(id ? "Property updated successfully!" : "Property created successfully!");
      }
    } catch (error) {
      console.error("Error adding/updating property:", error);

      // Log detailed error response
      if (error.response && error.response.data) {
        console.error("Server response:", error.response.data);
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };
  // Handler for Cancel button
  const handleCancel = () => {
    // Show a confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmed) {
      navigate(`/manage-properties?page=${currentPage}`);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location & Features" },
    { id: "media", label: "Media & Galleries" },
    { id: "community", label: "Community & Amenities" },
    { id: "settings", label: "Settings" },
    { id: "seo", label: "SEO & Schema" },
  ];

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1200px]">
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate(`/manage-properties?page=${currentPage}`)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#637381] hover:text-primary dark:text-bodydark"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8.175H2.987L9.362 1.688a.727.727 0 000-1.2.727.727 0 00-1.2 0L.4 8.363a.727.727 0 000 1.2l7.763 7.875a.695.695 0 00.6.262.695.695 0 00.6-.225.727.727 0 000-1.2L3.025 9.863H19a.77.77 0 00.825-.825A.77.77 0 0019 8.175z" />
              </svg>
              Back to Properties
            </button>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {id ? "Edit Property" : "Add Property"}
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-stroke bg-white px-2 pt-2 dark:border-strokedark dark:bg-boxdark">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-t-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary bg-primary/5 text-primary"
                      : "text-[#637381] hover:bg-gray-50 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 md:grid-cols-12 lg:p-8"
            >
              {/* ===== BASIC INFO TAB ===== */}
              {activeTab === "basic" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Property Details</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Core information about the property listing</p>
              </div>
              {/* Property Name */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="property_name"
                  value={propertyData?.property_name}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Property Name Slug*/}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Property Name Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="property_name_slug"
                  value={propertyData?.property_name_slug}
                  onChange={handleChange}
                  placeholder="Enter property name slug"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Price */}
              <div className="mb-5 md:col-span-4 lg:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={propertyData?.price}
                  onChange={handleChange}
                  placeholder="Enter property price"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  placeholder='"for sale", "latest", "off-plan"'
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Developer Name */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="developer"
                  value={propertyData?.developer}
                  onChange={handleChange}
                  required
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
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Developer Name Slug
                </label>
                <input
                  disabled
                  type="text"
                  name="developer_name_slug"
                  value={propertyData?.developer_name_slug}
                  placeholder="Enter Developer name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  value={propertyData?.order}
                  onChange={handleChange}
                  min={1}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Section 1 Title */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={propertyData?.section_1?.title}
                  onChange={(e) => handleNestedChange(e, "section_1", "title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Section 1 Image
                </label>

                <UploadImages
                  onImagesChange={handleImageChange}
                  initialImages={
                    propertyData?.section_1
                      ? [
                          {
                            url: propertyData.section_1.image,
                            alt: propertyData.section_1.alt || "",
                            description: propertyData.section_1.description,
                            heading: propertyData.section_1.heading,
                          },
                        ]
                      : []
                  }
                />
              </div>

              {/* Type */}

              <div className="mb-6 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>
                <div className="space-y-4">
                  {Array.isArray(propertyType) &&
                    propertyType.map((type) => (
                      <div
                        key={type.name_slug}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                          <span className="text-gray-800 dark:text-gray-200 font-normal">
                            {type.name}
                          </span>
                        </label>
                        {propertyData.type.some(
                          (t) => t.name === type.name_slug
                        ) && (
                          <div className="ml-4 flex items-center space-x-2">
                            <label className="text-gray-700 dark:text-gray-300 font-normal">
                              Bedrooms
                            </label>

                            <input
                              type="text"
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
                              className="border-gray-300 bg-gray-50 text-gray-800 ark:border-form-strokedark w-20 rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white  dark:focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

                </>
              )}

              {/* ===== LOCATION & FEATURES TAB ===== */}
              {activeTab === "location" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Location & Features</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Property address, coordinates, and key features</p>
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              {/* Payment Plan */}
              <div className="mb-5 md:col-span-4 lg:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Payment Plan
                </label>
                <input
                  type="text"
                  name="payment_plan"
                  value={propertyData?.payment_plan}
                  onChange={handleChange}
                  placeholder="Enter Payment Plan"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

                </>
              )}

              {/* ===== MEDIA & GALLERIES TAB ===== */}
              {activeTab === "media" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Media & Galleries</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Upload property images and manage gallery content</p>
              </div>
              {/* Images */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Images
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadImages
                  onImagesChange={handleImagesChange}
                  initialImages={propertyData?.images || []}
                />
              </div>

              {/* Gallery 1*/}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery 1
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadGallery
                  onImagesChange={handleGallery1Change}
                  initialImages={propertyData.gallery1 || []}
                />
              </div>

              {/* Gallery 2 */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Gallery 2
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadGallery
                  onImagesChange={handleGallery2Change}
                  initialImages={propertyData.gallery2 || []}
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

                </>
              )}

              {/* ===== COMMUNITY & AMENITIES TAB ===== */}
              {activeTab === "community" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Community & Amenities</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Community details, amenities, and FAQs</p>
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

              {/* Community Name */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="community_name"
                  value={propertyData?.community_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>
                    Select community
                  </option>
                  {Array.isArray(community) &&
                    community.map((comm) => (
                      <option key={comm.id} value={comm.name}>
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
                  // onChange={handleChange}
                  placeholder="Enter community name slug"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

                </>
              )}

              {/* ===== SETTINGS TAB ===== */}
              {activeTab === "settings" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">Visibility Settings</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Control how and where this property appears on the website</p>
              </div>
              {/* Toggle switches */}
              <div className="mb-5 md:col-span-12">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Show Property */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-stroke px-4 py-3 transition hover:border-primary dark:border-form-strokedark dark:hover:border-primary">
                    <div>
                      <span className="text-sm font-medium text-black dark:text-white">Show Property</span>
                      <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Visible on the website</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="show_property"
                        checked={propertyData?.show_property === true || propertyData?.show_property === "true"}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, show_property: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`block h-6 w-11 rounded-full transition ${propertyData?.show_property === true || propertyData?.show_property === "true" ? "bg-primary" : "bg-stroke dark:bg-meta-4"}`}></div>
                      <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${propertyData?.show_property === true || propertyData?.show_property === "true" ? "translate-x-5" : ""}`}></div>
                    </div>
                  </label>

                  {/* Featured */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-stroke px-4 py-3 transition hover:border-primary dark:border-form-strokedark dark:hover:border-primary">
                    <div>
                      <span className="text-sm font-medium text-black dark:text-white">Featured</span>
                      <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Highlight on homepage</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={propertyData?.featured === true || propertyData?.featured === "true"}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`block h-6 w-11 rounded-full transition ${propertyData?.featured === true || propertyData?.featured === "true" ? "bg-primary" : "bg-stroke dark:bg-meta-4"}`}></div>
                      <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${propertyData?.featured === true || propertyData?.featured === "true" ? "translate-x-5" : ""}`}></div>
                    </div>
                  </label>

                  {/* SlideShow */}
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-stroke px-4 py-3 transition hover:border-primary dark:border-form-strokedark dark:hover:border-primary">
                    <div>
                      <span className="text-sm font-medium text-black dark:text-white">Slideshow</span>
                      <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Newly Launched carousel</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="show_slideShow"
                        checked={propertyData?.show_slideShow === true || propertyData?.show_slideShow === "true"}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, show_slideShow: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`block h-6 w-11 rounded-full transition ${propertyData?.show_slideShow === true || propertyData?.show_slideShow === "true" ? "bg-primary" : "bg-stroke dark:bg-meta-4"}`}></div>
                      <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${propertyData?.show_slideShow === true || propertyData?.show_slideShow === "true" ? "translate-x-5" : ""}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* About Project section divider */}
              <div className="md:col-span-12">
                <div className="my-2 border-t border-stroke dark:border-strokedark"></div>
                <h3 className="text-base font-semibold text-black dark:text-white">About Project</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Project overview content displayed on the property page</p>
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* About Project Description */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  About Project Description
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={propertyData?.about_project?.description}
                  onChange={(e) =>
                    handleNestedChange(e, "about_project", "description")
                  }
                  placeholder="Enter a description of the project..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

                </>
              )}

              {/* ===== SEO & SCHEMA TAB ===== */}
              {activeTab === "seo" && (
                <>
              <div className="md:col-span-12">
                <h3 className="text-base font-semibold text-black dark:text-white">SEO & Structured Data</h3>
                <p className="mt-1 text-xs text-[#637381] dark:text-bodydark">Search engine optimization, meta tags, and schema markup</p>
              </div>
              {/* SEO */}
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="meta_description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Meta Canonical Url
                </label>
                <input
                  type="text"
                  value={propertyData?.seo?.meta_canonical_url}
                  name="meta_canonical_url"
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_canonical_url")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  SEO Keywords (comma seperated)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={seoKeywords}
                  onChange={(e) => handleNestedChange(e, "seo", "keywords")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Schema */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Schema Type</label>
                <textarea
                  name="schema_org.type"
                  value={schemaType}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={schemaProperties}
                  onChange={handleSchemaOrgPropertiesChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSchemaProperties(JSON.stringify(generateSchema()));
                    try {
                      setPropertyData((prevData) => ({
                        ...prevData,
                        schema_org: {
                          ...prevData?.schema_org,
                          properties: generateSchema(),
                        },
                      }));
                    } catch (error) {
                      // Handle JSON parse error if needed
                      console.error("Invalid JSON format");
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                  Generate Schema
                </button>
              </div>

              {/* Open Graph */}
              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Image
                </label>
                <input
                  type="text"
                  name="image"
                  value={ogImage}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-5 md:col-span-3">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Open Graph Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={ogType}
                  onChange={(e) => handleNestedChange(e, "open_graph", "type")}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* FAQs */}
              <div className="mb-5 md:col-span-12">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black dark:text-white">FAQs</h3>
                    <p className="mt-0.5 text-xs text-[#637381] dark:text-bodydark">Add frequently asked questions about this property</p>
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
                  {propertyData.faqs.map((faq, index) => (
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
                {propertyData.faqs.length === 0 && (
                  <div className="rounded-lg border border-dashed border-stroke py-8 text-center dark:border-form-strokedark">
                    <p className="text-sm text-[#637381] dark:text-bodydark">No FAQs added yet. Click "+ Add FAQ" to get started.</p>
                  </div>
                )}
              </div>

              {/* Faqs Schema */}
              <div className="mb-5 md:col-span-8">
                <label className="block">
                  Faqs Schema Properties (JSON format)
                </label>
                <textarea
                  name="faqs_schema.properties"
                  value={faqsSchemaProperties}
                  onChange={handleFaqsSchemaPropertiesChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFaqsSchemaProperties(
                      JSON.stringify(generateFaqsSchema())
                    );
                    try {
                      setPropertyData((prevData) => ({
                        ...prevData,
                        faqs_schema: {
                          ...prevData?.faqs_schema,
                          properties: generateFaqsSchema(),
                        },
                      }));
                    } catch (error) {
                      // Handle JSON parse error if needed
                      console.error("Invalid JSON format");
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                  Generate Faqs Schema
                </button>
              </div>

                </>
              )}

              {/* Buttons — always visible */}
              <div className="flex justify-end gap-4 md:col-span-12">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
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
      <ToastContainer />
    </DefaultLayout>
  );
};
export default AddProperty;
