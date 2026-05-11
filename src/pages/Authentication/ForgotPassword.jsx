import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RESET_PASSWORD_REQUEST } from "../../api/constants";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(RESET_PASSWORD_REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Password Recovery
          </h2>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-white/70">
            Enter your email and we'll send you a link to reset your password.
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
            <p className="text-sm text-white/70">Password Recovery</p>
          </div>
        </div>

        {/* Form card */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:py-0">
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl bg-white p-8 shadow-lg sm:p-10 lg:rounded-xl lg:shadow-md">
              {submitted ? (
                /* Success state */
                <div className="text-center">
                  <div
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#ECFDF5" }}
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="mb-2 text-[22px] font-bold text-[#1C2434]">
                    Check your email
                  </h1>
                  <p className="mb-6 text-sm leading-relaxed text-[#637381]">
                    If an account with <strong>{email}</strong> exists, we've sent a password reset link. Please check your inbox and spam folder.
                  </p>
                  <Link
                    to="/auth/signin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Sign In
                  </Link>
                </div>
              ) : (
                /* Form state */
                <>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#1C2434]">
                      Forgot password?
                    </h1>
                    <p className="mt-1.5 text-sm text-[#637381]">
                      No worries — enter your email and we'll send you a reset link.
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

                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#1C2434]">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm text-[#1C2434] outline-none transition placeholder:text-[#94A3B8] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
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
                      {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
