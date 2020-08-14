import React, { useRef, useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { Context } from "../Context/AuthContext";
import Loading from "../components/Loading";
import { cpfMask } from "../util/Mask";
import Input from "../components/SecondInput";
import { phoneMask } from "../util/Mask";
import { Form } from "@unform/web";
import logo from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
import api from "../services/api-no-authenticate";
import * as Yup from "yup";

function Login() {
  const { setAuthenticate } = useContext(Context);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const formRef2 = useRef(null);
  const history = useHistory();

  useEffect(() => {
    if (localStorage.getItem("@tokenAuth")) {
      history.push("/dashboard");
    }
  }, [history]);

  function gotoCertificate() {
    history.push("/signincert");
  }

  async function onSubmit(data, { reset }) {
    setLoading(true);
    try {
      const Schema = Yup.object().shape({
        cpf: Yup.string().required("O cpf é obrigatório"),
        password: Yup.string(),
      });
      await Schema.validate(data, {
        abortEarly: false,
      });
      api
        .post("/login", {
          cpf: data.cpf.replace(/\D/g, ""),
          password: data.password,
        })
        .then((loginSubmit) => {
          if (loginSubmit.data.findUser.confirmed === false) {
            document.getElementById("confirmAccount").style.display = "block";
            setTimeout(() => {
              document.getElementById("confirmAccount").style.display = "none";
            }, 15000);
            setLoading(false);
          } else {
            localStorage.setItem("@tokenAuth", loginSubmit.data.token);
            setAuthenticate(true);
            history.push("/dashboard");
          }
        })
        .catch((err) => {
          setLoading(false);
          document.getElementById("errorAccount").style.display = "block";
          setTimeout(() => {
            document.getElementById("errorAccount").style.display = "none";
          }, 15000);
        });

      reset();
    } catch (erro) {
      if (erro instanceof Yup.ValidationError) {
        const erros = {};
        erro.inner.forEach((err) => {
          erros[err.path] = err.message;
        });
        formRef.current.setErrors(erros);
      }
    }
  }

  async function onSubmit2(data, { reset }) {
    try {
      const Schema = Yup.object().shape({
        nome: Yup.string().required("O nome é obrigatório"),
        email: Yup.string()
          .email("Digite um e-mail válido")
          .required("O e-mail é obrigatório"),
        cpf: Yup.string().required("O cpf é obrigatório"),
        password1: Yup.string()
          .min(5, "No mínimo 6 caracteres")
          .required("A senha é obrigatória"),
        password2: Yup.string()
          .oneOf([data.password1], "As senhas não correspondem")
          .required("É necessária a confirmação da senha"),
        numero: Yup.string().required("O número de telefone é inválido"),
      });
      await Schema.validate(data, {
        abortEarly: false,
      });
      api
        .post("/register", {
          nome: data.nome,
          email: data.email,
          password: data.password1,
          cpf: data.cpf.replace(/\D/g, ""),
          number: data.numero.replace(/\D/g, ""),
        })
        .then((result) => {
          history.push("/signin");
        })
        .catch((fail) => {
          document.getElementById("errorRegister").style.display = "block";
          setTimeout(() => {
            document.getElementById("errorRegister").style.display = "none";
          }, 15000);
        });
      reset();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errorMessages = {};
        error.inner.forEach((err) => {
          errorMessages[err.path] = error.message;
        });
        formRef2.current.setErrors(errorMessages);
      }
    }
  }

  function processar(value) {
    setCpf(value);
    if (value.length < 14) {
      document.getElementById("login").disabled = true;
    } else {
      document.getElementById("login").disabled = false;
    }
  }
  function processarPhone(value) {
    setPhone(value);
    if (value.length < 15) {
      document.getElementById("register").disabled = true;
    } else {
      document.getElementById("register").disabled = false;
    }
  }

  return (
    <div className="main-container">
      <div className="login-wrap">
        <p className="confirmAccount" id="confirmAccount">
          confirme seu email
        </p>
        <div className="login-html">
          <input
            id="tab-1"
            type="radio"
            name="tab"
            className="sign-in"
            defaultChecked
          />
          <label htmlFor="tab-1" className="tab">
            login
          </label>
          <input id="tab-2" type="radio" name="tab" className="sign-up" />
          <label htmlFor="tab-2" className="tab">
            cadastre-se
          </label>
          <div className="login-form">
            <div className="sign-in-htm">
              <p className="errorAccount" id="errorAccount">
                credenciais incorretas
              </p>
              <Form onSubmit={onSubmit} ref={formRef}>
                <div className="group">
                  <label htmlFor="user" className="label">
                    cpf
                  </label>
                  <Input
                    name="cpf"
                    type="text"
                    className="input"
                    value={cpfMask(cpf)}
                    onChange={(e) => processar(e.target.value)}
                  />
                </div>
                <div className="group">
                  <label htmlFor="pass" className="label">
                    senha
                  </label>
                  <Input name="password" type="password" className="input" />
                </div>

                <div className="group">
                  {loading === true ? (
                    <Loading />
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary button"
                      value="log In"
                      id="login"
                      disabled={true}
                    >
                      login
                    </button>
                  )}
                </div>
              </Form>
              <div className="hr"></div>
              <div className="foot-lnk">
                <a href="#forgot">Esqueceu a senha ?</a>
              </div>
              <div className="group">
                <button
                  className="btn btn-primary button"
                  onClick={() => gotoCertificate()}
                >
                  login com certificado
                </button>
              </div>
            </div>

            <div className="sign-up-htm">
              <Form onSubmit={onSubmit2} ref={formRef2}>
                <p className="confirmAccount" id="errorRegister">
                  o usuário já existe, se você já é cadastrado faça o login com
                  o certificado
                </p>
                <div className="group">
                  <label htmlFor="nome" className="label">
                    nome
                  </label>
                  <Input name="nome" id="nome" type="text" className="input" />
                </div>
                <div className="group">
                  <label htmlFor="email" className="label">
                    email
                  </label>
                  <Input
                    name="email"
                    id="email"
                    type="text"
                    className="input"
                  />
                </div>
                <div className="group">
                  <label htmlFor="cpf" className="label">
                    cpf
                  </label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    className="input"
                    value={cpfMask(cpf)}
                    onChange={(e) => processar(e.target.value)}
                  />
                </div>
                <div className="group">
                  <label htmlFor="phone" className="label">
                    telefone celular
                  </label>
                  <Input
                    name="numero"
                    id="phone"
                    type="text"
                    className="input"
                    value={phoneMask(phone)}
                    onChange={(e) => processarPhone(e.target.value)}
                  />
                </div>
                <div className="group">
                  <label htmlFor="pass" className="label">
                    senha
                  </label>
                  <Input
                    name="password1"
                    id="pass"
                    type="password"
                    className="input"
                  />
                </div>
                <div className="group">
                  <label htmlFor="pass2" className="label">
                    repetir senha
                  </label>
                  <Input
                    name="password2"
                    id="pass2"
                    type="password"
                    className="input"
                  />
                </div>

                <div className="group">
                  <button
                    id="register"
                    type="submit"
                    className=" btn btn-primary button"
                    disabled={true}
                  >
                    Cadastre-se
                  </button>
                </div>
                <div className="hr"></div>
                <div className="foot-lnk">
                  <label htmlFor="tab-1">já tem uma conta ?</label>
                </div>
              </Form>
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

export default Login;