import React, { useEffect, useState } from "react";
import { REDIRECT_MANAGER } from "../../api/constants";

const RedirectManager = () => {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ from: "", to: "", type: "301" });
  const [editingRedirect, setEditingRedirect] = useState(null);

  // Assume we get this from somewhere else in the app
  const REDIRECT_MANAGER_API = REDIRECT_MANAGER;

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const response = await fetch(REDIRECT_MANAGER_API);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setRedirects(data);
    } catch (error) {
      console.error("Error fetching redirects:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRedirect
        ? `${REDIRECT_MANAGER_API}/${editingRedirect._id}`
        : REDIRECT_MANAGER_API;
      const method = editingRedirect ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      if (editingRedirect) {
        setRedirects(
          redirects.map((r) =>
            r._id === editingRedirect._id ? { ...r, ...formData } : r
          )
        );
      } else {
        const newRedirect = await response.json();
        setRedirects([...redirects, newRedirect]);
      }

      setFormData({ from: "", to: "", type: "301" });
      setEditingRedirect(null);
    } catch (error) {
      console.error("Error saving redirect:", error);
    }

    setLoading(false);
  };

  const handleEdit = (redirect) => {
    setEditingRedirect(redirect);
    setFormData({ from: redirect.from, to: redirect.to, type: redirect.type });
  };

  const handleDelete = async (redirectId) => {
    setLoading(true);
    try {
      const response = await fetch(`${REDIRECT_MANAGER_API}/${redirectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");

      // Update the local state immediately after successful deletion
      setRedirects(redirects.filter((r) => r._id !== redirectId));
    } catch (error) {
      console.error("Error deleting redirect:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Redirect Manager</h1>

      <form
        className="mb-6 rounded bg-white p-4 shadow-md"
        onSubmit={handleFormSubmit}
      >
        <div className="mb-4">
          <label
            htmlFor="from"
            className="text-gray-700 mb-2 block text-sm font-bold"
          >
            From URL
          </label>
          <input
            type="text"
            id="from"
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            className="text-gray-700 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="to"
            className="text-gray-700 mb-2 block text-sm font-bold"
          >
            To URL
          </label>
          <input
            type="text"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            className="text-gray-700 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="type"
            className="text-gray-700 mb-2 block text-sm font-bold"
          >
            Redirect Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="text-gray-700 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          >
            <option value="301">301 (Permanent)</option>
            <option value="302">302 (Temporary)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            {editingRedirect ? "Update Redirect" : "Add Redirect"}
          </button>
          {editingRedirect && (
            <button
              type="button"
              onClick={() => {
                setFormData({ from: "", to: "", type: "301" });
                setEditingRedirect(null);
              }}
              className="bg-gray-500 hover:bg-gray-700 focus:shadow-outline ml-4 rounded px-4 py-2 font-bold text-white focus:outline-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-gray-300 min-w-full border bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b px-4 py-2 text-left font-semibold">
                  From
                </th>
                <th className="border-b px-4 py-2 text-left font-semibold">
                  To
                </th>
                <th className="border-b px-4 py-2 text-left font-semibold">
                  Type
                </th>
                <th className="border-b px-4 py-2 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((redirect) => (
                <tr key={redirect._id} className="hover:bg-gray-50">
                  <td className="border-b px-4 py-2">{redirect.from}</td>
                  <td className="border-b px-4 py-2">{redirect.to}</td>
                  <td className="border-b px-4 py-2">{redirect.type}</td>
                  <td className="border-b px-4 py-2">
                    <button
                      onClick={() => handleEdit(redirect)}
                      className="mr-2 rounded bg-yellow-500 px-3 py-1 font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(redirect._id)}
                      className="focus:ring-red-500 rounded bg-red px-3 py-1 font-bold text-black focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RedirectManager;
