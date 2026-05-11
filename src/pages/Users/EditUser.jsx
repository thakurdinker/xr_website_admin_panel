import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { GET_ALL_ROLES, UPDATE_USER } from "../../api/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const userID = location.state?.userID || null;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    roleId: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    if (!userID) {
      navigate("/manage-users", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          fetch(`${UPDATE_USER}/${userID}`, { credentials: "include" }),
          fetch(GET_ALL_ROLES, { credentials: "include" }),
        ]);
        const userData = await userRes.json();
        const rolesData = await rolesRes.json();

        if (userData.success && userData.user) {
          setFormData({
            first_name: userData.user.first_name || "",
            last_name: userData.user.last_name || "",
            roleId: userData.user.role?._id || "",
            email: userData.user.email || "",
            username: userData.user.username || "",
          });
        }
        if (rolesData.success) {
          setRoles(rolesData.roles || []);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        toast.error("Failed to load user data");
      }
      setLoading(false);
    };
    fetchData();
  }, [userID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${UPDATE_USER}/${userID}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          roleId: formData.roleId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully");
        setTimeout(() => navigate("/manage-users", { replace: true }), 1000);
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    }
    setSaving(false);
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
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[10px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-white px-6 py-4 dark:bg-boxdark">
            <h2 className="text-xl font-bold text-black dark:text-white">Edit User</h2>
            <button
              onClick={() => navigate("/manage-users", { replace: true })}
              className="rounded border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Back to Users
            </button>
          </div>

          {/* Form */}
          <div className="border-t border-stroke bg-white px-6 py-6 dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit}>
              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    First Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full cursor-not-allowed rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black opacity-60 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full cursor-not-allowed rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black opacity-60 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Role <span className="text-red">*</span>
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/manage-users", { replace: true })}
                  className="rounded border border-stroke px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </DefaultLayout>
  );
}
