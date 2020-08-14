import React, { useState } from "react";
import api from "../services/api";
import world from "../images/world.png";
import { phoneMask } from "../util/Mask";

function AlertTelefone(props) {
  const [phone, setPhone] = useState("");

  var numsStr = phone.replace(/[^0-9]/g, "");

  function adicionarnumero() {
    api.put(`/user/setnumber/${parseInt(numsStr)}`).then((result) => {
      window.location.reload(false);
    });
  }

  function processar(value) {
    setPhone(value);
    if (value.length < 15) {
      document.getElementById("adicionarnumero").disabled = true;
    } else {
      document.getElementById("adicionarnumero").disabled = false;
    }
  }

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-dismissable alert-danger">
              <button
                type="button"
                className="close"
                data-dismiss="alert"
                aria-hidden="true"
              >
                ×
              </button>
              <h4>Alerta!</h4> <strong>Alerta!</strong> o seu número de telefone
              está pendente .
              <a
                href="/"
                data-toggle="modal"
                data-target="#modalLoginAvatar"
                className="alert-danger"
              >
                <strong>clique aqui e adicione</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          className="modal fade"
          id="modalLoginAvatar"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myModalLabel"
          aria-hidden="true"
        >
          <div
            className="modal-dialog cascading-modal modal-avatar modal-sm"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <img
                  src={world}
                  alt="avatar"
                  className="rounded-circle img-responsive"
                />
              </div>

              <div className="modal-body text-center mb-1">
                <h1> Telefone celular</h1>

                <div className="md-form ml-0 mr-0">
                  <input
                    type="text"
                    id="form28"
                    className="form-control form-control-sm validate ml-0"
                    value={phoneMask(phone)}
                    onChange={(e) => processar(e.target.value)}
                  />
                  <label
                    data-error="wrong"
                    data-success="right"
                    htmlFor="form28"
                    className="ml-0"
                  >
                    adicionar número
                  </label>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => adicionarnumero()}
                    className="btn btn-cyan mt-1"
                    id="adicionarnumero"
                  >
                    adicionar <i className="fas fa-sign-in ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertTelefone;
