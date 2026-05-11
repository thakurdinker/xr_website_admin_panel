import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../api/constants";
import { UserContext } from "../../context/UserContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    fetch(LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setCurrentUser({ isLoggedIn: true });
          navigate("/");
        } else {
          setError(
            data.message && data.message !== "DONE"
              ? data.message
              : "Invalid username or password."
          );
        }
      })
      .catch(() => {
        setError("Login failed. Please check your connection and try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* ── Left branded panel (desktop only) ──────────────────── */}
      <div className="relative hidden w-[45%] overflow-hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Decorative shapes */}
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
            Admin Dashboard
          </h2>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-white/70">
            Manage properties, communities, and content — all from one place.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Properties", "Communities", "Sitemap", "SEO"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────── */}
      <div className="flex w-full flex-col lg:w-[55%]">
        {/* ── Mobile/Tablet branded header ──────────────────────── */}
        <div className="relative overflow-hidden bg-primary px-6 pb-10 pt-8 lg:hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative z-10 text-center">
            <img
              src="https://xrealty.ae/wp-content/uploads/2023/04/logo-light-web.png"
              alt="Xperience Realty"
              className="mx-auto mb-3 w-44"
            />
            <p className="text-sm text-white/70">Admin Dashboard</p>
          </div>
        </div>

        {/* ── Form card ────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:py-0">
          <div className="w-full max-w-[420px]">
            {/* Card wrapper */}
            <div className="rounded-2xl bg-white p-8 shadow-lg sm:p-10 lg:rounded-xl lg:shadow-md">
              {/* Welcome text */}
              <div className="mb-7">
                <h1 className="text-[22px] font-bold text-[#1C2434]">
                  Welcome back
                </h1>
                <p className="mt-1.5 text-sm text-[#637381]">
                  Sign in to your admin account to continue
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

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1C2434]">
                    Username or Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M9 9C11.07 9 12.75 7.32 12.75 5.25C12.75 3.18 11.07 1.5 9 1.5C6.93 1.5 5.25 3.18 5.25 5.25C5.25 7.32 6.93 9 9 9ZM9 3C10.245 3 11.25 4.005 11.25 5.25C11.25 6.495 10.245 7.5 9 7.5C7.755 7.5 6.75 6.495 6.75 5.25C6.75 4.005 7.755 3 9 3ZM9 10.5C6.495 10.5 1.5 11.76 1.5 14.25V16.5H16.5V14.25C16.5 11.76 11.505 10.5 9 10.5ZM15 15H3V14.25C3 13.485 6.555 12 9 12C11.445 12 15 13.485 15 14.25V15Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username or email"
                      autoComplete="username"
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm text-[#1C2434] outline-none transition placeholder:text-[#94A3B8] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1C2434]">
                    Password
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
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-11 text-sm text-[#1C2434] outline-none transition placeholder:text-[#94A3B8] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#64748B]"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8 5.2L10.17 7.37C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <svg
                      className="h-4 w-4 animate-spin"
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
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>

            {/* Footer outside card */}
            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Xperience Realty Admin Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
