import React, { useContext, useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Context } from "../../Context/AuthContext";
import world from "../../images/world.png";
import Logo from "../../images/logo_branca.png";
import Loading from "../../components/Loading";
import "../../styles/styles.css";

import api from "../../services/api";

const RoutesPrivate = ({ component: Component, ...rest }) => {
  const { authenticate } = useContext(Context);
  const [infoUser, setInfoUser] = useState();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  useEffect(() => {
    api
      .get(`/auth/userinfo`)
      .then((result) => {
        setInfoUser(result.data);
        setLoading(false);
      })
      .catch((err) => {
        localStorage.removeItem("@tokenAuth");
        history.push("/");
      });
  }, []);

  return (
    <Route
      {...rest}
      render={() =>
        authenticate === true ? (
          <div className="wrapper">
            <input type="checkbox" id="check" />
            <div className="header">
              <div className="header-menu">
                <a href="/dashboard">
                  <img src={Logo} className="img-fluid" alt="" />
                </a>
                <label htmlFor="check">
                  <i className="fas fa-bars" id="sidebar_btn"></i>
                </label>
                <a href="/dashboard/document">
                  <button className="btn btn-primary">+ novo documento</button>
                </a>

                {loading === true ? (
                  <Loading />
                ) : (
                  <h4>{infoUser.nome.split(" ").slice(0, 2).join(" ")}</h4>
                )}
                <ul>
                  <li>
                    <a
                      href="/"
                      onClick={function () {
                        localStorage.removeItem("@tokenAuth");
                      }}
                    >
                      <i className="fas fa-power-off"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sidebar">
              <div className="sidebar-menu">
                <center className="profile">
                  <img src={world} alt="" />
                </center>

                <a href="/dashboard/documentsViewer">
                  <i className="fas fa-file"></i>
                  <span>Documentos</span>
                </a>
                <a href="/dashboard/pastas">
                  <i className="fas fa-folder-open"></i>
                  <span>Pastas</span>
                </a>
                <a href="/dashboard/organization">
                  <i className="far fa-building"></i>
                  <span>Organizações</span>
                </a>
                <a href="/">
                  <i className="fas fa-pen"></i>
                  <span>Validar Documentos</span>
                </a>
              </div>
            </div>
            <Component {...rest} />
          </div>
        ) : (
          <Redirect to="/signin" />
        )
      }
    />
  );
};

export default RoutesPrivate;
