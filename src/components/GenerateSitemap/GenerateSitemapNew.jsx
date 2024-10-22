import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultLayout from "../../layout/DefaultLayout";
import { FETCH_SITEMAP } from "../../api/constants";

const SitemapUpdater = () => {
  const [sitemap, setSitemap] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSitemap();
  }, []);

  const fetchSitemap = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(FETCH_SITEMAP); // Adjust this URL to your sitemap endpoint
      setSitemap(response.data);
    } catch (err) {
      setError("Error fetching sitemap. Please try again.");
    }
    setLoading(false);
  };

  const handleSitemapChange = (e) => {
    setSitemap(e.target.value);
  };

  const handleSitemapUpdate = async () => {
    setUpdating(true);
    setError("");
    try {
      await axios.post(FETCH_SITEMAP, { sitemap }); // Adjust this URL to your update sitemap endpoint
      alert("Sitemap updated successfully!");
    } catch (err) {
      setError("Error updating sitemap. Please try again.");
    }
    setUpdating(false);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Sitemap Updater</h1>

        {loading ? (
          <p className="text-gray-700">Loading sitemap...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <textarea
              value={sitemap}
              onChange={handleSitemapChange}
              className="text-gray-700 h-64 w-full rounded-lg border p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

            <button
              onClick={handleSitemapUpdate}
              disabled={updating}
              className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {updating ? "Updating..." : "Update Sitemap"}
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default SitemapUpdater;
