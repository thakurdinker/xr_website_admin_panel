import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { SITEMAP_GENERATE_URL } from "../../api/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SitemapDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [regenProgress, setRegenProgress] = useState(null);
  const [healthResult, setHealthResult] = useState(null);
  const [healthProgress, setHealthProgress] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const regenEventSourceRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Fetch audit logs on mount
  useEffect(() => {
    fetchAuditLogs();
    // Cleanup SSE on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (regenEventSourceRef.current) {
        regenEventSourceRef.current.close();
      }
    };
  }, []);

  const fetchAuditLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const res = await fetch(
        `${SITEMAP_GENERATE_URL}/audit-logs?page=${page}&limit=20`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
        setLogTotalPages(data.totalPages || 1);
        setLogTotal(data.totalLogs || 0);
        setLogPage(data.currentPage || page);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
    setLogsLoading(false);
  };

  const STEP_LABELS = {
    redirects: "Loading redirects",
    "static-pages": "Adding static pages",
    "seo-pages": "Adding SEO landing pages",
    properties: "Fetching properties",
    communities: "Fetching communities",
    developers: "Fetching developers",
    agents: "Fetching agents",
    blogs: "Fetching blogs",
    news: "Fetching news",
    guides: "Fetching guides",
    articles: "Fetching articles",
    dedup: "Deduplicating URLs",
    write: "Writing sitemap file",
  };

  const handleRegenerate = () => {
    // Close any existing connection
    if (regenEventSourceRef.current) {
      regenEventSourceRef.current.close();
    }

    setLoading(true);
    setStats(null);
    setRegenProgress(null);

    const es = new EventSource(
      `${SITEMAP_GENERATE_URL}/stream`,
      { withCredentials: true }
    );
    regenEventSourceRef.current = es;

    es.addEventListener("progress", (e) => {
      try {
        const data = JSON.parse(e.data);
        setRegenProgress(data);
      } catch (err) {
        console.error("Error parsing regen progress:", err);
      }
    });

    es.addEventListener("done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStats({
          urlCount: data.urlCount,
          elapsed: data.elapsed,
        });
        setRegenProgress(null);
        setLoading(false);
        toast.success(
          `Sitemap regenerated — ${data.urlCount} URLs in ${data.elapsed}ms`
        );
      } catch (err) {
        console.error("Error parsing regen done:", err);
      }
      es.close();
      regenEventSourceRef.current = null;
    });

    es.addEventListener("error", (e) => {
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          toast.error(data.message || "Sitemap generation failed");
        } catch {
          toast.error("Sitemap generation failed");
        }
      } else {
        toast.error("Connection lost — generation may still be running");
      }
      setLoading(false);
      setRegenProgress(null);
      es.close();
      regenEventSourceRef.current = null;
    });
  };

  const handleHealthCheck = () => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setHealthCheckLoading(true);
    setHealthResult(null);
    setHealthProgress(null);

    // Use SSE stream endpoint for real-time progress
    const es = new EventSource(
      `${SITEMAP_GENERATE_URL}/health-check-stream`,
      { withCredentials: true }
    );
    eventSourceRef.current = es;

    es.addEventListener("progress", (e) => {
      try {
        const data = JSON.parse(e.data);
        setHealthProgress(data);
      } catch (err) {
        console.error("Error parsing progress event:", err);
      }
    });

    es.addEventListener("done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setHealthResult(data);
        setHealthProgress(null);
        setHealthCheckLoading(false);

        if (data.badUrls > 0) {
          toast.warn(
            `Found ${data.badUrls} bad URLs — ${data.removed} removed`
          );
        } else {
          toast.success("All sitemap URLs are healthy");
        }

        // Refresh audit logs
        fetchAuditLogs();
      } catch (err) {
        console.error("Error parsing done event:", err);
      }
      es.close();
      eventSourceRef.current = null;
    });

    es.addEventListener("error", (e) => {
      // Check if it's a custom error event with data
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          toast.error(data.message || "Health check failed");
        } catch {
          toast.error("Health check failed");
        }
      } else {
        toast.error("Connection lost — health check may still be running");
      }
      setHealthCheckLoading(false);
      setHealthProgress(null);
      es.close();
      eventSourceRef.current = null;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-AE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const regenPercent =
    regenProgress && regenProgress.totalSteps > 0
      ? Math.round((regenProgress.stepNumber / regenProgress.totalSteps) * 100)
      : 0;

  const progressPercent =
    healthProgress && healthProgress.total > 0
      ? Math.round((healthProgress.checked / healthProgress.total) * 100)
      : 0;

  return (
    <DefaultLayout>
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">
          Sitemap Dashboard
        </h1>

        {/* Action Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Regenerate Card */}
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Regenerate Sitemap
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Rebuilds the sitemap from all data sources (MongoDB + Strapi).
              This also runs automatically every 2 hours and on content changes.
            </p>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="inline-flex items-center rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? (
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
                  Generating...
                </>
              ) : (
                "Regenerate Now"
              )}
            </button>

            {/* Live progress */}
            {loading && regenProgress && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-black dark:text-white">
                    {STEP_LABELS[regenProgress.phase] || regenProgress.phase}
                    {regenProgress.urlCount > 0 && (
                      <span className="ml-1.5 font-normal text-[#637381] dark:text-bodydark">
                        ({regenProgress.urlCount} URLs so far)
                      </span>
                    )}
                  </span>
                  <span className="text-[#637381] dark:text-bodydark">
                    {regenPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-meta-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${regenPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-[#637381] dark:text-bodydark">
                  Step {regenProgress.stepNumber} of {regenProgress.totalSteps}
                  {regenProgress.elapsed > 0 && (
                    <span> · {(regenProgress.elapsed / 1000).toFixed(1)}s</span>
                  )}
                </p>
              </div>
            )}

            {stats && !loading && (
              <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Generated {stats.urlCount} URLs in {(stats.elapsed / 1000).toFixed(1)}s
              </div>
            )}
          </div>

          {/* Health Check Card */}
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
              URL Health Check
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Checks all sitemap URLs for broken links, redirects, and server
              errors. Automatically removes bad URLs. Runs daily at 3:30 AM.
            </p>
            <button
              onClick={handleHealthCheck}
              disabled={healthCheckLoading}
              className="inline-flex items-center rounded bg-warning px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {healthCheckLoading ? (
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
                  Checking...
                </>
              ) : (
                "Run Health Check"
              )}
            </button>

            {/* Live progress bar */}
            {healthCheckLoading && healthProgress && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-black dark:text-white">
                    {healthProgress.phase === "started" && "Starting..."}
                    {healthProgress.phase === "checking" &&
                      `Checking URLs: ${healthProgress.checked} / ${healthProgress.total}`}
                    {healthProgress.phase === "removing" &&
                      `Removing ${healthProgress.badUrls} bad URLs...`}
                  </span>
                  <span className="text-[#637381] dark:text-bodydark">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-meta-4">
                  <div
                    className="h-full rounded-full bg-warning transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {healthProgress.phase === "checking" && healthProgress.total > 0 && (
                  <p className="mt-1.5 text-xs text-[#637381] dark:text-bodydark">
                    {healthProgress.total - healthProgress.checked} URLs remaining
                  </p>
                )}
              </div>
            )}

            {/* Final result */}
            {healthResult && !healthCheckLoading && (
              <div
                className={`mt-4 rounded p-3 text-sm ${
                  healthResult.badUrls > 0
                    ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                <p>
                  Checked: {healthResult.totalChecked} URLs in{" "}
                  {(healthResult.elapsed / 1000).toFixed(1)}s
                </p>
                <p>
                  Bad URLs: {healthResult.badUrls} | Removed:{" "}
                  {healthResult.removed}
                </p>
                {healthResult.auditRunId && (
                  <p className="mt-1 text-xs opacity-70">
                    Run ID: {healthResult.auditRunId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
            How It Works
          </h3>
          <div className="text-gray-600 space-y-2 text-sm dark:text-gray-400">
            <p>
              The sitemap is automatically regenerated every 2 hours and
              whenever you create, update, or delete properties, communities,
              developers, agents, blogs, or redirects.
            </p>
            <p>
              Data sources: MongoDB (properties, communities, developers) +
              Strapi (blogs, news, agents, search pages).
            </p>
            <p>
              A daily health check at 3:30 AM validates all URLs and removes
              any that return errors (404, 500) or permanent redirects (301).
            </p>
            <p className="mt-2">
              <a
                href="https://www.xrealty.ae/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View live sitemap &rarr;
              </a>
            </p>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Audit Logs
              {logTotal > 0 && (
                <span className="ml-2 text-sm font-normal text-[#637381] dark:text-bodydark">
                  ({logTotal} total)
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-primary hover:underline"
            >
              {showLogs ? "Hide" : "Show"}
            </button>
          </div>

          {showLogs && (
            <>
              {logsLoading ? (
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
                    Loading logs...
                  </span>
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm text-[#637381] dark:text-bodydark">
                  No audit logs yet. Run a health check to generate logs.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-meta-4 dark:text-bodydark">
                          <th className="px-3 py-2">URL</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Action</th>
                          <th className="px-3 py-2">Reason</th>
                          <th className="px-3 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, i) => {
                          const logId = log._id || i;
                          const isExpanded = expandedLogId === logId;
                          return (
                            <React.Fragment key={logId}>
                              <tr
                                className="cursor-pointer border-b transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
                                onClick={() =>
                                  setExpandedLogId(isExpanded ? null : logId)
                                }
                              >
                                <td className="max-w-[200px] truncate px-3 py-2">
                                  {log.url}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                                      log.statusCode >= 500
                                        ? "bg-red-100 text-red-700"
                                        : log.statusCode >= 400
                                        ? "bg-yellow-100 text-yellow-700"
                                        : log.statusCode >= 300
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {log.statusCode}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{log.action}</td>
                                <td className="max-w-[150px] truncate px-3 py-2">
                                  {log.reason}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-xs">
                                  {formatDate(log.createdAt)}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="border-b bg-gray-50 dark:border-strokedark dark:bg-meta-4/50">
                                  <td colSpan={5} className="px-3 py-3">
                                    <div className="space-y-1.5 text-xs">
                                      <div>
                                        <span className="font-medium text-black dark:text-white">
                                          URL:{" "}
                                        </span>
                                        <a
                                          href={log.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="break-all text-primary hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {log.url}
                                        </a>
                                      </div>
                                      <div>
                                        <span className="font-medium text-black dark:text-white">
                                          Reason:{" "}
                                        </span>
                                        <span className="text-[#637381] dark:text-bodydark">
                                          {log.reason}
                                        </span>
                                      </div>
                                      {log.redirectTarget && (
                                        <div>
                                          <span className="font-medium text-black dark:text-white">
                                            Redirect Target:{" "}
                                          </span>
                                          <span className="break-all text-[#637381] dark:text-bodydark">
                                            {log.redirectTarget}
                                          </span>
                                        </div>
                                      )}
                                      {log.auditRunId && (
                                        <div>
                                          <span className="font-medium text-black dark:text-white">
                                            Run ID:{" "}
                                          </span>
                                          <span className="text-[#637381] dark:text-bodydark">
                                            {log.auditRunId}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {logTotalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark">
                      <p className="text-xs text-[#637381] dark:text-bodydark">
                        Page {logPage} of {logTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchAuditLogs(logPage - 1)}
                          disabled={logPage <= 1}
                          className="rounded border border-stroke px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchAuditLogs(logPage + 1)}
                          disabled={logPage >= logTotalPages}
                          className="rounded border border-stroke px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-40 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SitemapDashboard;
