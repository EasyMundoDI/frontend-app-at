import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import api from "../services/api";
import { cpfMask } from "../util/Mask";
import BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import Input from "../components/MyInputs";
import { Form } from "@unform/web";
import tap from "../images/touch.png";
import DragNDrop from "../util/DragNDrop";
import $ from "jquery";
import "react-dropzone-uploader/dist/styles.css";
import "../styles/styles.css";
import Dropzone from "react-dropzone-uploader";
import * as Yup from "yup";
import hashids from "hashids";
import Axios from "axios";
import trash from "../images/trash.png";
const hash = new hashids("", 35);

function Document() {
  const formRef = useRef(null);

  const [valueOrderId, setOrderId] = useState();
  const [descriptionDoc, setDescriptionDoc] = useState();
  const [valuePastes, setValuePastes] = useState();

  const [isChecked3, setIsChecked3] = useState(true);

  /* block user interface*/
  const [block, setBlock] = useState(true);
  /* block user interface*/

  /*queries useEffect*/
  const [userOrganization, setUserOrganization] = useState([]);
  const [pastes, setPastes] = useState([]);
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  /*queries useEffect*/

  /* execute actions*/
  const [displayButton, setDisplayButton] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [signed, setSigned] = useState([]);
  const [pending, setPending] = useState(null);
  /* execute actions*/

  /*autocomplete */
  const [display, setDisplay] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(false);
  const [displayCpf, setDisplayCpf] = useState(false);
  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  /*autocomplete*/

  const history = useHistory();

  useEffect(() => {
    Axios.all([
      api.get(`/auth/userinfo`),
      api.get(`/user/searchusers`),
      api.get(`/user/organization`),
      api.get(`/user/userpaste`),
    ])
      .then(
        Axios.spread((user, users, infoOrg, infoPaste) => {
          setUser(user.data);
          setUsers(users.data);
          setUserOrganization(infoOrg.data);
          setPastes(infoPaste.data);
        })
      )
      .then(setBlock(false));
  }, []);

  /*global  */
  window.addEventListener("load", DragNDrop);

  /*global*/

  /*autocomplete */

  const handleAutoComplete = (nome, cpf, email) => {
    setSearchCpf(cpf);
    setSearchEmail(email);
    setSearch(nome);
    setDisplay(false);
    setDisplayEmail(false);
    setDisplayCpf(false);

    var cardSelector = document.querySelectorAll(".cards-dropzone");
    cardSelector.forEach((card) => {
      if (card.childNodes[2].innerText === nome) {
        document.getElementById("adicionar").disabled = true;
      }
      if (card.childNodes[3].innerText === cpf) {
        document.getElementById("adicionar").disabled = true;
      }
      if (card.childNodes[4].innerText === email) {
        document.getElementById("adicionar").disabled = true;
      }
    });
  };

  const handleCompleteName = (value) => {
    if (
      search.length === 0 ||
      searchCpf.length === 0 ||
      searchEmail.length === 0
    ) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearch(value);

    if (value.length === 3) {
      setDisplay(!display);
    } else if (value.length < 3) {
      setDisplay(false);
    }
  };
  const handleCompleteEmail = (value) => {
    if (
      search.length === 0 ||
      searchCpf.length === 0 ||
      searchEmail.length === 0
    ) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearchEmail(value);

    if (value.length === 3) {
      setDisplayEmail(!displayEmail);
    } else if (value.length < 3) {
      setDisplayEmail(false);
    }
  };
  const handleCompleteCpf = (value) => {
    if (
      search.length === 0 ||
      searchCpf.length === 0 ||
      searchEmail.length === 0
    ) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearchCpf(value);

    if (value.length === 3) {
      setDisplayCpf(!displayCpf);
    } else if (value.length < 3) {
      setDisplayCpf(false);
    }
  };

  /*autocomplete */

  /*drop-zone  */

  const handleChangeStatus = ({ meta }, status) => {
    if (status === "headers_received") {
      toast(`${meta.name} upload feito com sucesso!`);
    } else if (status === "aborted") {
      toast(`${meta.name}, falha no upload...`);
    }
  };
  const toast = (innerHTML) => {
    const el = document.getElementById("toast");
    el.innerHTML = innerHTML;
    el.className = "show";
    setTimeout(() => {
      el.className = el.className.replace("show", "");
      el.innerHTML = "";
    }, 3000);
  };

  const onSubmitFiles = (file) => {
    const fd = new FormData();
    setFileType(file[0].file.type);

    fd.append("userfile", file[0].file, file[0].file.name);
    api
      .post(`/user/userfiles`, fd, {
        nome: file[0].file.name,
        size: file[0].file.size,
      })
      .then((result) => {
        setFile(result.data.result[0]);
        document.getElementById("enviar").disabled = true;
        document.getElementById("adicionar").disabled = false;
        setDisplayButton(true);
      });
  };

  /*drop-zone */

  /* execute actions*/

  let pendingDocument = [];
  let orders = [];

  async function onSubmitDocument(data, { reset }) {
    try {
      const Schema = Yup.object().shape({
        nome: Yup.string().required("O nome é obrigatório"),
        cpf: Yup.string().required("O cpf é obrigatório"),
        email: Yup.string()
          .email("Digite um e-mail válido")
          .required("O e-mail é obrigatório"),
      });
      await Schema.validate(data, {
        abortEarly: false,
      });
      var types = document.querySelectorAll("input[name=type]:checked");
      api
        .get(`/findUser/${data.email}/${data.cpf.replace(/\D/g, "")}`)
        .then((resultUser) => {
          if (types[1]) {
            setSigned((searches) =>
              searches.concat({
                nome: data.nome,
                email: data.email,
                cpf: data.cpf,
                type: types[0].value,
                eletronic: types[1].value,
                signature: resultUser.data,
              })
            );
          } else {
            setSigned((searches) =>
              searches.concat({
                nome: data.nome,
                email: data.email,
                cpf: data.cpf,
                type: types[0].value,
                eletronic: "",
                signature: resultUser.data,
              })
            );
          }
        });

      document.getElementById("enviar").disabled = true;

      setSearch("");
      setSearchCpf("");
      setSearchEmail("");
      setDisplay(false);
      setDisplayCpf(false);
      setDisplayEmail(false);
      reset();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};
        err.inner.forEach((err) => {
          errorMessages[err.path] = err.message;
        });
        console.log(formRef.current);
        formRef.current.setErrors(errorMessages);
      }
    }
  }

  function onSubmitPromises() {
    let valorOrdens = document.getElementsByClassName("cards-dropzone");
    valorOrdens.forEach((value) => {
      console.log(value);
      orders.push({
        nome: value.childNodes[2].innerText,
        email: value.childNodes[3].innerText,
        cpf: value.childNodes[4].innerText.replace(/\D/g, ""),
        type: value.childNodes[1].innerText,
        signature: value.childNodes[6].innerText,
        eletronic: value.childNodes[5].innerText,
      });
    });

    let pasta = document.getElementById("pastas");
    let valorPastas = pasta.options[pasta.selectedIndex].value;

    let orgs = document.getElementById("orgs");
    let valorOrgs = orgs.options[orgs.selectedIndex].value;

    let description = document.getElementById("description").value;
    /** if action === application/pdf ? action == 0 : action == 1  **/
    var action;
    if (fileType === "application/pdf") {
      action = 0;
    } else {
      action = 1;
    }
    let pendingResult = {
      paste: valorPastas,
      organization: valorOrgs,
      descriptionDoc: description,
      action: action,
    };

    pendingDocument.push(pendingResult);

    /* result OnSubmitPromises*/
    let arrays = {
      pendingDocument,
      orders,
    };
    /* result OnSubmitPromises*/

    return Promise.resolve(arrays);
  }
  var counter = 0;
  var count = 0;
  function enviar() {
    onSubmitPromises().then(({ orders, pendingDocument }) => {
      setBlock(true);

      orders.forEach((order, i, array) => {
        api
          .get(`/findUser/${order.email}/${order.cpf}`)
          .then((resultadoUser) => {
            if (order.signature !== "usuário não registrado") {
              setTimeout(() => {
                api
                  .post(`/user/pending/${file.id}`, {
                    user_Id: resultadoUser.data.id,
                    action: pendingDocument[0].action,
                    nome: file.nome,
                    submetido: user.nome,
                    descriptionDoc: pendingDocument[0].descriptionDoc,
                  })
                  .then((resultadoPending) => {
                    setPending(resultadoPending.data.id);
                    if (pendingDocument[0].organization !== "0") {
                      api.post(
                        `/organization/pendingPaste/${resultadoPending.data.id}`,
                        { org: pendingDocument[0].organization }
                      );
                    }
                    if (pendingDocument[0].paste !== "0") {
                      api.post(
                        `/user/pendingPaste/${resultadoPending.data.id}`,
                        {
                          paste: pendingDocument[0].paste,
                        }
                      );
                    }
                    api
                      .post(`/user/order`, {
                        type: order.type,
                        signature: "pending",
                        signatureType:
                          order.eletronic === `AssinaturaEletrônica`
                            ? true
                            : false,
                        nome: order.nome,
                        email: order.email,
                        cpf: order.cpf,
                        conclude: false,
                        pending_Id: resultadoPending.data.id,
                      })
                      .then((result) => {
                        if (array.length === 1) {
                          api
                            .put(
                              `/${result.data.cpf}/ordem/${result.data.email}/user/${resultadoPending.data.id}`
                            )
                            .then((resultput) => {
                              counter++;
                              if (counter === array.length) {
                                const pendingId = hash.encode(
                                  resultadoPending.data.id
                                );
                                history.push(
                                  `/dashboard/document/pendingdocument/${pendingId}`,
                                  window.location.reload(false)
                                );
                              }
                            });
                        } else {
                          api
                            .put(
                              `/${array[0].cpf}/ordem/${array[0].email}/user/${resultadoPending.data.id}`
                            )
                            .then((resultput) => {});
                          if (count === 0) {
                            api
                              .post(`/eletronic/signature/${array[0].email}`, {
                                idPending: hash.encode(
                                  resultadoPending.data.id
                                ),
                                nome: array[0].nome,
                                pendingNome: resultadoPending.data.nome,
                                pendingDesc: pendingDocument[0].descriptionDoc,
                              })
                              .then((resultpending) => {});
                            count++;
                          }
                        }
                        counter++;
                        if (counter === array.length) {
                          const pendingId = hash.encode(
                            resultadoPending.data.id
                          );
                          history.push(
                            `/dashboard/document/pendingdocument/${pendingId}`,
                            window.location.reload(false)
                          );
                        }
                      });
                  });
              }, i * 5000);
            }
            if (order.signature === "usuário não registrado") {
              setTimeout(() => {
                api
                  .post(`/strange/pending/${file.id}`, {
                    cpf: order.cpf,
                    email: order.email,
                    action: pendingDocument[0].action,
                    nome: order.nome,
                    nomeFile: file.nome,
                    submetido: user.nome,
                    descriptionDoc: pendingDocument[0].descriptionDoc,
                  })
                  .then((resultadoPending) => {
                    setPending(resultadoPending.data.id);

                    api
                      .post(`/user/order`, {
                        type: order.type,
                        signature: "strange",
                        signatureType:
                          order.eletronic === `AssinaturaEletrônica`
                            ? true
                            : false,
                        nome: order.nome,
                        email: order.email,
                        cpf: order.cpf,
                        conclude: false,
                        pending_Id: resultadoPending.data.id,
                      })
                      .then((result) => {
                        if (array.length === 1) {
                          api
                            .post(`/eletronic/strange/${result.data.email}`, {
                              idPending: hash.encode(resultadoPending.data.id),
                              nome: array[0].nome,
                            })
                            .then((result) => {});
                          api.put(
                            `/${result.data.cpf}/ordem/${result.data.email}/user/${resultadoPending.data.id}`
                          );
                        } else {
                          api.put(
                            `/${array[0].cpf}/ordem/${array[0].email}/user/${resultadoPending.data.id}`
                          );
                          if (count === 0) {
                            api
                              .post(`/eletronic/signature/${array[0].email}`, {
                                idPending: hash.encode(
                                  resultadoPending.data.id
                                ),
                                nome: array[0].nome,
                                pendingNome: resultadoPending.data.nome,
                                pendingDesc: pendingDocument[0].descriptionDoc,
                              })
                              .then((resultpending) => {});
                            count++;
                          }
                        }
                        counter++;
                        if (counter === array.length) {
                          const pendingId = hash.encode(
                            resultadoPending.data.id
                          );
                          history.push(
                            `/dashboard/document/pendingdocument/${pendingId}`,
                            window.location.reload(false)
                          );
                        }
                      });
                  });
              }, i * 5000);
            }
          });
      });
    });
  }

  /* execute actions*/
  $(function () {
    $(".img-dropzone").click(function () {
      $(this).closest(".cards-dropzone").remove();
      return false;
    });
  });

  $("#checkboxTypeSignatario").change(function () {
    if ($(this).is(":checked")) {
      $(".eletronic-signature").removeClass("hidden");
    }
  });
  $("#checkboxTypeAprovador").change(function () {
    if ($(this).is(":checked")) {
      $(".eletronic-signature").addClass("hidden");
    }
  });
  $("#checkboxTypeObservador").change(function () {
    if ($(this).is(":checked")) {
      $(".eletronic-signature").addClass("hidden");
    }
  });

  return block === true ? (
    <div>
      <BlockUi tag="div" blocking={block}></BlockUi>
    </div>
  ) : (
    <div className="main-container">
      <div id="toast"> </div>

      <Dropzone
        multiple={false}
        maxFiles={1}
        inputContent="Clique aqui ou arraste e solte documentos"
        onSubmit={onSubmitFiles}
        getUploadParams={() => ({ url: "https://httpbin.org/post" })}
        onChangeStatus={handleChangeStatus}
        styles={{ dropzone: { minHeight: 200, maxHeight: 250 } }}
        submitButtonDisabled={displayButton}
      />
      <div className="container-description form__group field">
        <input
          type="input"
          className="form__field"
          placeholder="adicionar descrição ao documento"
          id="description"
        />
        <label htmlFor="description" className="form__label">
          adicionar descrição ao documento
        </label>
      </div>

      <div className="container-select col-lg-7">
        <select className="custom-select select-custom" id="pastas">
          <option value={0}>Pastas pessoais</option>
          {pastes.map((v, i) => (
            <option value={v.id} key={i}>
              {v.nome}
            </option>
          ))}
        </select>

        <select className="custom-select select-custom" id="orgs">
          <option value={0}>sem organizações</option>
          {userOrganization.map((v, i) => (
            <option value={v.id} key={i}>
              {v.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <div className="container-participante col-lg-5">
          <h5>Participantes</h5>
          <p>Escolha os usuários que devem tomar ações no documento:</p>
          <div id="signatario" className="">
            <div className="types">
              <li>
                {" "}
                <input
                  type="radio"
                  id="checkboxTypeSignatario"
                  name="type"
                  defaultChecked
                  value={"signatario"}
                />{" "}
                <label
                  htmlFor="checkboxTypeSignatario"
                  className="list-nome-types"
                >
                  <i className="fas fa-pencil-alt" />
                  signatário
                </label>
              </li>
              <li>
                <input
                  type="radio"
                  id="checkboxTypeAprovador"
                  name="type"
                  value={"aprovador"}
                />{" "}
                <label
                  htmlFor="checkboxTypeAprovador"
                  className="list-nome-types"
                >
                  <i className="fas fa-clipboard-check" />
                  aprovador
                </label>{" "}
              </li>
              <li>
                <input
                  type="radio"
                  name="type"
                  id="checkboxTypeObservador"
                  value={"observador"}
                />{" "}
                <label
                  htmlFor="checkboxTypeObservador"
                  className="list-nome-types"
                >
                  <i className="fas fa-eye" />
                  observador
                </label>{" "}
              </li>
            </div>
            <div className="eletronic-signature">
              <li>
                {" "}
                <input
                  type="checkbox"
                  id="checkboxTypeEletronic"
                  name="type"
                  value={"AssinaturaEletrônica"}
                />{" "}
                <label
                  htmlFor="checkboxTypeEletronic"
                  className="list-nome-types"
                >
                  <i className="fas fa-signature" />
                  permitir assinatura eletrônica
                </label>
              </li>
            </div>
            <Form onSubmit={onSubmitDocument} ref={formRef}>
              <Input
                value={search}
                name="nome"
                type="text"
                onChange={(e) => handleCompleteName(e.target.value)}
              />
              {display && (
                <div className="container-autocomplete">
                  {users
                    .filter(
                      ({ nome }) =>
                        nome.toLowerCase().indexOf(search.toLowerCase()) > -1
                    )
                    .map((v, i) => (
                      <div
                        className="card-autocomplete"
                        onClick={() =>
                          handleAutoComplete(v.nome, v.cpf, v.email)
                        }
                        key={i}
                      >
                        {" "}
                        <li>{v.nome}</li>
                        <li>{cpfMask(v.cpf)}</li>
                        <li>{v.email}</li>
                      </div>
                    ))}
                </div>
              )}
              <Input
                name="cpf"
                type="text"
                value={cpfMask(searchCpf)}
                onChange={(e) => handleCompleteCpf(e.target.value)}
              />
              {displayCpf && (
                <div className="container-autocomplete">
                  {users
                    .filter(
                      ({ cpf }) =>
                        cpf
                          .toLowerCase()
                          .indexOf(searchCpf.replace(/\D/g, "")) > -1
                    )
                    .map((v, i) => (
                      <div
                        className="card-autocomplete"
                        onClick={() =>
                          handleAutoComplete(v.nome, v.cpf, v.email)
                        }
                        key={i}
                      >
                        {" "}
                        <li>{v.nome}</li>
                        <li>{cpfMask(v.cpf)}</li>
                        <li>{v.email}</li>
                      </div>
                    ))}
                </div>
              )}

              <Input
                onChange={(e) => handleCompleteEmail(e.target.value)}
                name="email"
                type="text"
                value={searchEmail}
              />
              {displayEmail && (
                <div className="container-autocomplete">
                  {users
                    .filter(
                      ({ email }) =>
                        email.toLowerCase().indexOf(searchEmail.toLowerCase()) >
                        -1
                    )
                    .map((v, i) => (
                      <div
                        className="card-autocomplete"
                        onClick={() =>
                          handleAutoComplete(v.nome, v.cpf, v.email)
                        }
                        key={i}
                      >
                        {" "}
                        <li>{v.nome}</li>
                        <li>{cpfMask(v.cpf)}</li>
                        <li>{v.email}</li>
                      </div>
                    ))}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-cyan mt-1"
                id="adicionar"
              >
                adicionar
              </button>
            </Form>
          </div>
        </div>
        <div className="container-boards col-lg-5">
          <div className="container-board">
            <h5>
              <img src={tap} alt="" /> clique e arraste para mudar a posição das
              ordens
            </h5>

            <div className="container-dropzone" id="main">
              {signed.map((element, i) => (
                <div
                  key={i}
                  className="cards-dropzone"
                  draggable="true"
                  id="cards-dropzone"
                >
                  <div className="status"></div>
                  <div className="content-type">
                    <img src={trash} alt="" className="img-dropzone" />
                    <small>{element.type}</small>
                  </div>

                  <div className="content">
                    <h5>{element.nome}</h5>
                  </div>

                  <div className="content-email">
                    <p>{element.email}</p>
                  </div>
                  <div className="content-cpf">
                    <p>{element.cpf}</p>
                  </div>
                  <div className="content-eletronic">
                    <p>{element.eletronic}</p>
                  </div>
                  <div className="content-signature">
                    {element.signature === "strangeUser" ? (
                      <p>usuário não registrado</p>
                    ) : (
                      <p></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {file !== null ? (
        <div className="buttonAdicionar">
          <button
            className="btn btn-cyan mt-1"
            id="enviar"
            onClick={() => enviar()}
          >
            {" "}
            ENVIAR
          </button>
        </div>
      ) : (
        <div className="buttonAdicionar">
          <button
            className="btn btn-cyan mt-1"
            id="enviar"
            onClick={() => enviar()}
            disabled={true}
          >
            {" "}
            ENVIAR
          </button>
        </div>
      )}
    </div>
  );
}

export default Document;
