import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FETCH_ALL_AGENTS,
  FETCH_ALL_AGENTS_WITHOUT_PAGINATION,
  HOME_PAGE_VIDEOS,
} from "../../api/constants";

const HomePageVideoForm = () => {
  const [id, setId] = useState();
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    mainVideo: {
      url: "",
      title: "",
      agent: "",
    },
    videos: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(HOME_PAGE_VIDEOS, {
          withCredentials: true,
        });
        if (response.data.homePageVideos) {
          setId(response.data.homePageVideos._id);
          const { mainVideo, videos } = response.data.homePageVideos;

          setFormData({
            mainVideo: {
              url: mainVideo?.url,
              title: mainVideo?.title,
              agent: mainVideo?.agent?._id,
            },
            videos: videos.map((video) => ({
              url: video?.url,
              title: video?.title,
              agent: video?.agent?._id,
            })),
          });
        } else {
          console.log("No existing homepage videos found.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchAgents = async () => {
      try {
        const response = await axios.get(FETCH_ALL_AGENTS_WITHOUT_PAGINATION, {
          withCredentials: true,
        });
        setAgents(response?.data?.agents);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchData();
    fetchAgents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("videos.")) {
      const [_, index, field] = name.split(".");
      setFormData((prevData) => ({
        ...prevData,
        videos: prevData.videos.map((video, i) =>
          i === parseInt(index) ? { ...video, [field]: value } : video
        ),
      }));
    } else {
      const [parentKey, childKey] = name.split(".");
      setFormData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: value,
        },
      }));
    }
  };

  const handleAddVideo = () => {
    setFormData((prevData) => ({
      ...prevData,
      videos: [...prevData.videos, { url: "", title: "", agent: "" }],
    }));
  };

  const handleRemoveVideo = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      videos: prevData.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { mainVideo, videos } = formData;
      const payload = {
        mainVideoUrl: mainVideo.url,
        mainVideoTitle: mainVideo.title,
        mainVideoAgentId: mainVideo.agent,
        additionalVideos: videos.map((video) => ({
          url: video.url,
          title: video.title,
          agentId: video.agent,
        })),
      };

      let response;
      if (id) {
        response = await axios.put(HOME_PAGE_VIDEOS + `/${id}`, payload, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(HOME_PAGE_VIDEOS, payload, {
          withCredentials: true,
        });
      }
      console.log(response.data);
      if (response?.data?.success) toast.success(response?.data?.message);
      else if (!response?.data?.success) toast.error(response?.data?.message);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
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
                {/* Main Video URL */}
                <div className="mb-5 md:col-span-4">
                  <label className="block">Main Video URL</label>
                  <input
                    type="text"
                    name="mainVideo.url"
                    value={formData.mainVideo.url}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Main Video Title */}
                <div className="mb-5 md:col-span-4">
                  <label className="block">Main Video Title</label>
                  <input
                    type="text"
                    name="mainVideo.title"
                    value={formData.mainVideo.title}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Main Video Agent */}
                <div className="mb-5 md:col-span-4">
                  <label className="block">Main Video Agent Id</label>
                  <select
                    name="mainVideo.agent"
                    value={formData.mainVideo.agent}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                  >
                    <option value="" disabled>
                      Select Agent
                    </option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Videos */}
                {formData.videos.map((video, index) => (
                  <div
                    key={index}
                    className="mb-5 grid grid-cols-1 gap-6 md:col-span-6"
                  >
                    <div>
                      <label className="block">{`Video URL ${
                        index + 1
                      }`}</label>
                      <input
                        type="text"
                        name={`videos.${index}.url`}
                        value={video.url}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block">{`Video Title ${
                        index + 1
                      }`}</label>
                      <input
                        type="text"
                        name={`videos.${index}.title`}
                        value={video.title}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block">{`Video Agent ${
                        index + 1
                      }`}</label>
                      <select
                        name={`videos.${index}.agent`}
                        value={video.agent}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                      >
                        <option value="" disabled>
                          Select Agent
                        </option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="inline-flex items-center justify-center rounded-md bg-black  px-5 py-3 font-medium text-white transition hover:bg-blue-600"
                    >
                      Remove Video
                    </button>
                  </div>
                ))}

                {/* Add Video Button */}
                <div className="flex justify-center md:col-span-12">
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-blue-600"
                  >
                    Add Video
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 md:col-span-12">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 font-medium text-white transition hover:bg-opacity-90"
                  >
                    {id ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </DefaultLayout>
  );
};

export default HomePageVideoForm;
