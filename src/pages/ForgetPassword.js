import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import world from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
import { useHistory, useParams } from "react-router-dom";
import { Form } from "@unform/web";
import { cpfMask } from "../util/Mask";
import api from "../services/api";
function ForgetPassword() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const { token, cpf } = useParams();
  console.log(`token`, token);
  console.log(`cpf`, cpf);

  const history = useHistory();

  useEffect(() => {
    api.get(`/userSearch/${cpf}`).then((result) => {
      setUser(result.data);
      console.log(result.data);
      setLoading(false);
    });
  }, []);

  async function changePassword() {
    var oldPassword = document.getElementById("oldpassword").value;
    var newPassword = document.getElementById("newpassword").value;
    var repeatPassword = document.getElementById("repeatnewpassword").value;

    if (newPassword !== repeatPassword) {
      document.getElementById("errorAccountPass").style.display = "block";
      setTimeout(() => {
        document.getElementById("errorAccountPass").style.display = "none";
      }, 3000);
    } else {
      console.log("ok");
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
        <div className="img-forgot">
          {" "}
          <img src={world} alt="" />
        </div>

        <h5>Para que continue o processo informe o seu email e cpf</h5>

        <div className="form-forgot">
          <small className="parag-troca">
            {user.nome} &nbsp; {cpfMask(user.cpf)}
          </small>

          <Form onSubmit={changePassword}>
            <div
              className="alert alert-danger"
              role="alert"
              id="errorAccountPass"
            >
              as senhas não correspondem !
            </div>
            <div className="md-form md-outline">
              <i className="fas fa-lock prefix"></i>
              <input
                type="text"
                id="oldpassword"
                className="form-control"
                name="cpf"
                required
              />
              <label htmlFor="oldpassword">Senha Antiga</label>
              <small id="emailHelp2" className="form-text text-muted">
                coloque a sua antiga senha
              </small>
            </div>
            <div className="md-form md-outline">
              <i className="fas fa-lock prefix"></i>
              <input
                type="text"
                id="newpassword"
                className="form-control"
                name="cpf"
                required
              />
              <label htmlFor="newpassword">Nova Senha</label>
              <small id="emailHelp2" className="form-text text-muted">
                coloque a sua nova senha
              </small>
            </div>
            <div className="md-form md-outline">
              <i className="fas fa-lock prefix"></i>
              <input
                type="text"
                id="repeatnewpassword"
                className="form-control"
                name="cpf"
                required
              />
              <label htmlFor="repeatnewpassword"> Repita nova Senha</label>
              <small id="emailHelp2" className="form-text text-muted">
                repita a sua nova senha
              </small>
            </div>
            <button
              className="btn btn-primary"
              id="trocarpassword"
              type="submit"
            >
              ENVIAR
            </button>
          </Form>
        </div>

        <div className="img-forgot">
          <div className="container-footer-forgot">
            <p className="copyright">
              {" "}
              <img src={world} alt="" srcSet="" /> © 2020 - Todos os direitos
              reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
