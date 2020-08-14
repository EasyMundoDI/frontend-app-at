import React, { createContext, useState, useEffect } from "react";

import { useHistory } from "react-router-dom";
import LacunaWebPki from "web-pki";
import hashids from "hashids";
import api from "../services/api";
const Context = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authenticate, setAuthenticate] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState([]);
  const [infoCert, setInfoCert] = useState();
  const [userCerts, setUserCerts] = useState([]);
  const [value, setValue] = useState(null);
  const [valuePaste, setValuePaste] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (localStorage.getItem("@tokenAuth")) {
      api
        .get(`/auth/userinfo`)
        .then((result) => {})
        .catch((err) => {
          localStorage.removeItem("@tokenAuth");
          history.push("/");
        });

      setAuthenticate(true);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <h1>loading</h1>;
  }

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        authenticate,
        setAuthenticate,
        loading,
        setLoading,
        cert,
        setCert,
        infoCert,
        setInfoCert,
        userCerts,
        setUserCerts,
        value,
        setValue,
        valuePaste,
        setValuePaste,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, AuthProvider };
