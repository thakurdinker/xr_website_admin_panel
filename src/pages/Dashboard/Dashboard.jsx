import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DefaultLayout from "../../layout/DefaultLayout";
import { DASHBOARD_STATS } from "../../api/constants";

const StatCard = ({ title, count, icon, color, link }) => (
  <Link
    to={link}
    className="group rounded-xl border border-stroke bg-white p-6 shadow-sm transition hover:shadow-md dark:border-strokedark dark:bg-boxdark"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#637381] dark:text-bodydark">
          {title}
        </p>
        <h4 className="mt-2 text-2xl font-bold text-black dark:text-white">
          {count !== null ? count.toLocaleString() : "—"}
        </h4>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
    </div>
  </Link>
);

const QuickAction = ({ label, to, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-lg border border-stroke bg-white px-5 py-3.5 text-sm font-medium text-black shadow-sm transition hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:border-primary dark:hover:text-primary"
  >
    <span className="text-lg">{icon}</span>
    {label}
  </Link>
);

const RecentItem = ({ title, subtitle, date, link }) => (
  <Link
    to={link}
    className="flex items-center justify-between rounded-lg px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-meta-4"
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-primary hover:underline dark:text-primary">
        {title}
      </p>
      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-[#637381] dark:text-bodydark">
          {subtitle}
        </p>
      )}
    </div>
    <span className="ml-4 flex-shrink-0 text-xs text-[#637381] dark:text-bodydark">
      {date}
    </span>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(DASHBOARD_STATS, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setRecent(data.recent);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-[#637381] dark:text-bodydark">
          Overview of your XRealty admin panel
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Properties"
          count={stats?.totalProperties ?? null}
          link="/manage-properties"
          color="bg-blue-50 dark:bg-blue-900/20"
          icon={
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          }
        />
        <StatCard
          title="Communities"
          count={stats?.totalCommunities ?? null}
          link="/manage-communities"
          color="bg-green-50 dark:bg-green-900/20"
          icon={
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
        />
        <StatCard
          title="Redirects"
          count={stats?.totalRedirects ?? null}
          link="/manage-redirects"
          color="bg-orange-50 dark:bg-orange-900/20"
          icon={
            <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
        />
        <StatCard
          title="Icons"
          count={stats?.totalIcons ?? null}
          link="/manage-icons"
          color="bg-pink-50 dark:bg-pink-900/20"
          icon={
            <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          }
        />
        <StatCard
          title="Users"
          count={stats?.totalUsers ?? null}
          link="/manage-users"
          color="bg-teal-50 dark:bg-teal-900/20"
          icon={
            <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <QuickAction label="Add Property" to="/forms/add-property" icon="+" />
          <QuickAction label="Add Community" to="/forms/add-community" icon="+" />
          <QuickAction label="Add Icon" to="/forms/add-icon" icon="+" />
          <QuickAction label="Manage Redirects" to="/manage-redirects" icon="&rarr;" />
          <QuickAction label="Generate Sitemap" to="/generate-sitemap" icon="&#9776;" />
        </div>
      </div>

      {/* Recently Updated */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Properties */}
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 className="text-base font-semibold text-black dark:text-white">
              Recent Properties
            </h3>
            <Link
              to="/manage-properties"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {recent?.properties?.length > 0 ? (
              recent.properties.map((p) => (
                <RecentItem
                  key={p._id}
                  title={p.property_name || "Untitled"}
                  subtitle={p.community_name || ""}
                  date={formatDate(p.updatedAt)}
                  link={`/forms/add-property/${p._id}`}
                />
              ))
            ) : (
              <p className="px-6 py-4 text-sm text-[#637381] dark:text-bodydark">
                No properties yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Communities */}
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 className="text-base font-semibold text-black dark:text-white">
              Recent Communities
            </h3>
            <Link
              to="/manage-communities"
              className="text-xs font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {recent?.communities?.length > 0 ? (
              recent.communities.map((c) => (
                <RecentItem
                  key={c._id}
                  title={c.name || "Untitled"}
                  subtitle={c.slug || ""}
                  date={formatDate(c.updatedAt)}
                  link={`/forms/add-community/${c._id}`}
                />
              ))
            ) : (
              <p className="px-6 py-4 text-sm text-[#637381] dark:text-bodydark">
                No communities yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
