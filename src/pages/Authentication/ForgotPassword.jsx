import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios({
      method: "post",
      url: "http://localhost:3333/admin/resetPasswordRequest",
      data: {
        email: email,
      },
    })
      .then((response) => {
        setMessage("Password reset link sent to your email.");
        // Optionally, navigate to another page after success
        // navigate("/some-page");
      })
      .catch((err) => {
        setMessage("Error sending password reset link. Please try again.");
      });
  };

  return (
    <div className="flex h-[100vh] w-[100vw] items-center justify-center">
      <div className="mx-auto w-4/5">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Forgot Password
            </h2>

            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-5">
                <input
                  type="submit"
                  value="Send Reset Link"
                  className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                />
              </div>
            </form>

            {message && <p className="mt-6 text-center">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
