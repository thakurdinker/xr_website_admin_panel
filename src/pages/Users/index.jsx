import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultLayout from "../../layout/DefaultLayout";
import Pagination from "../../components/Pagination/Pagination";
import { GET_ALL_USERS, REGISTER_USER, UPDATE_USER, GET_ALL_ROLES } from "../../api/constants";
import { useNavigate, useLocation } from "react-router-dom";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isUserSearching = useRef(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (isUserSearching.current) {
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(GET_ALL_ROLES, { credentials: "include" });
        const data = await res.json();
        if (data.success) setRoles(data.roles || []);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = `?page=${currentPage}&limit=10${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`;
        const res = await fetch(GET_ALL_USERS + params, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users");
      }
      setLoading(false);
    };
    fetchUsers();
  }, [currentPage, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`?page=${newPage}`);
    }
  };

  const resetForm = () => {
    setFormData({ first_name: "", last_name: "", username: "", email: "", password: "", roleId: "" });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      roleId: user.role?._id || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${UPDATE_USER}/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
        toast.success("User deleted");
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingUser) {
        // Update
        const res = await fetch(`${UPDATE_USER}/${editingUser._id}`, {
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
          // Update the user in local state
          setUsers(users.map((u) =>
            u._id === editingUser._id
              ? {
                  ...u,
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  role: roles.find((r) => r._id === formData.roleId)
                    ? { _id: formData.roleId, role_name: roles.find((r) => r._id === formData.roleId).role_name }
                    : u.role,
                }
              : u
          ));
          toast.success("User updated");
          resetForm();
        } else {
          toast.error(data.message || "Failed to update user");
        }
      } else {
        // Create
        if (!formData.first_name.trim()) { toast.error("First name is required"); setFormLoading(false); return; }
        if (!formData.last_name.trim()) { toast.error("Last name is required"); setFormLoading(false); return; }
        if (!formData.username.trim()) { toast.error("Username is required"); setFormLoading(false); return; }
        if (!formData.email.trim()) { toast.error("Email is required"); setFormLoading(false); return; }
        if (!formData.password || formData.password.length < 6) { toast.error("Password must be at least 6 characters"); setFormLoading(false); return; }
        if (!formData.roleId) { toast.error("Role is required"); setFormLoading(false); return; }

        const res = await fetch(REGISTER_USER, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("User added");
          resetForm();
          // Re-fetch to get updated list
          setCurrentPage(1);
          setDebouncedSearch("");
          setSearchTerm("");
        } else {
          toast.error(data.message || "Failed to add user");
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Failed to save user");
    }
    setFormLoading(false);
  };

  const getRoleName = (user) => user?.role?.role_name || "—";

  return (
    <DefaultLayout>
      <div className="overflow-hidden rounded-[10px]">
        <div className="max-w-full overflow-x-auto">
          {/* Header */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Manage Users
            </h2>
            <button
              onClick={() => {
                if (showForm && !editingUser) {
                  resetForm();
                } else {
                  setEditingUser(null);
                  setFormData({ first_name: "", last_name: "", username: "", email: "", password: "", roleId: "" });
                  setShowForm(true);
                }
              }}
              className={`rounded px-4 py-2 text-sm font-medium text-white transition ${
                showForm && !editingUser
                  ? "bg-red hover:bg-opacity-90"
                  : "bg-primary hover:bg-opacity-90"
              }`}
            >
              {showForm && !editingUser ? "Cancel" : "Add New User"}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="border-b border-stroke bg-white px-5 py-5 dark:border-strokedark dark:bg-boxdark lg:px-7.5 2xl:px-11">
              <h3 className="mb-4 text-sm font-semibold text-black dark:text-white">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      First Name <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="First name"
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Last name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Username {!editingUser && <span className="text-red">*</span>}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Username"
                      disabled={!!editingUser}
                      required={!editingUser}
                      className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${editingUser ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Email {!editingUser && <span className="text-red">*</span>}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      disabled={!!editingUser}
                      required={!editingUser}
                      className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${editingUser ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                        Password <span className="text-red">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                      Role <span className="text-red">*</span>
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : editingUser ? "Update User" : "Add User"}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded border border-stroke px-5 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between bg-white px-5 py-4 dark:bg-boxdark lg:px-7.5 2xl:px-11">
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => {
                isUserSearching.current = true;
                setSearchTerm(e.target.value);
              }}
              className="w-full max-w-md rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 bg-[#F9FAFB] px-5 py-4 dark:bg-meta-4 lg:px-7.5 2xl:px-11">
            <div className="col-span-1">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">#</h5>
            </div>
            <div className="col-span-3">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">NAME</h5>
            </div>
            <div className="col-span-2">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">USERNAME</h5>
            </div>
            <div className="col-span-3">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">EMAIL</h5>
            </div>
            <div className="col-span-1">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">ROLE</h5>
            </div>
            <div className="col-span-2 flex justify-end">
              <h5 className="text-xs font-medium text-[#637381] dark:text-bodydark md:text-base">ACTIONS</h5>
            </div>
          </div>

          {/* Table body */}
          <div className="bg-white dark:bg-boxdark">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                Loading...
              </div>
            ) : users.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#637381] dark:text-bodydark lg:px-7.5 2xl:px-11">
                No users found.
              </div>
            ) : (
              users.map((user, index) => (
                <div
                  key={user._id || index}
                  className="grid grid-cols-12 border-t border-[#EEEEEE] px-5 py-4 dark:border-strokedark lg:px-7.5 2xl:px-11"
                >
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-[#637381] dark:text-bodydark md:text-base">
                      {(currentPage - 1) * 10 + (index + 1)}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm">
                      {(user.first_name || "") + " " + (user.last_name || "")}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm">
                      {user.username}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <p className="truncate text-xs text-[#637381] dark:text-bodydark md:text-sm" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {getRoleName(user)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id, user.first_name + " " + user.last_name)}
                      className="rounded bg-red px-3 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </DefaultLayout>
  );
};

export default UsersList;
