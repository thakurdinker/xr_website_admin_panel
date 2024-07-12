import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { CURRENT_USER } from "../api/constants";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    isLoggedIn: false,
  });

  useEffect(() => {
    axios
      .get(CURRENT_USER)
      .then(function (response) {
        // handle success
        if (response.data.success === true) {
          setCurrentUser(response.data.data);
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        setCurrentUser({ isLoggedIn: false });
      });
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}
