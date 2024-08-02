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
    </DefaultLayout>
  );
}
