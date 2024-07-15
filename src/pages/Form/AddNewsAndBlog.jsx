import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UploadWidget from "../../components/UploadWidget/UploadImages"; // Assuming this is a component for image upload
import { NEWS, NEWS_AND_INSIGHTS } from "../../api/constants";
import UploadImages from "../../components/UploadWidget/UploadImages";

const HomePageVideoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      properties: {
        author: "",
      },
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
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(NEWS + `/${id}`, {
          withCredentials: true,
        });
        setFormData(response.data.content);
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
        console.log(response.data.categories);
        setCategories(response.data.categories);
        // setFormData(response.data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
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
    const { value } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    formData.seo.keywords = convertStringToArray(formData.seo.keywords);
    try {
      if (id) {
        await axios.put(NEWS + `/${id}`, formData, { withCredentials: true });
      } else {
        const res = await axios.post(NEWS, formData, { withCredentials: true });
      }
      navigate("/manage-news-and-insights");
    } catch (error) {
      console.error("Error saving form data:", error);
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
              <div className="mb-5 md:col-span-6">
                <label className="block">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* Slug */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
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
                  required
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
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-5 md:col-span-6">
                <label className="block">Category</label>
                {/* <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                /> */}

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                >
                  {categories?.map((category) => (
                    console.log(category,"ppp"),
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
                    required
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
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>

              {/* SEO Meta Title */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Title</label>
                <input
                  type="text"
                  name="seo.meta_title"
                  value={formData.seo.meta_title}
                  onChange={(e) => handleNestedChange(e, "seo", "meta_title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* SEO Meta Description */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Meta Description</label>
                <input
                  type="text"
                  name="seo.meta_description"
                  value={formData.seo.meta_description}
                  onChange={(e) =>
                    handleNestedChange(e, "seo", "meta_description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* SEO Keywords */}
              <div className="mb-5 md:col-span-4">
                <label className="block">SEO Keywords</label>
                <input
                  type="text"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={(e) => handleNestedChange(e, "seo", "keywords")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-4">
                <label className="block">Schema Type</label>
                <textarea
                  name="schema_org.type"
                  value={JSON.stringify(formData.schema_org.type)}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              <div className="mb-5 md:col-span-8">
                <label className="block">Schema Properties (JSON format)</label>
                <textarea
                  name="schema_org.properties"
                  value={JSON.stringify(formData.schema_org.properties)}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* Open Graph Title */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Title</label>
                <input
                  type="text"
                  name="open_graph.title"
                  value={formData.open_graph.title}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* Open Graph Image */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Image</label>
                <input
                  type="text"
                  name="open_graph.image"
                  value={formData.open_graph.image}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* Open Graph Description */}
              <div className="mb-5 md:col-span-4">
                <label className="block">Open Graph Description</label>
                <input
                  type="text"
                  name="open_graph.description"
                  value={formData.open_graph.description}
                  onChange={(e) =>
                    handleNestedChange(e, "open_graph", "description")
                  }
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  required
                />
              </div>

              {/* FAQs */}
              <div className="mb-5 md:col-span-12">
                <h3 className="mb-2">FAQs</h3>
                {formData.faqs.map((faq, index) => (
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
    </DefaultLayout>
  );
};

export default HomePageVideoForm;
