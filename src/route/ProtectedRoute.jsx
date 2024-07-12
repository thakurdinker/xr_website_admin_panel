import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser.isLoggedIn) {
      navigate("/auth/signin");
    }
  }, []);
  return null;
}
