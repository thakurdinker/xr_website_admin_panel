import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { CURRENT_USER } from "../api/constants";

export const UserContext = createContext();

export const INITIAL_STATE = {
  isLoggedIn: false,
  user: null,
  isUpdated: false,
};

export function UserContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    axios
      .get(CURRENT_USER, { withCredentials: true })
      .then(function (response) {
        if (response.data.success === true) {
          setCurrentUser(response.data.user);
        }
      })
      .catch(function (error) {
        console.log(error);
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, authChecked }}>
      {children}
    </UserContext.Provider>
  );
}
