import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { RESET_PASSWORD } from "../../api/constants";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const resetToken = query.get("token");
  const email = query.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resetToken, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        setSuccess(true);
        setTimeout(() => navigate("/auth/signin"), 3000);
      } else {
        setError(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token provided
  if (!resetToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
        <div className="w-full max-w-[420px] px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#FEF2F2" }}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} style={{ stroke: "#EF4444" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="mb-2 text-[22px] font-bold text-[#1C2434]">Invalid Reset Link</h1>
            <p className="mb-6 text-sm text-[#637381]">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Left branded panel (desktop only) */}
      <div className="relative hidden w-[45%] overflow-hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute right-20 top-20 h-40 w-40 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 px-12 text-center">
          <img
            src="https://xrealty.ae/wp-content/uploads/2023/04/logo-light-web.png"
            alt="Xperience Realty"
            className="mx-auto mb-10 w-64"
          />
          <h2 className="mb-4 text-3xl font-bold text-white">
            Reset Password
          </h2>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-white/70">
            Choose a strong password to secure your admin account.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col lg:w-[55%]">
        {/* Mobile branded header */}
        <div className="relative overflow-hidden bg-primary px-6 pb-10 pt-8 lg:hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative z-10 text-center">
            <img
              src="https://xrealty.ae/wp-content/uploads/2023/04/logo-light-web.png"
              alt="Xperience Realty"
              className="mx-auto mb-3 w-44"
            />
            <p className="text-sm text-white/70">Reset Password</p>
          </div>
        </div>

        {/* Form card */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:py-0">
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl bg-white p-8 shadow-lg sm:p-10 lg:rounded-xl lg:shadow-md">
              {success ? (
                /* Success state */
                <div className="text-center">
                  <div
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#ECFDF5" }}
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="mb-2 text-[22px] font-bold text-[#1C2434]">
                    Password Updated
                  </h1>
                  <p className="mb-6 text-sm leading-relaxed text-[#637381]">
                    Your password has been reset successfully. Redirecting you to sign in...
                  </p>
                  <Link
                    to="/auth/signin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Sign in now
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#1C2434]">
                      Set new password
                    </h1>
                    <p className="mt-1.5 text-sm text-[#637381]">
                      {email
                        ? <>Enter a new password for <strong>{email}</strong></>
                        : "Enter your new password below."
                      }
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div
                      className="mb-5 flex items-center gap-3 rounded-lg px-4 py-3.5"
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderLeft: "4px solid #EF4444",
                      }}
                    >
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#EF4444" }}
                      >
                        <svg className="h-3.5 w-3.5" fill="white" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium" style={{ color: "#991B1B" }}>
                        {error}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#1C2434]">
                        New Password
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                              d="M14.25 6.75H13.5V5.25C13.5 2.765 11.485 0.75 9 0.75C6.515 0.75 4.5 2.765 4.5 5.25V6.75H3.75C2.925 6.75 2.25 7.425 2.25 8.25V15.75C2.25 16.575 2.925 17.25 3.75 17.25H14.25C15.075 17.25 15.75 16.575 15.75 15.75V8.25C15.75 7.425 15.075 6.75 14.25 6.75ZM6 5.25C6 3.59 7.34 2.25 9 2.25C10.66 2.25 12 3.59 12 5.25V6.75H6V5.25ZM14.25 15.75H3.75V8.25H14.25V15.75ZM9 13.5C9.825 13.5 10.5 12.825 10.5 12C10.5 11.175 9.825 10.5 9 10.5C8.175 10.5 7.5 11.175 7.5 12C7.5 12.825 8.175 13.5 9 13.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-11 text-sm text-[#1C2434] outline-none transition placeholder:text-[#94A3B8] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#64748B]"
                        >
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8 5.2L10.17 7.37C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="currentColor" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#1C2434]">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          required
                          minLength={6}
                          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm text-[#1C2434] outline-none transition placeholder:text-[#94A3B8] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                      {/* Match indicator */}
                      {confirmPassword && (
                        <p
                          className="mt-1.5 text-xs font-medium"
                          style={{ color: password === confirmPassword ? "#10B981" : "#EF4444" }}
                        >
                          {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading && (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      to="/auth/signin"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#637381] hover:text-primary"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Xperience Realty Admin Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
