import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import world from "../images/logo_branca.png";
import { useHistory } from "react-router-dom";
import { cpfMask } from "../util/Mask";

function ForgetPassword() {
  const [loading, setLoading] = useState(true);
  const [cpf, setCpf] = useState("");

  const history = useHistory();

  useEffect(() => {
    setLoading(false);
  }, []);

  function processar(value) {
    setCpf(value);
    if (value.length < 15) {
      document.getElementById("adicionarnumero").disabled = true;
    } else {
      document.getElementById("adicionarnumero").disabled = false;
    }
  }

  return loading === true ? (
    <div className="container-verification">
      <Loading color="#3D92C2" height={80} width={80} />
    </div>
  ) : (
    <div className="container-verification">
      <div className="container-forgot">
        <div className="container-forgot-button">
          <a href="/">
            <button className="btn btn-primary"> voltar a home </button>
          </a>
          <a href="/signIn">
            <button className="btn btn-dark"> ir para o login</button>
          </a>
        </div>
        <img src={world} alt="" srcset="" />
        <h5>Para que continue o processo informe o seu email e cpf</h5>

        <button
          type="button"
          class="btn btn-primary"
          data-toggle="modal"
          data-target="#exampleModal"
        >
          Launch demo modal
        </button>
        <div
          class="modal fade"
          id="exampleModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                  Modal title
                </h5>
                <button
                  type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">...</div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button type="button" class="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="form-forgot">
          <div className="md-form ml-0 mr-0">
            <input
              type="text"
              id="form40"
              className="form-control form-control-sm validate ml-0"
              value={cpfMask(cpf)}
              onChange={(e) => processar(e.target.value)}
            />
            <label
              data-error="wrong"
              data-success="right"
              htmlFor="form40"
              className="form40 ml-0"
            >
              cpf
            </label>
          </div>
        </div>
        <div className="container-footer-forgot">
          <p className="copyright">
            {" "}
            <img src={world} alt="" srcSet="" /> © 2020 - Todos os direitos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
