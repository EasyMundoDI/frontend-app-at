import React, { useState, useEffect, useRef } from "react";
import warning from "../images/warning.png";
import api from "../services/api";
import Loading from "../components/Loading";
import axios from "axios";
import hashids from "hashids";
import move from "../images/move.png";
import moment from "moment";
import $ from "jquery";
import back from "../images/back.png";
import searchimg from "../images/search.png";
import searchconclude from "../images/searchimg.png";
import Tick from "../images/tick.png";
import organizationimage from "../images/organization.png";
import Filepdf from "../images/pdf.png";
import Filegeneric from "../images/filegeneric.png";
import Adduser from "../images/adduser.png";
import trash from "../images/trash.png";
import world from "../images/world.png";
import Caution from "../images/caution.png";
const hash = new hashids("", 35);
function DocumentViewer() {
  const [pending, setPending] = useState([]);
  const [infoUser, setInfoUser] = useState();
  const [display, setDisplay] = useState(false);
  const [displaypessoal, setDisplaypessoal] = useState(true);
  const [displayorg, setDisplayorg] = useState(false);
  const [display2, setDisplay2] = useState(false);
  const [signed, setSigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [pasteUser, setPasteUser] = useState([]);
  const [orgsPaste, setOrgPaste] = useState([]);
  const [checkvalue, setCheckValue] = useState([]);
  const [displayconclude, setDisplayconclude] = useState(false);
  const [displaypending, setDisplaypending] = useState(true);
  const [checkvalue2, setCheckValue2] = useState([]);
  const [organization, setOrganization] = useState([]);
  const currentRef = useRef();
  const currentRef2 = useRef();
  useEffect(() => {
    axios
      .all([
        api.get(`/auth/userinfo`),
        api.get(`/user/userpaste`),
        api.get(`/user/organization`),
      ])
      .then(
        axios.spread((findInfo, loadpaste, organization) => {
          setOrganization(organization.data);
          setInfoUser(findInfo.data);
          api
            .get(`/user/pendingall/${findInfo.data.email}`)
            .then((findDocument) => {
              setPending(findDocument.data);
              api
                .get(`/user/${findInfo.data.nome}/signedall`)
                .then((findSigned) => {
                  setSigned(findSigned.data);
                  setPasteUser(loadpaste.data);
                  setLoading(false);
                });
            });
        })
      );
  }, []);

  function backbutton() {
    window.history.back();
  }

  function deleteDocuments() {
    const a = document.querySelectorAll("input.inputpending:checked");
    var count = 0;

    a.forEach((element, index, array) => {
      api
        .delete(`/user/${hash.encode(element.value)}/pending`)
        .then((result) => {
          count++;
          if (count === array.length) {
            window.location.reload(false);
          }
        });
    });
  }
  function deleteDocumentsSigned() {
    const a = document.querySelectorAll("input.inputsigned:checked");
    var count = 0;
    a.forEach((element, index, array) => {
      api
        .delete(`/user/${hash.encode(element.value)}/signed`)
        .then((result) => {
          count++;
          if (count === array.length) {
            window.location.reload(false);
          }
        });
    });
  }
  function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("p")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
  function myFunction2() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput2");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL2");
    li = ul.getElementsByTagName("li");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("p")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  $(".inputsigned").click(function () {
    var selectedSigned = new Array();
    var n = $(".inputsigned:checked").val();

    if (n > 0) {
      $(".inputsigned:checked").each(function () {
        selectedSigned.push({
          id: $(this).val(),
          name: $(this).data("name"),
          description: $(this).data("description"),
        });
      });
    }
    setCheckValue(selectedSigned);
  });
  $(".inputpending").click(function () {
    var selectedSigned = new Array();
    var n = $(".inputpending:checked").val();

    if (n > 0) {
      $(".inputpending:checked").each(function () {
        selectedSigned.push({
          id: $(this).val(),
          name: $(this).data("name"),
          description: $(this).data("description"),
        });
      });
    }
    setCheckValue2(selectedSigned);
  });

  function movePending() {
    if ($("#select-custom option:selected").text() === "pessoal") {
      var count = 0;
      checkvalue2.forEach((element, i, array) => {
        count++;
        api.get(`/user/paste/${hash.encode(element.id)}`).then((result) => {
          if (result.data.length < 1) {
            api
              .post(`/user/pendingPaste/${element.id}`, {
                paste: $("#select-customoption option:selected").val(),
              })
              .then((result) => {});

            if (count === array.length) {
              window.location.reload(false);
            }
          } else {
            api
              .put(
                `/user/${element.id}/pendingpaste/${$(
                  "#select-customoption option:selected"
                ).val()}`
              )
              .then((result) => {});

            setTimeout(() => {
              if (count === array.length) {
                window.location.reload(false);
              }
            }, 2000);
          }
        });
      });
    } else {
      var count = 0;
      checkvalue2.forEach((element, i, array) => {
        count++;
        if ($("#select-customoption option:selected").text() === "sem pasta") {
          api
            .get(`/organization/pendingPaste/${hash.encode(element.id)}`)
            .then((result) => {
              if (result.data.length < 1) {
                api.post(`/organization/pendingPaste/${element.id}`, {
                  org: $("#select-custom option:selected").val(),
                });
              } else {
                api.put(
                  `/user/${element.id}/pendingorganization/${$(
                    "#select-custom option:selected"
                  ).val()}`
                );
              }
            });
        } else {
          api
            .get(
              `/pastependingorganization/${$(
                "#select-customoption option:selected"
              ).val()}`
            )
            .then((result) => {
              if (result.data.pasteOrgPending.length < 1) {
                api.post(
                  `/pastependingorganization/${$(
                    "#select-customoption option:selected"
                  ).val()}/${element.id}`
                );
              } else {
                api.post(
                  `/pastependingremoveorganization/${result.data.id}/${element.id}`
                );
                api.post(
                  `/pastependingorganization/${$(
                    "#select-customoption option:selected"
                  ).val()}/${element.id}`
                );
              }
            });
        }
        setTimeout(() => {
          if (count === array.length) {
            window.location.reload(false);
          }
        }, 2000);
      });
    }
  }
  function moveSigned() {
    if ($("#select-custom2 option:selected").text() === "pessoal") {
      var count = 0;
      checkvalue.forEach((element, i, array) => {
        count++;
        api
          .get(`/user/paste/signed/${hash.encode(element.id)}`)
          .then((result) => {
            if (result.data.length < 1) {
              api
                .post(`/user/signedPaste/${element.id}`, {
                  paste: $("#select-customoption2 option:selected").val(),
                })
                .then((result) => {});

              setTimeout(() => {
                if (count === array.length) {
                  window.location.reload(false);
                }
              }, 2000);
            } else {
              api
                .put(
                  `/user/${element.id}/signedpaste/${$(
                    "#select-customoption2 option:selected"
                  ).val()}`
                )
                .then((result) => {});
              setTimeout(() => {
                if (count === array.length) {
                  window.location.reload(false);
                }
              }, 2000);
            }
          });
      });
    } else {
      var count = 0;

      checkvalue.forEach((element, i, array) => {
        count++;
        if ($("#select-customoption2 option:selected").text() === "sem pasta") {
          api
            .get(`/organization/signedPaste/${hash.encode(element.id)}`)
            .then((result) => {
              if (result.data.length < 1) {
                api.post(`/organization/signedPaste/${element.id}`, {
                  org: $("#select-custom2 option:selected").val(),
                });
              } else {
                api.put(
                  `/user/${element.id}/signedorganization/${$(
                    "#select-custom2 option:selected"
                  ).val()}`
                );
              }
            });
        } else {
          api
            .get(
              `/pastesignedorganization/${$(
                "#select-customoption2 option:selected"
              ).val()}`
            )
            .then((result) => {
              if (result.data.pasteOrgSigned.length < 1) {
                api.post(
                  `/pastesignedorganization/${$(
                    "#select-customoption2 option:selected"
                  ).val()}/${element.id}`
                );
              } else {
                api.post(
                  `/pastesignedremoveorganization/${result.data.id}/${element.id}`
                );
                api.post(
                  `/pastesignedorganization/${$(
                    "#select-customoption2 option:selected"
                  ).val()}/${element.id}`
                );
              }
            });
        }
      });
    }
  }

  return loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div className="main-container">
      <div
        class="modal fade"
        id="exampleModalpending"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                <img src={warning} alt="" /> excluir documentos
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
              <ul className="list-group list-group-flush" id="myUL2">
                {checkvalue2.map((iten, i) => (
                  <li className="list-group-item-success" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <p>{iten.name}</p>
                        </div>
                        <div className="col ">
                          <p>{iten.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-danger"
                onClick={() => deleteDocuments()}
              >
                excluir documentos pendentes
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModalsigned"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                <img src={warning} alt="" /> excluir documentos
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
              <ul className="list-group list-group-flush" id="myUL2">
                {checkvalue.map((iten, i) => (
                  <li className="list-group-item-success" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <p>{iten.name}</p>
                        </div>
                        <div className="col ">
                          <p>{iten.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-danger"
                onClick={() => deleteDocumentsSigned()}
              >
                excluir documentos concluídos
              </button>
            </div>
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
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                mover documentos pendentes{" "}
                <span className="badge badge-danger">{checkvalue2.length}</span>
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
              <div className="modal-select">
                <i className="far fa-building"></i> <small>organização</small>
                <select
                  className="nav-link custom-select select-custom"
                  id="select-custom"
                  ref={currentRef2}
                  onChange={function () {
                    setDisplayorg(false);
                    setLoading2(true);
                    if (
                      currentRef2.current.selectedOptions[0].innerText !==
                      "pessoal"
                    ) {
                      setDisplaypessoal(false);
                      setDisplayorg(true);
                      api
                        .get(`/pasteorganization/${currentRef2.current.value}`)
                        .then((result) => {
                          setOrgPaste(result.data);
                          setLoading2(false);
                        });
                    }
                    if (
                      currentRef2.current.selectedOptions[0].innerText ===
                      "pessoal"
                    ) {
                      setDisplayorg(false);
                      setDisplaypessoal(true);
                    }
                  }}
                >
                  <option value={0}>pessoal</option>
                  {organization.map((iten, i) => (
                    <option value={iten.id} key={i}>
                      {iten.nome}
                    </option>
                  ))}
                </select>
                <i className="fas fa-folder-open"></i> <small>Pastas</small>
                {displaypessoal && (
                  <div>
                    {loading === true ? (
                      <Loading />
                    ) : (
                      <div>
                        <div>
                          {" "}
                          <select
                            className="nav-link custom-select select-custom"
                            id="select-customoption"
                          >
                            {pasteUser.map((iten, i) => (
                              <option value={iten.id}>{iten.nome}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {displayorg && (
                  <div>
                    {loading2 === true ? (
                      <Loading />
                    ) : (
                      <div>
                        {" "}
                        <select
                          className="nav-link custom-select select-custom"
                          id="select-customoption"
                        >
                          <option value={0}>sem pasta</option>
                          {orgsPaste.map((iten, i) => (
                            <option value={iten.id}>{iten.nome}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => movePending()}
                class="btn btn-primary"
              >
                mover
              </button>
              <ul className="list-group list-group-flush" id="myUL2">
                {checkvalue2.map((iten, i) => (
                  <li className="list-group-item-success" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <p>{iten.name}</p>
                        </div>
                        <div className="col ">
                          <p>{iten.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModal2"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel2"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel2">
                mover documentos concluídos{" "}
                <span className="badge badge-info">{checkvalue.length}</span>
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
              <div className="modal-select">
                <small>organização</small>
                <select
                  className="nav-link custom-select select-custom"
                  id="select-custom2"
                  ref={currentRef}
                  onChange={function () {
                    setDisplayorg(false);
                    setLoading2(true);
                    if (
                      currentRef.current.selectedOptions[0].innerText !==
                      "pessoal"
                    ) {
                      setDisplaypessoal(false);
                      setDisplayorg(true);
                      api
                        .get(`/pasteorganization/${currentRef.current.value}`)
                        .then((result) => {
                          setOrgPaste(result.data);
                          setLoading2(false);
                        });
                    }
                    if (
                      currentRef.current.selectedOptions[0].innerText ===
                      "pessoal"
                    ) {
                      setDisplayorg(false);
                      setDisplaypessoal(true);
                    }
                  }}
                >
                  <option value={0}>pessoal</option>
                  {organization.map((iten, i) => (
                    <option
                      className="organization-option"
                      value={iten.id}
                      key={i}
                    >
                      {iten.nome}
                    </option>
                  ))}
                </select>
                <small>Pastas</small>
                {displaypessoal && (
                  <div>
                    {loading === true ? (
                      <Loading />
                    ) : (
                      <div>
                        <div>
                          {" "}
                          <select
                            className="nav-link custom-select select-custom"
                            id="select-customoption2"
                          >
                            {pasteUser.map((iten, i) => (
                              <option value={iten.id}>{iten.nome}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {displayorg && (
                  <div>
                    {loading2 === true ? (
                      <Loading />
                    ) : (
                      <div>
                        {" "}
                        <select
                          className="nav-link custom-select select-custom"
                          id="select-customoption2"
                        >
                          <option value={0}>sem pasta</option>
                          {orgsPaste.map((iten, i) => (
                            <option value={iten.id}>{iten.nome}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => moveSigned()}
                type="button"
                class="btn btn-primary"
              >
                mover
              </button>
              <ul className="list-group list-group-flush" id="myUL2">
                {checkvalue.map((iten, i) => (
                  <li className="list-group-item-success" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <p>{iten.name}</p>
                        </div>
                        <div className="col ">
                          <p>{iten.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
      <div>
        <ul className="nav nav-pills nav-fill">
          <li className="nav-item nav-paste">
            {" "}
            <p>
              {" "}
              <img
                className="img-fluid img-backbutton"
                title="voltar"
                src={back}
                alt=""
                onClick={() => backbutton()}
              />{" "}
            </p>
            {display && (
              <div className="nav-edit">
                {" "}
                <img
                  data-toggle="modal"
                  data-target="#exampleModalpending"
                  src={trash}
                  alt=""
                  id="img-delete"
                  className="img-fluid img-backbutton"
                />{" "}
                <img
                  src={move}
                  alt=""
                  id="img-delete"
                  className="img-fluid img-backbutton"
                  data-toggle="modal"
                  data-target="#exampleModal"
                />
              </div>
            )}{" "}
            {display2 && (
              <div className="nav-edit">
                <img
                  src={trash}
                  alt=""
                  className="img-fluid img-backbutton"
                  data-toggle="modal"
                  data-target="#exampleModalsigned"
                />
                <img
                  src={move}
                  alt=""
                  id="img-delete"
                  className="img-fluid img-backbutton"
                  data-toggle="modal"
                  data-target="#exampleModal2"
                />
              </div>
            )}{" "}
          </li>
          <li className="nav-item"></li>

          <li className="nav-item">
            {displayconclude && (
              <div className="myinput2">
                <input
                  type="text"
                  id="myInput2"
                  onKeyUp={() => myFunction2()}
                />{" "}
                <img src={searchconclude} alt="" />
              </div>
            )}
            {displaypending && (
              <div className="myinput2">
                <input type="text" id="myInput" onKeyUp={() => myFunction()} />{" "}
                <img src={searchconclude} alt="" />
              </div>
            )}
          </li>
        </ul>
        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <a
              className="nav-link active"
              id="pending-tab"
              data-toggle="tab"
              href="#pending"
              role="tab"
              aria-controls="pending"
              aria-selected="true"
              onClick={function () {
                setDisplayconclude(false);
                setDisplaypending(true);
              }}
            >
              <div className="document-pending">
                {" "}
                <img src={Caution} alt="" />{" "}
                <p>
                  documentos pendentes
                  <span className="badge badge-danger">{pending.length}</span>
                </p>
              </div>
            </a>
          </li>

          <li className="nav-item" role="presentation">
            <a
              className="nav-link"
              id="profile-tab"
              data-toggle="tab"
              href="#profile"
              role="tab"
              aria-controls="profile"
              aria-selected="false"
              onClick={function () {
                setDisplaypending(false);
                setDisplayconclude(true);
              }}
            >
              <div className="document-concluido">
                {" "}
                <img src={Tick} alt="" />{" "}
                <p>
                  documentos concluídos
                  <span className="badge badge-success">{signed.length}</span>
                </p>
              </div>
            </a>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent">
          <div
            className="tab-pane fade show active"
            id="pending"
            role="tabpanel"
            aria-labelledby="pending-tab"
          >
            <ul className="list-group list-group-flush" id="myUL">
              {pending.map((iten, i) => (
                <li className="list-group-item-danger" key={i}>
                  <div className="container">
                    <div className="row">
                      <div className="col ">
                        <input
                          type="checkbox"
                          id={iten.id}
                          name="type"
                          className="inputpending"
                          value={iten.id}
                          data-name={iten.nome}
                          data-description={iten.description}
                          onChange={function () {
                            const a = document.querySelectorAll(
                              "input:checked"
                            );
                            if (a.length >= 1) {
                              setDisplay(true);
                            }
                            if (a.length < 1) {
                              setDisplay(false);
                            }
                          }}
                        />{" "}
                        <label
                          htmlFor={iten.id}
                          className="list-nome-types"
                        ></label>
                        <a
                          href={`/dashboard/document/pendingdocument/${hash.encode(
                            iten.id
                          )}`}
                        >
                          {iten.action === 0 ? (
                            <div>
                              <img
                                className=" img-fluid "
                                src={Filepdf}
                                alt=""
                              />
                            </div>
                          ) : (
                            <div>
                              <img
                                className=" img-fluid "
                                src={Filegeneric}
                                alt=""
                              />
                            </div>
                          )}
                          <p>{iten.nome}</p>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <a
                          href={`/dashboard/document/pendingdocument/${hash.encode(
                            iten.id
                          )}`}
                        >
                          <small>{iten.description}</small>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <a
                          href={`/dashboard/document/signed/${hash.encode(
                            iten.id
                          )}`}
                        >
                          <small>
                            {" "}
                            {moment(iten.createdAt).format("DD-MM-YY HH:mm:ss")}
                          </small>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <div className="list-pastes">
                          <div className="list-pastes-itens">
                            {iten.OrganizationPaste.length < 1 ? (
                              <div>
                                <a href="/dashboard/organization">
                                  <i className="far fa-building" />
                                </a>
                              </div>
                            ) : (
                              <div>
                                <a
                                  href={`/dashboard/organization/${hash.encode(
                                    iten.OrganizationPaste[0].id
                                  )}`}
                                >
                                  <i className="far fa-building" />{" "}
                                  {iten.OrganizationPaste[0].nome}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="list-pastes-itens">
                            {iten.pastePendings.length < 1 ? (
                              <div>
                                <a href="/dashboard/pastas">
                                  <i className="fas fa-folder" />
                                </a>
                              </div>
                            ) : (
                              <div>
                                <a
                                  href={`/dashboard/pastas/${hash.encode(
                                    iten.pastePendings[0].id
                                  )}`}
                                >
                                  <i className="fas fa-folder" />{" "}
                                  {iten.pastePendings[0].nome}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="tab-pane fade"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <ul className="list-group list-group-flush" id="myUL2">
              {signed.map((iten, i) => (
                <li className="list-group-item-success" key={i}>
                  <div className="container">
                    <div className="row">
                      <div className="col ">
                        <input
                          type="checkbox"
                          id={iten.id}
                          name="type"
                          className="inputsigned"
                          value={iten.id}
                          data-name={iten.nome}
                          data-description={iten.description}
                          onChange={function () {
                            const c = document.querySelectorAll(
                              "input:checked"
                            );
                            if (c.length >= 1) {
                              setDisplay2(true);
                            }
                            if (c.length < 1) {
                              setDisplay2(false);
                            }
                          }}
                        />{" "}
                        <label
                          htmlFor={iten.id}
                          className="list-nome-types"
                        ></label>
                        <a
                          href={`/dashboard/document/signed/${hash.encode(
                            iten.id
                          )}`}
                        >
                          {iten.action === 0 ? (
                            <div>
                              <img
                                className=" img-fluid "
                                src={Filepdf}
                                alt=""
                              />
                            </div>
                          ) : (
                            <div>
                              <img
                                className=" img-fluid "
                                src={Filegeneric}
                                alt=""
                              />
                            </div>
                          )}
                          <p>{iten.nome}</p>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <a
                          href={`/dashboard/document/signed/${hash.encode(
                            iten.id
                          )}`}
                        >
                          <small>{iten.description}</small>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <a
                          href={`/dashboard/document/signed/${hash.encode(
                            iten.id
                          )}`}
                        >
                          <small>
                            {" "}
                            {moment(iten.createdAt).format("DD-MM-YY HH:mm:ss")}
                          </small>
                        </a>
                      </div>
                      <div className="col">
                        {" "}
                        <div className="list-pastes">
                          <div className="list-pastes-itens">
                            {iten.OrganizationSigned.length < 1 ? (
                              <div>
                                <a href="/dashboard/organization">
                                  <i className="far fa-building" />
                                </a>
                              </div>
                            ) : (
                              <div>
                                <a
                                  href={`/dashboard/organization/${hash.encode(
                                    iten.OrganizationSigned[0].id
                                  )}`}
                                >
                                  <i className="far fa-building" />{" "}
                                  {iten.OrganizationSigned[0].nome}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="list-pastes-itens">
                            {iten.pasteSigned.length < 1 ? (
                              <div>
                                <a href="/dashboard/pastas">
                                  <i className="fas fa-folder" />
                                </a>
                              </div>
                            ) : (
                              <div>
                                <a
                                  href={`/dashboard/pastas/${hash.encode(
                                    iten.pasteSigned[0].id
                                  )}`}
                                >
                                  <i className="fas fa-folder" />{" "}
                                  {iten.pasteSigned[0].nome}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
