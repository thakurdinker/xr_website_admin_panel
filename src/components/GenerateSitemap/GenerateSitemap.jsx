import React, { useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import Buttons from "../../pages/UiElements/Buttons";
import { Link } from "react-router-dom";
import axios from "axios";
import { SITEMAP_GENERATE_URL } from "../../api/constants";

export default function GenerateSitemap() {
  const [generating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    setIsGenerating(true);
    const res = await axios.get(SITEMAP_GENERATE_URL, {
      withCredentials: true,
    });

    if (res.data.success === true) {
      alert("Sitemap generated successfully");
      setIsGenerating(false);
    } else {
      setIsGenerating(false);
      alert("Failed to generate sitemap");
    }
  };

  return (
    <DefaultLayout>
      <Link
        onClick={(e) => {
          e.preventDefault();
          if (!generating) {
            handleClick();
          }
        }}
        to="#"
        className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        Generate Sitemap
      </Link>

      <div>
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Upload SiteMap
        </label>
        <input
          type="text"
          name="keywords"
          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-black active:border-black disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-black"
        />
      </div>
    </DefaultLayout>
  );
}
