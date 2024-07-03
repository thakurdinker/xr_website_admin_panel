import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FETCH_ALL_POSTS } from "../../api/constants";
import UploadWidget from "../../components/UploadWidget/UploadWidget";

const ContentForm = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    author: { name: "", email: "" },
    category: "",
    tags: [""],
    publish_date: "",
    status: "draft",
    images: [],
    faqs: [{ question: "", answer: "" }],
    meta_title: "",
    meta_description: "",
    keywords: [""],
    schema_org: {
      type: "Article",
      properties: {
        "@context": "https://json-ld.org/contexts/person.jsonld",
        "@id": "http://dbpedia.org/resource/John_Lennon",
        name: "John Lennon",
        born: "1940-10-09",
        spouse: "http://dbpedia.org/resource/Cynthia_Lennon",
      },
    },
    open_graph: { title: "", description: "", image: "", type: "article" },
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch property data based on the ID from your API
    const fetchFormData = async () => {
      try {
        const response = await axios.get(FETCH_ALL_POSTS + `/${id}`);
        setFormData(response.data.content);
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };

    if (id) {
      fetchFormData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNestedChange = (e, parentKey, childKey) => {
    const { name, value } = e.target;
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

  const handleImagesChange = (newImages) => {
    // Create a new array with only the url and description properties
    const imagesToSend = newImages.map((image) => ({
      url: image.url,
      description: image.description || "", // Add this line to handle missing description
    }));

    setFormData((prev) => ({
      ...prev,
      images: imagesToSend,
    }));
  };

  const addFaq = () => {
    setFormData((prevData) => ({
      ...prevData,
      faqs: [...prevData.faqs, { question: "", answer: "" }],
    }));
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make API request using axios
    try {
      if (id) {
        // Update existing property
        const response = await axios.put(FETCH_ALL_POSTS + `/${id}`, formData);
      } else {
        // Create new property
        const response = await axios.post(FETCH_ALL_POSTS, formData);
      }
      navigate("/manage-posts");
    } catch (error) {
      console.error("Error adding/updating property:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-center">
        <div className="grid w-[95vw] lg:w-[60vw]">
          <div className="col-span-full">
            <div className="rounded-lg border bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-12"
              >
                {/* Title */}
                <div className="mb-5 md:col-span-3">
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
                <div className="mb-5 md:col-span-3">
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

                {/* Author Name */}
                <div className="mb-5 md:col-span-3">
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
                <div className="mb-5 md:col-span-3">
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

                {/* Content */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Category */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value.split(", "),
                      })
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Publish Date */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Publish Date</label>
                  <input
                    type="date"
                    name="publish_date"
                    value={formData.publish_date}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Status */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="mb-5 md:col-span-12">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Images
                  </label>
                  {/* Cloudinary Upload Widget */}
                  <UploadWidget
                    isGallery={false}
                    onImagesChange={handleImagesChange}
                    initialImages={formData?.images || []}
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

                {/* Meta Title */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Meta Description */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Meta Description</label>
                  <input
                    type="text"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Keywords */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        keywords: e.target.value.split(", "),
                      })
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Schema Type */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Schema Type</label>
                  <input
                    type="text"
                    name="schema_org.type"
                    value={formData.schema_org.type}
                    onChange={(e) =>
                      handleNestedChange(e, "schema_org", "type")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Open Graph Title */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Open Graph Title</label>
                  <input
                    type="text"
                    name="open_graph.title"
                    value={formData.open_graph.title}
                    onChange={(e) =>
                      handleNestedChange(e, "open_graph", "title")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Open Graph Description */}
                <div className="mb-5 md:col-span-3">
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

                {/* Open Graph Image */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Open Graph Image</label>
                  <input
                    type="text"
                    name="open_graph.image"
                    value={formData.open_graph.image}
                    onChange={(e) =>
                      handleNestedChange(e, "open_graph", "image")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Open Graph Type */}
                <div className="mb-5 md:col-span-3">
                  <label className="block">Open Graph Type</label>
                  <input
                    type="text"
                    name="open_graph.type"
                    value={formData.open_graph.type}
                    onChange={(e) =>
                      handleNestedChange(e, "open_graph", "type")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Schema Properties */}
                <div className="mb-5 md:col-span-12">
                  <label className="block">
                    Schema Properties (JSON format)
                  </label>
                  <textarea
                    name="schema_org.properties"
                    value={JSON.stringify(formData.schema_org.properties)}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
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
                    onClick={() => navigate("/manage-posts")}
                    className="border-gray-300 hover:bg-gray-100 inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 font-medium text-black transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ContentForm;
