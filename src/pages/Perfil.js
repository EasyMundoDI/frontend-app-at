import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import Person from "../images/user.png";
import { cpfMask, phoneMask } from "../util/Mask";
import Image001 from "../images/PdfStamp.png";
import Signature from "../images/signature.png";
import SignatureCanvas from "react-signature-canvas";
import edit from "../images/edit2.png";

import edit2 from "../images/edit.png";
function Perfil() {
  const [user, setUser] = useState([]);
  const [avatar, setAvatar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  var numsStr = phone.replace(/[^0-9]/g, "");
  useEffect(() => {
    api.get("/auth/userinfo").then((user) => {
      api.get(`/uploadavatar/${user.data.id}`).then((resultAvatar) => {
        setAvatar(resultAvatar.data);
        setUser(user.data);
        setLoading(false);
      });
    });
  }, []);

  function updateNome() {
    var nome = document.getElementById(`form28`).value;
    api.put(`/user/setnome/${nome}`).then((result) => {
      window.location.reload(false);
    });
  }
  function updateEmail() {
    var email = document.getElementById(`form29`).value;
    api.put(`/user/setemail/${email}`).then((result) => {
      window.location.reload(false);
    });
  }
  function updatePhone() {
    api.put(`/user/setnumber/${parseInt(numsStr)}`).then((result) => {
      window.location.reload(false);
    });
  }
  const signCanvas = useRef([]);
  const canvasRef = useRef(null);
  const clear = () => signCanvas.current.clear();

  function save() {
    const signature = signCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    const image2 = new Image();
    const image = new Image();
    image2.src = Image001;

    image.src = signature;
    image.onload = function () {
      ctx.drawImage(image2, 0, 0);
      ctx.drawImage(image, 140, 70, 100, 75);
      ctx.fillStyle = "black";
      ctx.font = "9pt Arial";

      ctx.fillText(`Nome:${user.nome}`, 1, 30);
      ctx.fillText(`Cpf:${cpfMask(user.cpf)}`, 1, 60);

      ctx.fillText(`Email:${user.email}`, 1, 90);

      const carimbo = canvas.toDataURL("image/png");
      srcToFile(carimbo, `${user.nome}.png`, "image/png").then((file) => {
        const fd = new FormData();
        fd.append("userfile", file);
        return avatar === null
          ? api
              .post(`/uploadavatar/${user.id}`, fd, {
                nome: "signature",
                size: file.size,
              })
              .then((result) => {
                window.location.reload(false);
              })
          : api
              .put(`/uploadavatar/${avatar.id}`, fd, {
                nome: "signature",
                size: file.size,
              })
              .then((result) => {
                window.location.reload(false);
              });
      });
    };

    function srcToFile(src, fileName, mimeType) {
      return fetch(src)
        .then((res) => res.arrayBuffer())
        .then((buf) => new File([buf], fileName, { type: mimeType }));
    }
  }
  function processar(value) {
    setPhone(value);
    if (value.length < 15) {
      document.getElementById("adicionarnumero").disabled = true;
    } else {
      document.getElementById("adicionarnumero").disabled = false;
    }
  }

  return loading === true ? (
    <div className="main-container">
      {" "}
      <Loading />
    </div>
  ) : (
    <div className="main-container">
      <div
        class="modal fade"
        id="exampleModal4"
        tabindex="-1"
        aria-labelledby="exampleModalLabel2"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <p class="modal-title" id="exampleModalLabel2">
                insira sua rubrica <img src={Signature} alt="" />
              </p>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>
                {" "}
                insira sua rubrica no campo abaixo ,ela será usada no carimbo da
                assinatura eletrônica
              </p>{" "}
              <SignatureCanvas
                ref={signCanvas}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "sigCanvas",
                }}
              />
              <canvas
                ref={canvasRef}
                width={250}
                height={175}
                className="canvas-signature hidden"
              >
                <img className="canvas-img" src={Image001} alt="" />
              </canvas>
            </div>

            <button onClick={clear} type="button" class="btn btn-primary">
              Limpar
            </button>
            <button onClick={save} type="button" class="btn btn-primary">
              Salvar
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

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
                Alterar nome
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
            <div class="modal-body">
              <p>{user.nome}</p>
              <div className="md-form ml-0 mr-0">
                <input
                  type="text"
                  id="form28"
                  className="form-control form-control-sm validate ml-0"
                />
                <label
                  data-error="wrong"
                  data-success="right"
                  htmlFor="form28"
                  className="ml-0"
                >
                  Alterar nome
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                onClick={() => updateNome()}
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModal2"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Alterar email
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
            <div class="modal-body">
              <p>{user.email}</p>
              <div className="md-form ml-0 mr-0">
                <input
                  type="email"
                  id="form29"
                  className="form-control form-control-sm validate ml-0"
                />
                <label
                  data-error="wrong"
                  data-success="right"
                  htmlFor="form29"
                  className="ml-0"
                >
                  Alterar email
                </label>
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={() => updateEmail()}
                >
                  Alterar
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModal3"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Alterar Número de Telefone
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
            <div class="modal-body">
              <p>{phoneMask(user.number)}</p>
              <div className="md-form ml-0 mr-0">
                <input
                  type="text"
                  id="form30"
                  className="form-control form-control-sm validate ml-0"
                  value={phoneMask(phone)}
                  onChange={(e) => processar(e.target.value)}
                />
                <label
                  data-error="wrong"
                  data-success="right"
                  htmlFor="form30"
                  className="ml-0"
                >
                  Alterar número de Telefone
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                id="adicionarnumero"
                onClick={() => updatePhone()}
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModal5"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Alterar Número de Telefone
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
            <div class="modal-body">
              <p>{phoneMask(user.number)}</p>
              <div className="md-form ml-0 mr-0">
                <input
                  type="text"
                  id="form30"
                  className="form-control form-control-sm validate ml-0"
                  value={phoneMask(phone)}
                  onChange={(e) => processar(e.target.value)}
                />
                <label
                  data-error="wrong"
                  data-success="right"
                  htmlFor="form30"
                  className="ml-0"
                >
                  Alterar número de Telefone
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                id="adicionarnumero"
                onClick={() => updatePhone()}
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-profile">
        <div className="row">
          <div className="col container-user">
            <img src={Person} alt="" />
            <ul>
              <h5>
                {" "}
                {user.nome}{" "}
                <img
                  src={edit2}
                  alt=""
                  data-toggle="modal"
                  data-target="#exampleModal"
                />
              </h5>
              <li>
                <h6> {cpfMask(user.cpf)}</h6>
              </li>
              <li>
                {" "}
                <p>
                  {" "}
                  <i class="fas fa-envelope"></i> {user.email}{" "}
                  <img
                    src={edit2}
                    alt=""
                    data-toggle="modal"
                    data-target="#exampleModal2"
                  />
                </p>
              </li>
              <li>
                {" "}
                <p>
                  {" "}
                  <i class="fas fa-mobile-alt"></i> {phoneMask(user.number)}
                  <img
                    src={edit2}
                    alt=""
                    data-toggle="modal"
                    data-target="#exampleModal3"
                  />
                </p>
              </li>
              <li>
                {" "}
                <button
                  className="btn btn-dark"
                  data-toggle="modal"
                  data-target="#exampleModal5"
                >
                  {" "}
                  alterar senha
                </button>
              </li>
            </ul>
          </div>
          <div className="col-md-4 container-avatar">
            <h5>Minha Rubrica</h5>
            {avatar === null ? (
              <div>
                <div className="alert alert-danger" role="alert">
                  {" "}
                  A sua rubrica está pendente, adicione! será necessária para a
                  assinatura eletrônica{" "}
                  <p
                    className="modal-signature"
                    data-toggle="modal"
                    data-target="#exampleModal4"
                  >
                    &nbsp; clique aqui!
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p>
                  Altere a imagem da sua rubrica:{" "}
                  <img
                    className="img-rubrica"
                    data-toggle="modal"
                    data-target="#exampleModal4"
                    src={edit}
                    alt=""
                  />
                </p>
                <img
                  className="img-signature"
                  src={`${process.env.REACT_APP_BACKEND_URL}/files/${avatar.key}`}
                  alt=""
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
