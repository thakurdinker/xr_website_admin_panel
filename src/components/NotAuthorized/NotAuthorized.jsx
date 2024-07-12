// import React from "react";
import { useNavigate } from "react-router-dom";

// const NotAuthorized = () => {
//   const navigate = useNavigate();

//   const handleGoBack = () => {
//     navigate("/auth/signin");
//   };

//   return (
//     <div className="bg-gray-100 flex min-h-screen items-center justify-center">
//       <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
//         <h2 className="text-gray-800 mb-4 text-xl font-semibold">
//           Not Authorized
//         </h2>
//         <p className="text-gray-600 mb-6">
//           You are not authorized to view this page.
//         </p>
//         <button
//           onClick={handleGoBack}
//           className="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition duration-200 hover:bg-blue-600"
//         >
//           Go to Sign In
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NotAuthorized;

import React from "react";

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/auth/signin");
  };

  return (
    <div className="bg-gray-100 flex min-h-screen items-center justify-center">
      <div className="transform rounded-lg bg-white p-10 text-center shadow-lg transition-transform hover:scale-105">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-red"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="4"
            y1="4"
            x2="20"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <h1 className="text-gray-800 mb-4 text-4xl font-bold">Access Denied</h1>
        <p className="text-gray-600 mb-6 text-lg">
          You do not have permission to view this page. Please sign in to
          continue.
        </p>
        <button
          onClick={handleGoBack}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default NotAuthorized;
