import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

import Loader from "../common/Loader";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentUser]);

  useEffect(() => {
    let timer = setTimeout(() => {
      if (!currentUser) {
        navigate("/auth/signin");
      }
    }, [5000]);

    return () => {
      clearTimeout(timer);
    };
  }, [currentUser]);

  if (isLoading && currentUser === null) {
    return <Loader />;
  }

  return <>{children}</>;
}
