import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Loader from "../common/Loader";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { currentUser, authChecked } = useContext(UserContext);

  // Still checking auth — show loader
  if (!authChecked) {
    return <Loader />;
  }

  // Auth check done, no user — redirect immediately
  if (!currentUser) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}
