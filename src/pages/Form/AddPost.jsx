import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FETCH_ALL_POSTS } from "../../api/constants";

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
    images: [{ url: "", description: "" }],
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
        console.log(response.data.content, "999999990000");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // Make API request using axios
    try {
      if (id) {
        // Update existing property
        const response = await axios.put(FETCH_ALL_POSTS + `/${id}`, formData);
        console.log(response.data, "0000000");
      } else {
        // Create new property
        const response = await axios.post(FETCH_ALL_POSTS, formData);
        console.log(response.data, "0000000");
      }
      navigate("/manage-posts");
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

              {/* Images */}
              {formData.images.map((image, index) => (
                <div key={index} className="mb-5 md:col-span-6">
                  <label className="block">Image URL</label>
                  <input
                    type="text"
                    name="url"
                    value={image.url}
                    onChange={(e) =>
                      handleArrayChange(e, index, "images", "url")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                  <label className="block">Image Description</label>
                  <input
                    type="text"
                    name="description"
                    value={image.description}
                    onChange={(e) =>
                      handleArrayChange(e, index, "images", "description")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>
              ))}

              {/* FAQs */}
              {formData.faqs.map((faq, index) => (
                <div key={index} className="mb-5 md:col-span-6">
                  <label className="block">FAQ Question</label>
                  <input
                    type="text"
                    name="question"
                    value={faq.question}
                    onChange={(e) =>
                      handleArrayChange(e, index, "faqs", "question")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                  <label className="block">FAQ Answer</label>
                  <input
                    type="text"
                    name="answer"
                    value={faq.answer}
                    onChange={(e) =>
                      handleArrayChange(e, index, "faqs", "answer")
                    }
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>
              ))}

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
                />
              </div>

              {/* Schema Type */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Schema Type</label>
                <input
                  type="text"
                  name="schema_org.type"
                  value={formData.schema_org.type}
                  onChange={(e) => handleNestedChange(e, "schema_org", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Open Graph Title */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Open Graph Title</label>
                <input
                  type="text"
                  name="open_graph.title"
                  value={formData.open_graph.title}
                  onChange={(e) => handleNestedChange(e, "open_graph", "title")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
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
                />
              </div>

              {/* Open Graph Image */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Open Graph Image</label>
                <input
                  type="text"
                  name="open_graph.image"
                  value={formData.open_graph.image}
                  onChange={(e) => handleNestedChange(e, "open_graph", "image")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Open Graph Type */}
              <div className="mb-5 md:col-span-3">
                <label className="block">Open Graph Type</label>
                <input
                  type="text"
                  name="open_graph.type"
                  value={formData.open_graph.type}
                  onChange={(e) => handleNestedChange(e, "open_graph", "type")}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Schema Properties */}
              <div className="mb-5 md:col-span-12">
                <label className="block">Schema Properties (JSON format)</label>
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
    </DefaultLayout>
  );
};

export default ContentForm;
