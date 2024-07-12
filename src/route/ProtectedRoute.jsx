import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

import Loader from "../common/Loader";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentUser]);

  if (isLoading && currentUser === null) {
    return <Loader />;
  }

  return <>{children}</>;
}
