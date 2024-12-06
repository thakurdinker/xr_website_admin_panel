import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UploadWidget from "../../components/UploadWidget/UploadImages"; // Assuming this is a component for image upload
import { NEWS, NEWS_AND_INSIGHTS } from "../../api/constants";
import UploadImages from "../../components/UploadWidget/UploadImages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloseCircle } from "react-icons/io5";

const AddNewsAndBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Extract the current page number from query parameters
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get("page")) || 1;

  const [seoTitle, setSeoTitle] = useState();
  const [seoDescription, setSeoDescription] = useState();
  const [seoKeywords, setSeoKeywords] = useState([]);

  const [ogImage, setOgImage] = useState();
  const [ogType, setOgType] = useState();

  const [schemaType, setSchemaType] = useState();
  const [schemaProperties, setSchemaProperties] = useState();

  const [categories, setCategories] = useState();
  const [formData, setFormData] = useState({
    author: {
      name: "",
      email: "",
    },
    seo: {
      meta_title: "",
      meta_description: "",
      keywords: [],
    },
    schema_org: {
      type: "Article",
      properties: {},
    },
    open_graph: {
      title: "",
      description: "",
      image: "",
      type: "article",
    },
    title: "",
    slug: "",
    content: "",
    featured_image: "",
    category: "article",
    tags: [],
    publish_date: "",
    status: "published",
    images: [],
    faqs: [{ question: "", answer: "" }],
    order: 1,
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(NEWS + `/${id}`, {
          withCredentials: true,
        });
        setFormData(response.data.content);

        setSeoTitle(
          response.data.content.seo.meta_title === ""
            ? response.data.content.title
            : response.data.content.seo.meta_title
        );
        setSeoDescription(response.data.content.seo.meta_description);
        setSeoKeywords(response.data.content.seo.keywords);

        setOgImage(response.data.content.featured_image);
        setOgType(response.data.content.schema_org.type);

        setSchemaType(
          response.data.content.schema_org.type === ""
            ? ""
            : response.data.content.schema_org.type
        );

        setSchemaProperties(
          !response.data.content.schema_org.properties
            ? JSON.stringify({})
            : JSON.stringify(response.data.content.schema_org.properties)
        );
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
  }, [id]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(NEWS_AND_INSIGHTS);
        setCategories(response.data.categories);
        // setFormData(response.data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    fetchFormData();
  }, []);

  const addFaq = () => {
    setFormData((prevData) => ({
      ...prevData,
      faqs: [...prevData.faqs, { question: "", answer: "" }],
    }));
  };

  function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1 and pad with 0
    const day = String(date.getDate()).padStart(2, "0"); // Pad with 0 if necessary
    return `${year}-${month}-${day}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setSeoTitle(e.target.value);
    }

    if (name === "content") {
      const minifiedContent = minifyHTML(value);
      setFormData({ ...formData, [name]: minifiedContent });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const minifyHTML = (html) => {
    return html
      .replace(/>\s+</g, "><") // Remove spaces between tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/>\s*/g, ">") // Remove spaces after tags
      .replace(/\s*</g, "<"); // Remove spaces before tags
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;

    if (name === "seo.meta_title") {
      setSeoTitle(value);
    }

    if (name === "seo.meta_description") {
      setSeoDescription(value);
    }

    if (name === "seo.keywords") {
      setSeoKeywords(value);
    }
    if (name === "schema_org.type") {
      setOgType(value);
      setSchemaType(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [parentKey]: { ...prevData[parentKey], [childKey]: value },
    }));
  };

  const handleArrayChange = (e, index, arrayName, fieldName) => {
    const { value } = e.target;
    const updatedArray = formData[arrayName].map((item, idx) =>
      idx === index ? { ...item, [fieldName]: value } : item
    );
    setFormData((prevData) => ({ ...prevData, [arrayName]: updatedArray }));
  };

  const handleTagsChange = (e, index, arrayName) => {
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

  const handleImagesChange = (updatedImages) => {
    // Create a new array with only the url and description properties
    const imagesToSend = updatedImages.map((image) => ({
      url: image.url,
      description: image.description || " ", // Add this line to handle missing description
    }));

    setFormData((prev) => ({
      ...prev,
      images: imagesToSend,
    }));
  };

  const convertStringToArray = (field, delimiter = ",") => {
    if (typeof field === "string") {
      return field.split(delimiter).map((item) => item.trim());
    }
    return field;
  };

  const handleSchemaOrgPropertiesChange = (e) => {
    const { name, value } = e.target;
    setSchemaProperties(value);
    try {
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

  const generateSchema = () => {
    return {
      // type: ogType,

      "@context": "https://schema.org",
      "@type": schemaType,
      name: seoTitle,
      description: seoDescription,
      // address: {
      //   "@type": "PostalAddress",
      //   streetAddress: "123 Marina Walk",
      //   addressLocality: "Dubai",
      //   addressRegion: "Dubai",
      //   postalCode: "00000",
      //   addressCountry: "AE",
      // },
      // offers: {
      //   "@type": "Offer",
      //   priceCurrency: "AED",
      //   price: "3500000",
      //   itemCondition: "https://schema.org/NewCondition",
      //   availability: "https://schema.org/InStock",
      //   seller: {
      //     "@type": "RealEstateAgent",
      //     name: "Xperience Realty",
      //     url: "https://www.xperiencerealty.com",
      //     logo: "https://www.xperiencerealty.com/logo.png",
      //     contactPoint: {
      //       "@type": "ContactPoint",
      //       telephone: "+971-4-123-4567",
      //       contactType: "Sales",
      //       areaServed: "Dubai, UAE",
      //       availableLanguage: ["English", "Arabic"],
      //     },
      //   },
      // },
      image: ogImage,
      // floorSize: {
      //   "@type": "QuantitativeValue",
      //   value: 2500,
      //   unitCode: "SQF",
      // },
      url: `https://www.xrealty.ae/${formData?.slug}/`,
    };
  };

  const handleFAQDelete = (faq, faqIndex) => {
    let tempFaqs = formData.faqs.filter((faq, index) => index !== faqIndex);

    setFormData((prev) => {
      return { ...prev, faqs: tempFaqs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // formData.seo.keywords = convertStringToArray(formData.seo.keywords);
    formData.seo.keywords = convertStringToArray(seoKeywords);
    formData.seo.meta_title = seoTitle;
    formData.seo.meta_description = seoDescription;
    formData.open_graph.type = ogType;
    formData.open_graph.image = ogImage;
    formData.open_graph.title = seoTitle;
    formData.open_graph.description = seoDescription;

    // formData.schema_org = generateSchema();
    formData.schema_org.type = schemaType;
    try {
      let response;
      if (id) {
        response = await axios.put(NEWS + `/${id}`, formData, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(NEWS, formData, { withCredentials: true });
      }
      if (response?.data?.success === false) {
        toast.error(response?.data?.message);
        return;
      } else {
        toast.success(response?.data?.message);
        navigate(`/manage-news-and-insights?page=${currentPage}`);
      }
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      navigate(`/manage-news-and-insights?page=${currentPage}`);
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
              {/* Title */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Slug */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Slug</label>
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
                <label className="block">Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData?.order}
                  onChange={handleChange}
                  min={1}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Content */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  style={{ minHeight: "50vh" }}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Preview */}
              <div className="mb-5 md:col-span-8">
                <label className="block">Preview</label>
                <div
                  className="border border-stroke p-4"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>

              {/* Featured Image */}
              <div className="mb-5 md:col-span-12">
                <label className="block">Featured Image</label>
                <input
                  type="text"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Category */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  {categories?.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Tags</label>
                {formData.tags.map((tag, index) => (
                  <input
                    key={index}
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagsChange(e, index, "tags")}
                    className="mb-2 w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("tags")}
                  className="text-blue-500"
                >
                  + Add Tag
                </button>
              </div>

              {/* Publish Date */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Publish Date</label>
                <input
                  type="date"
                  name="publish_date"
                  value={formatDateToYYYYMMDD(formData.publish_date)}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Status */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Images */}
              <div className="mb-5 md:col-span-12">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Images
                </label>
                {/* Cloudinary Upload Widget */}
                <UploadImages
                  newsAndBlog="true"
                  onImagesChange={handleImagesChange}
                  initialImages={formData?.images || []}
                />
              </div>

              {/* Author Name */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Author Name</label>
                <input
                  type="text"
                  name="author.name"
                  value={formData.author.name}
                  onChange={(e) => handleNestedChange(e, "author", "name")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Author Email */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Author Email</label>
                <input
                  type="email"
                  name="author.email"
                  value={formData.author.email}
                  onChange={(e) => handleNestedChange(e, "author", "email")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* SEO Meta Title */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Title</label>
                <input
                  type="text"
                  name="seo.meta_title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* SEO Meta Description */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Description</label>
                <input
                  type="text"
                  name="seo.meta_description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* SEO Keywords */}
              <div className="mb-5 md:col-span-4">
                <label className="block">SEO Keywords</label>
                <input
                  type="text"
                  name="seo.keywords"
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

              {/* Open Graph Title */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Title</label>
                <input
                  type="text"
                  name="open_graph.title"
                  value={seoTitle}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Open Graph Image */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Image</label>
                <input
                  type="text"
                  name="open_graph.image"
                  value={ogImage}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Open Graph Description */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Description</label>
                <input
                  type="text"
                  name="open_graph.description"
                  value={seoDescription}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
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

export default AddNewsAndBlog;
