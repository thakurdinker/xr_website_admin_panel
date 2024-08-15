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

  const [seoTitle, setSeoTitle] = useState();
  const [seoDescription, setSeoDescription] = useState();
  const [seoKeywords, setSeoKeywords] = useState([]);

  const [ogImage, setOgImage] = useState();
  const [ogType, setOgType] = useState();

  const [developers, setDevelopers] = useState([]);


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
    },
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
      type: ogType,
      properties: {
        "@context": "https://schema.org",
        "@type": ogType,
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
        url: `https://www.xrealty.ae/area/${formData?.slug}`,
      },
    };
  };

  useEffect(() => {
    const fetchAllDevelopers = async () => {
      const response = await axios.get(DEVELOPERS_URL, {
        withCredentials: true,
      });
      console.log(response.data);
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
        setFormData(response.data.community);

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
    // Create a new array with only the url and description properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      description: image.description || "", // Add this line to handle missing description
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

  // const getAmenitiesValue = useCallback(() => {
  //   let amenities = [];
  //   for (let i = 0; i < formData.amenities.icons.length; i++) {
  //     amenities.push(
  //       ...amenitiesOptions.filter(
  //         (icon) => icon.id === formData.amenities.icons[i]
  //       )
  //     );
  //   }

  //   return amenities;
  // }, [formData.amenities.icons, amenitiesOptions]);

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
    try {
      const parsedValue = JSON.parse(value);
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

    formData.open_graph.description = seoDescription;
    formData.open_graph.title = seoTitle;
    formData.open_graph.image = ogImage;

    formData.schema_org = generateSchema();

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
        toast.error(response?.data?.message);
        return;
      } else {
        toast.success(response?.data?.message);
      }
      navigate("/manage-communities");
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
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-12"
            >
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
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
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
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
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
                  min= {1}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
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
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
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
                  value={formData?.location?.city}
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
                  value={formData?.location?.state}
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
                  value={formData?.location?.country}
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
                />
              </div>

              {/* Amenities Name */}
              {/* <div className="mb-5 md:col-span-4 lg:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Amenities Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.amenities.map.name || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div> */}

              {/* Amenities */}
              {/* {formData.amenities.map((amenity, index) => (
                <div key={index} className="mb-5 md:col-span-4 lg:col-span-12">
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Amenities Name
                    </label>
                    <input
                      type="text"
                      name={`amenities[${index}].name`}
                      value={amenity.name}
                      onChange={(e) =>
                        handleArrayChange(e, index, "amenities", "name")
                      }
                      className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    />
                  </div>

                  
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Amenities Icon Url
                    </label>
                    <input
                      type="text"
                      name={`amenities[${index}].icon_url`}
                      value={amenity.icon_url}
                      onChange={(e) =>
                        handleArrayChange(e, index, "amenities", "icon_url")
                      }
                      className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Amenities Description
                    </label>
                    <input
                      type="text"
                      name={`amenities[${index}].description`}
                      value={amenity.description}
                      onChange={(e) =>
                        handleArrayChange(e, index, "amenities", "description")
                      }
                      className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    />
                  </div>
                </div>
              ))} */}

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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
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

              {/* FAQs */}
              <div className="mb-5 md:col-span-12">
                <h3 className="mb-2">FAQs</h3>
                {formData.faqs.map((faq, index) => (
                  <div key={index} className="mb-2">
                    <div className=" flex flex-row justify-between">
                      <label className="block">Question {index + 1}</label>
                      <IoCloseCircle
                        className=" hover:cursor-pointer"
                        color="black"
                        onClick={() => handleFAQDelete(faq, index)}
                      />
                    </div>

                    <input
                      type="text"
                      name={`faqs[${index}].question`}
                      value={faq.question}
                      onChange={(e) =>
                        handleArrayChange(e, index, "faqs", "question")
                      }
                      className="mb-2 w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    />
                    <label className="block">Answer {index + 1}</label>
                    <textarea
                      name={`faqs[${index}].answer`}
                      value={faq.answer}
                      onChange={(e) =>
                        handleArrayChange(e, index, "faqs", "answer")
                      }
                      className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-gray-200 hover:bg-gray-300 mt-2 rounded border border-stroke px-4 py-2 text-black transition dark:border-form-strokedark dark:bg-form-input dark:text-white dark:hover:bg-form-input"
                >
                  Add FAQ
                </button>
              </div>

              {/* SEO */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Description</label>
                <input
                  type="text"
                  name="meta_description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">SEO Keywords </label>
                <input
                  type="text"
                  name="keywords"
                  value={seoKeywords}
                  onChange={(e) => handleNestedChange(e, "seo", "keywords")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Schema */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Schema Type</label>
                <textarea
                  name="schema_org.type"
                  value={ogType}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={JSON.stringify(generateSchema())}
                  onChange={handleSchemaOrgPropertiesChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Open Graph */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Title</label>
                <input
                  type="text"
                  name="title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">Image</label>
                <input
                  type="text"
                  name="image"
                  value={ogImage}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">Description</label>
                <input
                  type="text"
                  name="description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Button */}
              <div className="flex justify-end gap-4 md:col-span-12">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/manage-communities")}
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

export default CommunityForm;
