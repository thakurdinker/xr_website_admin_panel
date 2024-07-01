import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

const HomePageVideoForm = () => {
  const [id, setId] = useState();
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    mainVideo: {
      url: "",
      agent: "",
    },
    videos: [
      { url: "", agent: "" },
      { url: "", agent: "" },
      { url: "", agent: "" },
      { url: "", agent: "" },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3333/homePageVideo");
        if (response.data.homePageVideos) {
          setId(response.data.homePageVideos._id);
          const { mainVideo, videos } = response.data.homePageVideos;

          setFormData({
            mainVideo: {
              url: mainVideo.url,
              agent: mainVideo.agent._id,
            },
            videos: videos.map((video) => ({
              url: video.url,
              agent: video.agent._id,
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
        const response = await axios.get("http://localhost:3333/agents");
        setAgents(response.data.agents);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { mainVideo, videos } = formData;
      const payload = {
        mainVideoUrl: mainVideo.url,
        mainVideoAgentId: mainVideo.agent,
        additionalVideos: videos.map((video) => ({
          url: video.url,
          agentId: video.agent,
        })),
      };

      let response;
      if (id) {
        response = await axios.put(`http://localhost:3333/homePageVideo/${id}`, payload);
      } else {
        response = await axios.post("http://localhost:3333/homePageVideo", payload);
      }
      console.log("Form data submitted:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
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
                <div className="mb-5 md:col-span-6">
                  <label className="block">Main Video URL</label>
                  <input
                    type="text"
                    name="mainVideo.url"
                    value={formData.mainVideo.url}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  />
                </div>

                {/* Main Video Agent */}
                <div className="mb-5 md:col-span-6">
                  <label className="block">Main Video Agent Id</label>
                  <select
                    name="mainVideo.agent"
                    value={formData.mainVideo.agent}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                    required
                  >
                    <option value="" disabled>Select Agent</option>
                    {agents.map(agent => (
                      <option key={agent._id} value={agent._id}>{agent.name}</option>
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
                      <label className="block">{`Video URL ${index + 1}`}</label>
                      <input
                        type="text"
                        name={`videos.${index}.url`}
                        value={video.url}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block">{`Video Agent ${index + 1}`}</label>
                      <select
                        name={`videos.${index}.agent`}
                        value={video.agent}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-black dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-white"
                        required
                      >
                        <option value="" disabled>Select Agent</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

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
    </DefaultLayout>
  );
};

export default HomePageVideoForm;
