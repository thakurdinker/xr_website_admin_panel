import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FETCH_ALL_AGENTS } from "../../api/constants";
import UploadWidget from "../../components/UploadWidget/UploadImages";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileForm = () => {
  const { id } = useParams();

  const [seoTitle, setSeoTitle] = useState();
  const [seoDescription, setSeoDescription] = useState();
  const [seoKeywords, setSeoKeywords] = useState([]);

  const [ogImage, setOgImage] = useState();
  const [ogType, setOgType] = useState();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [schemaType, setSchemaType] = useState();
  const [schemaProperties, setSchemaProperties] = useState();

  const [formData, setFormData] = useState({
    name: "",
    name_slug: "",
    email: "",
    phone: "",
    profile_picture: "",
    bio: "",
    personal_info: "",
    education: "",
    experience: 0,
    specialties: "",
    languages: "",
    social_links: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: "",
    },
    video_links: "",
    seo: { meta_title: "", meta_description: "", keywords: "" },
    schema_org: {
      type: "Person",
      properties: {},
    },
    open_graph: { title: "", description: "", image: "" },
    starAgent: false,
    hidden: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch property data based on the ID from your API
    const fetchFormData = async () => {
      try {
        const response = await axios.get(FETCH_ALL_AGENTS + `/${id}`, {
          withCredentials: true,
        });
        setFormData(response.data.agent);

        setSeoTitle(
          response.data.agent.seo.meta_title === ""
            ? response.data.agent.name
            : response.data.agent.seo.meta_title
        );
        setSeoDescription(
          response.data.agent.seo.meta_description === ""
            ? response.data.agent.bio
            : response.data.agent.seo.meta_description
        );

        setSeoKeywords(
          response.data.agent.seo.keywords[0] === ""
            ? response.data.agent.name
            : response.data.agent.seo.keywords
        );

        setOgImage(
          response.data.agent.open_graph.image === ""
            ? response.data.agent.profile_picture
            : response.data.agent.open_graph.image
        );
        setOgType("Person");

        setSchemaType(
          response.data.agent.schema_org.type === ""
            ? ""
            : response.data.agent.schema_org.type
        );

        setSchemaProperties(
          !response.data.agent.schema_org.properties
            ? JSON.stringify({})
            : JSON.stringify(response.data.agent.schema_org.properties)
        );
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
  }, [id]);
  const handleSchemaOrgChange = (e, field) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [parentKey]: { ...prevData[parentKey], [childKey]: value },
    }));
  };

  const generateSchema = () => {
    return {
      // type: "Person",

      "@context": "https://schema.org",
      "@type": schemaType,
      name: seoTitle,
      description: seoDescription,
      image: ogImage,
      url: `https://www.xrealty.ae/agent/${formData.name_slug}/`,
    };
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setSeoTitle(value);
    }

    if (name === "bio") {
      setSeoDescription(value);
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;

    if (name === "meta_title") {
      setSeoTitle(value);
    }

    if (name === "schema_org.type") {
      setSchemaType(value);
      return;
    }

    if (name === "image") {
      setOgImage(value);
    }

    if (name === "meta_description") {
      setSeoDescription(value);
    }

    if (name === "keywords") {
      setSeoKeywords(value);
    }

    if (name === "schema_org.type") {
      setOgType(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [parentKey]: { ...prevData[parentKey], [childKey]: value },
    }));
  };

  const handleImagesChange = (images) => {
    if (images.length > 0) {
      const imageUrl = images[images.length - 1].url;
      setFormData((prevData) => ({ ...prevData, profile_picture: imageUrl }));
    }
  };

  const handleArrayChange = (e, index, arrayName) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: prevData[arrayName].map((item, idx) =>
        idx === index ? value : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: [...prevData[arrayName], ""],
    }));
  };
  const convertStringToArray = (field, delimiter = ",") => {
    if (typeof field === "string") {
      return field.split(delimiter).map((item) => item.trim());
    }
    return field;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.specialties = convertStringToArray(formData.specialties);
    formData.languages = convertStringToArray(formData.languages);
    formData.video_links = convertStringToArray(formData.video_links);
    // formData.seo.keywords = convertStringToArray(formData.seo.keywords);
    formData.seo.keywords = convertStringToArray(seoKeywords);
    formData.seo.meta_description = seoDescription;
    formData.seo.meta_title = seoTitle;

    // formData.schema_org = generateSchema();
    formData.schema_org.type = schemaType;
    formData.open_graph.title = seoTitle;
    formData.open_graph.description = seoDescription;
    formData.open_graph.image = ogImage;

    try {
      let response;
      if (id) {
        // Update existing property
        response = await axios.put(FETCH_ALL_AGENTS + `/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        // Create new property
        const response = await axios.post(FETCH_ALL_AGENTS, formData, {
          withCredentials: true,
        });
      }
      if (response?.data?.success === false) {
        toast.error(response?.data?.message);
        return;
      } else {
        toast.success(response?.data?.message);
      }
      navigate("/manage-agents");
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
              <div className="mb-5 md:col-span-3">
                <label className="block">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Name Slug */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Name Slug</label>
                <input
                  type="text"
                  name="name_slug"
                  value={formData.name_slug}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Email */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Hidden */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Hidden</label>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(phone) =>
                    setFormData((prevData) => ({ ...prevData, phone }))
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-black dark:focus:border-white"
                />
              </div>

              {/* Profile Picture */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Profile Picture
                </label>
                {/* Cloudinary Upload Widget */}

                <UploadWidget
                  isProfilePic="true"
                  onImagesChange={handleImagesChange}
                  initialImages={
                    formData.profile_picture
                      ? [{ url: formData.profile_picture }]
                      : []
                  }
                />
              </div>

              {/* Phone */}
              <div className="mb-5 md:col-span-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Hidden
                </label>
                <select
                  name="hidden"
                  value={formData?.hidden}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* Bio */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Personal Info */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Personal Info</label>
                <textarea
                  name="personal_info"
                  value={formData.personal_info}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Education */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Experience */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Experience</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Specialties */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Specialties</label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Language */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Languages </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Social Links */}
              <div className="mb-5 md:col-span-4">
                <label className="block">LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.social_links.linkedin}
                  onChange={(e) =>
                    handleNestedChange(e, "social_links", "linkedin")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="block">Twitter</label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) =>
                    handleNestedChange(e, "social_links", "twitter")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="block">Facebook</label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.social_links.facebook}
                  onChange={(e) =>
                    handleNestedChange(e, "social_links", "facebook")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">Instagram</label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) =>
                    handleNestedChange(e, "social_links", "instagram")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>
              <div className="mb-5 md:col-span-4">
                <label className="block">Youtube</label>
                <input
                  type="text"
                  name="youtube"
                  value={formData.social_links.youtube}
                  onChange={(e) =>
                    handleNestedChange(e, "social_links", "youtube")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Star Agent */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Star Agent</label>
                <select
                  name="starAgent"
                  value={formData?.starAgent}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* Video Links */}
              <div className="mb-5 md:col-span-12">
                <label className="block">Video Links (Comma Separated) </label>
                <input
                  type="text"
                  name="video_links"
                  value={formData.video_links}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
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
                  value={schemaType}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={schemaProperties}
                  onChange={handleSchemaOrgPropertiesChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />

                <button
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
                  className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                  Generate Schema
                </button>
              </div>

              {/* Open Graph */}
              <div className="mb-5 md:col-span-4">
                <label className="block"> Open Graph Title</label>
                <input
                  type="text"
                  name="title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block"> Open Graph Image</label>
                <input
                  type="text"
                  name="image"
                  value={ogImage}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block"> Open Graph Description</label>
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
                  onClick={() => navigate("/manage-agents")}
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

export default ProfileForm;
