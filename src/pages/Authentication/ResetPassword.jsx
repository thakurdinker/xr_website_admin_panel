import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { RESET_PASSWORD } from "../../api/constants";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const resetToken = query.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        RESET_PASSWORD,
        {
          resetToken,
          password,
        },
        { withCredentials: true }
      );

      console.log(response.data, "11111");
      if (!response.data.error) {
        setSuccess("Password reset successfully. Redirecting to login...");
        navigate("/auth/signin");
      } else {
        console.log("failed");
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 flex min-h-screen items-center justify-center">
      <div className="border-gray-300 w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="mb-4 text-green-500">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="text-gray-700 block text-sm font-medium"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="border-gray-300 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="text-gray-700 block text-sm font-medium"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="border-gray-300 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
