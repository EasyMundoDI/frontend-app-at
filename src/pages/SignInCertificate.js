import React, { useEffect, useState, useContext } from "react";
import LacunaWebPki from "web-pki";
import api from "../services/api-no-authenticate";
import { useHistory } from "react-router-dom";
import { Context } from "../Context/AuthContext";
import hashids from "hashids";
import $ from "jquery";
import Loading from "../components/Loading";
import logo from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
var pki = new LacunaWebPki("");
function SignInCertificate() {
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const { setAuthenticate } = useContext(Context);
  const history = useHistory();
  const hash = new hashids("", 35);

  useEffect(() => {
    if (localStorage.getItem("@tokenAuth")) {
      history.push("/dashboard");
    }

    api.get("/authCert").then((result) => {
      setToken(result.data.token);
    });

    async function loadCertificate() {
      pki.init({
        ready: start,
        notInstalled: notInstalled,
      });
      function start() {
        pki
          .listCertificates({
            selectId: "certificateSelect",
          })
          .success(setLoading(false));
      }

      function notInstalled() {
        alert(
          "você está sendo redirecionado para a pá de instalação do plugin"
        );
        pki.redirectToInstallPage();
      }
    }
    loadCertificate();
  }, [history, setAuthenticate]);

  async function sign() {
    pki
      .signWithRestPki({
        token: token,
        thumbprint: $("#certificateSelect").val(),
      })
      .success(function () {
        api.post(`/authCert/${token}`).then((result) => {
          api
            .get(
              `/userSearch/${result.data._emailAddress}/${result.data._subjectName._commonName}/${result.data._pkiBrazil._cpf}/`
            )
            .then((resultadoGet) => {
              console.log(resultadoGet);

              if (resultadoGet.data.userFindCert === undefined) {
                localStorage.setItem("@tokenAuth", resultadoGet.data.token);
                api
                  .post(`/user/${resultadoGet.data.createCert.id}/usercert`, {
                    nome: result.data._subjectName._commonName,
                    cpf: result.data._pkiBrazil._cpf,
                    email: result.data._emailAddress,
                    cert: result.data._issuerName._commonName,
                    util: 0,
                    user_id: resultadoGet.data.createCert.id,
                    thumbprint: $("#certificateSelect").val(),
                    validityStart: result.data._validityStart,
                    validityEnd: result.data._validityEnd,
                  })
                  .then((reuslt) => {
                    history.push("/signin");
                  });
              } else {
                localStorage.setItem("@tokenAuth", resultadoGet.data.token);
                api
                  .post(`/user/${resultadoGet.data.userFindCert.id}/usercert`, {
                    nome: result.data._subjectName._commonName,
                    cpf: result.data._pkiBrazil._cpf,
                    email: result.data._emailAddress,
                    cert: result.data._issuerName._commonName,
                    util: 0,
                    user_id: resultadoGet.data.userFindCert.id,
                    thumbprint: $("#certificateSelect").val(),
                    validityStart: result.data._validityStart,
                    validityEnd: result.data._validityEnd,
                  })
                  .then((reuslt) => {
                    history.push("/signin");
                  });
              }

              setAuthenticate(true);
              return history.push("/dashboard");
            });
        });
      });
  }

  return (
    <div>
      <div className="login-wrap">
        <div className="login-html">
          <input
            id="tab-1"
            type="radio"
            name="tab"
            className="sign-in"
            defaultChecked
          />
          <label htmlFor="tab-1" className="tab">
            login com certificado
          </label>
          <div className="hr"></div>
          <div className="login-form">
            <input id="tab-2" type="radio" name="tab" className="sign-up" />
            {loading === true ? (
              <div>
                {" "}
                <div className="container-loading">
                  <Loading color="#FFF" height={50} width={50} />
                </div>
              </div>
            ) : (
              <div>
                {" "}
                <div className="group">
                  <p className="titulo-signincert">
                    Por favor selecione seu certificado digital:
                  </p>

                  <select className="custom-select " id="certificateSelect" />
                </div>
                <div className="group">
                  <button
                    className="btn btn-primary button"
                    onClick={() => sign()}
                  >
                    login
                  </button>
                </div>
              </div>
            )}

            <div className="hr"></div>
            <div className="foot-lnk">
              <small>acesso com senha</small>
              <a href="/signin">login</a>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <p className="copyright">
          {" "}
          <img src={logo} alt="" srcSet="" /> © 2020 - Todos os direitos
          reservados
        </p>
      </footer>
    </div>
  );
}

export default SignInCertificate;
