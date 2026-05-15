import React, { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { PRERENDER_CACHE } from "../../api/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrerenderCacheDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [clearSingleLoading, setClearSingleLoading] = useState(false);
  const [singlePath, setSinglePath] = useState("");
  const [clearResult, setClearResult] = useState(null);

  // Prerender.io API states
  const [prerenderUrl, setPrerenderUrl] = useState("");
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [recacheLoading, setRecacheLoading] = useState(false);
  const [purgeRecacheLoading, setPurgeRecacheLoading] = useState(false);
  const [prerenderResult, setPrerenderResult] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${PRERENDER_CACHE}/stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching cache stats:", err);
      toast.error("Failed to fetch cache stats");
    }
    setStatsLoading(false);
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear ALL cached redirects? This will cause the next request for each redirect URL to hit prerender.io again (consuming credits)."
      )
    ) {
      return;
    }

    setClearAllLoading(true);
    setClearResult(null);
    try {
      const res = await fetch(`${PRERENDER_CACHE}/all`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClearResult({ type: "all", data });
      toast.success(data.message || "All cached redirects cleared");
      fetchStats();
    } catch (err) {
      console.error("Error clearing all cache:", err);
      toast.error("Failed to clear cache");
    }
    setClearAllLoading(false);
  };

  const handleClearSingle = async (e) => {
    e.preventDefault();
    const pathToDelete = singlePath.trim();
    if (!pathToDelete) {
      toast.warn("Please enter a URL path");
      return;
    }

    setClearSingleLoading(true);
    setClearResult(null);
    try {
      const res = await fetch(
        `${PRERENDER_CACHE}/single?path=${encodeURIComponent(pathToDelete)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
      setClearResult({ type: "single", path: pathToDelete, data });
      if (data.success) {
        toast.success(`Cleared cache for ${pathToDelete}`);
        setSinglePath("");
      } else {
        toast.info(data.error || data.message || "Path not found in cache");
      }
      fetchStats();
    } catch (err) {
      console.error("Error clearing single path:", err);
      toast.error("Failed to clear path from cache");
    }
    setClearSingleLoading(false);
  };

  // ── Prerender.io API handlers ──
  const handlePrerenderAction = async (action) => {
    const urlValue = prerenderUrl.trim();
    if (!urlValue) {
      toast.warn("Please enter a URL or path");
      return;
    }

    const setLoading =
      action === "purge"
        ? setPurgeLoading
        : action === "recache"
        ? setRecacheLoading
        : setPurgeRecacheLoading;

    setLoading(true);
    setPrerenderResult(null);

    try {
      const endpoint =
        action === "purge"
          ? "purge"
          : action === "recache"
          ? "recache"
          : "purge-and-recache";

      const res = await fetch(`${PRERENDER_CACHE}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlValue }),
      });

      const data = await res.json();
      setPrerenderResult({ action, data });

      if (data.success) {
        toast.success(data.message);
        if (action !== "recache") setPrerenderUrl("");
      } else {
        toast.error(data.message || `${action} failed`);
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
      toast.error(`Failed to ${action}`);
    }
    setLoading(false);
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-AE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <DefaultLayout>
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">
          Prerender Cache
        </h1>

        {/* Stats Card */}
        <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Cache Stats
            </h3>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {statsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {statsLoading && !stats ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="h-6 w-6 animate-spin text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="ml-2 text-sm text-[#637381] dark:text-bodydark">
                Loading stats...
              </span>
            </div>
          ) : stats ? (
            <div>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-meta-4">
                  <p className="text-xs font-medium uppercase text-[#637381] dark:text-bodydark">
                    Cached Redirects
                  </p>
                  <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                    {stats.totalEntries ?? "—"}
                  </p>
                </div>
                <div className="rounded-md bg-gray-50 p-4 dark:bg-meta-4">
                  <p className="text-xs font-medium uppercase text-[#637381] dark:text-bodydark">
                    Max Capacity
                  </p>
                  <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                    {stats.maxEntries ?? "—"}
                  </p>
                </div>
                <div className="rounded-md bg-gray-50 p-4 dark:bg-meta-4">
                  <p className="text-xs font-medium uppercase text-[#637381] dark:text-bodydark">
                    TTL
                  </p>
                  <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                    {stats.ttlHours ? `${stats.ttlHours}h` : "12h"}
                  </p>
                </div>
              </div>

              {/* Sample entries */}
              {stats.sample && stats.sample.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-black dark:text-white">
                    Recent Entries ({stats.sample.length} shown)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-meta-4 dark:text-bodydark">
                          <th className="px-3 py-2">Path</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Redirect To</th>
                          <th className="px-3 py-2">Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.sample.map((entry, i) => (
                          <tr
                            key={i}
                            className="border-b transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
                          >
                            <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">
                              {entry.path}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-medium ${
                                  entry.status === 301
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {entry.status}
                              </span>
                            </td>
                            <td className="max-w-[200px] truncate px-3 py-2 text-xs">
                              {entry.location}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-xs">
                              {entry.ageMinutes != null
                                ? entry.ageMinutes < 60
                                  ? `${entry.ageMinutes}m ago`
                                  : `${Math.round(entry.ageMinutes / 60)}h ago`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#637381] dark:text-bodydark">
              Could not load stats. Make sure the frontend server is running and
              ADMIN_SECRET is configured.
            </p>
          )}
        </div>

        {/* Action Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Clear Single Path */}
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Clear Single Path
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Remove a specific URL path from the redirect cache. Use this when
              a previously broken URL has been fixed.
            </p>
            <form onSubmit={handleClearSingle}>
              <div className="mb-3">
                <input
                  type="text"
                  value={singlePath}
                  onChange={(e) => setSinglePath(e.target.value)}
                  placeholder="/property/some-slug/"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={clearSingleLoading || !singlePath.trim()}
                className="inline-flex items-center rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {clearSingleLoading ? (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Clearing...
                  </>
                ) : (
                  "Clear Path"
                )}
              </button>
            </form>

            {clearResult && clearResult.type === "single" && (
              <div className="mt-3 rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {clearResult.data.message ||
                  `Cleared: ${clearResult.path}`}
              </div>
            )}
          </div>

          {/* Clear All */}
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Clear All Cache
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Remove all cached redirects from server memory. Next visit to each
              URL will re-fetch from prerender.io (uses credits). Strapi entries
              expire naturally via TTL.
            </p>
            <button
              onClick={handleClearAll}
              disabled={clearAllLoading}
              className="inline-flex items-center rounded bg-danger px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {clearAllLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Clearing...
                </>
              ) : (
                "Clear All Redirects"
              )}
            </button>

            {clearResult && clearResult.type === "all" && (
              <div className="mt-3 rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {clearResult.data.entriesCleared != null
                  ? `Cleared ${clearResult.data.entriesCleared} cached redirects`
                  : clearResult.data.message || "All cached redirects cleared"}
              </div>
            )}
          </div>
        </div>

        {/* Prerender.io API Card */}
        <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
            Prerender.io Cache (CDN)
          </h3>
          <p className="text-gray-500 mb-4 text-sm">
            Purge and recache URLs on prerender.io directly. Use{" "}
            <strong>Purge & Recache</strong> when you've updated meta tags or
            content and need prerender.io to pick up the changes.
          </p>

          <div className="mb-4">
            <input
              type="text"
              value={prerenderUrl}
              onChange={(e) => setPrerenderUrl(e.target.value)}
              placeholder="https://www.xrealty.ae/property/some-slug/ or /property/some-slug/"
              className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handlePrerenderAction("purge-and-recache")}
              disabled={purgeRecacheLoading || !prerenderUrl.trim()}
              className="inline-flex items-center rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {purgeRecacheLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Purging & Recaching...
                </>
              ) : (
                "Purge & Recache"
              )}
            </button>

            <button
              onClick={() => handlePrerenderAction("purge")}
              disabled={purgeLoading || !prerenderUrl.trim()}
              className="inline-flex items-center rounded border border-primary bg-transparent px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {purgeLoading ? "Purging..." : "Purge Only"}
            </button>

            <button
              onClick={() => handlePrerenderAction("recache")}
              disabled={recacheLoading || !prerenderUrl.trim()}
              className="inline-flex items-center rounded border border-primary bg-transparent px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {recacheLoading ? "Recaching..." : "Recache Only"}
            </button>
          </div>

          {prerenderResult && (
            <div
              className={`mt-4 rounded p-3 text-sm ${
                prerenderResult.data.success
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {prerenderResult.data.message}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
            How It Works
          </h3>
          <div className="text-gray-600 space-y-2 text-sm dark:text-gray-400">
            <p>
              The prerender middleware serves pre-rendered HTML to all visitors.
              When a URL returns a redirect (301/302) from prerender.io, the
              redirect is cached in server memory and persisted to Strapi so
              future requests replay instantly without consuming prerender credits.
            </p>
            <p>
              Cached redirects expire automatically after 12 hours (TTL). Use
              the controls above to clear them manually when a URL has been
              fixed or a slug has changed.
            </p>
            <p>
              Clearing a single path removes it from both server memory and
              Strapi. Clearing all only empties server memory — Strapi entries
              expire naturally on the next TTL cycle.
            </p>
            <p className="mt-2 border-t border-stroke pt-2 dark:border-strokedark">
              <strong>Prerender.io CDN Cache:</strong> When you update meta
              tags or page content, prerender.io still serves the old cached
              version. Use <em>Purge & Recache</em> to delete the old version
              from prerender.io's CDN and trigger a fresh render. This ensures
              updated meta tags, OG images, and content are picked up.
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PrerenderCacheDashboard;
