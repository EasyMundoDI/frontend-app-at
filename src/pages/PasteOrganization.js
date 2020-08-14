import React, { useState, useEffect, useRef } from "react";
import Loading from "../components/Loading";
import api from "../services/api";
import moment from "moment";
import $ from "jquery";
import searchconclude from "../images/searchimg.png";
import { useParams } from "react-router-dom";
import hashids from "hashids";
import Folder from "../images/folderconfig.png";
import Caution from "../images/caution.png";
import Tick from "../images/tick.png";
import warning from "../images/warning.png";
import Filepdf from "../images/pdf.png";
import back from "../images/back.png";
import Folder1 from "../images/folder1.png";
import trash from "../images/trash.png";
import Filegeneric from "../images/filegeneric.png";
import move from "../images/move.png";
import { cpfMask, phoneMask } from "../util/Mask";
import Axios from "axios";
const hash = new hashids("", 35);
function PasteOrganization() {
  const { id } = useParams();
  const newid = hash.decode(id);
  const [orgsPaste, setOrgPaste] = useState([]);
  const [org, setOrg] = useState([]);
  const [displaypessoal, setDisplaypessoal] = useState(true);
  const [displayorg, setDisplayorg] = useState(false);
  const [checkvalue, setCheckValue] = useState([]);
  const [checkvalue2, setCheckValue2] = useState([]);
  const [displayconclude, setDisplayconclude] = useState(false);
  const [displaypending, setDisplaypending] = useState(true);
  const [allPaste, setAllPaste] = useState([]);
  const [organization, setOrganization] = useState([]);
  const [display3, setDisplay3] = useState(false);
  const [display2, setDisplay2] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pastePending, setPastePending] = useState([]);
  const [pasteSigned, setPasteSigned] = useState([]);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [display, setDisplay] = useState(false);
  const [orgsPastes, setOrgPastes] = useState([]);
  const currentRef = useRef(0);

  const currentRef2 = useRef(0);
  useEffect(() => {
    Axios.all([
      api.get(`/pasteorganization/${newid}`),
      api.get(`/user/userpaste`),
      api.get(`/user/organization`),
      api.get(`/user/organization/${newid}`),
    ]).then(
      Axios.spread((result, findAllPaste, organization, organization2) => {
        setOrgPastes(result.data);
        setOrg(organization2.data);
        setOrganization(organization.data);
        setAllPaste(findAllPaste.data);
        setLoading(false);
      })
    );
  }, []);

  function movePending() {
    if ($("#select-custom option:selected").text() === "pessoal") {
      var count = 0;
      checkvalue2.forEach((element, i, array) => {
        count++;
        api.get(`/user/paste/${hash.encode(element.id)}`).then((result) => {
          console.log(result);
          if (result.data == null) {
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

            if (count === array.length) {
              window.location.reload(false);
            }
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
        if (count === array.length) {
          window.location.reload(false);
        }
      });
    }
  }
  function moveSigned() {
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

            if (count === array.length) {
              window.location.reload(false);
            }
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
        if (count === array.length) {
          window.location.reload(false);
        }
      });
    }
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
  function backbutton() {
    window.history.back();
  }

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
        tabIndex="-1"
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
        tabIndex="-1"
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
        tabIndex="-1"
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
                            {allPaste.map((iten, i) => (
                              <option value={iten.id} key={i}>
                                {iten.nome}
                              </option>
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
                onClick={() => movePending()}
                type="button"
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
        tabIndex="-1"
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
                <i className="far fa-building"></i> <small>organização</small>
                <select
                  className="nav-link custom-select select-custom"
                  id="select-custom"
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
                    <option value={iten.id} key={i}>
                      {iten.nome}
                    </option>
                  ))}
                </select>
                <i className="fas fa-folder-open"></i>
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
                            id="select-custom"
                          >
                            {allPaste.map((iten, i) => (
                              <option value={iten.id} key={i}>
                                {iten.nome}
                              </option>
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
                          id="select-custom"
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
      <ul className="nav nav-pills nav-fill">
        <li className=" nav-item  nav-paste">
          <p>{org.nome}</p>
          <select
            className=" custom-select select-custom"
            id="select-custom"
            ref={currentRef}
            onChange={function () {
              setLoading3(true);
              api
                .get(`/pastependingorganization/${currentRef.current.value}`)
                .then((result) => {
                  api
                    .get(`/pastesignedorganization/${currentRef.current.value}`)
                    .then((result2) => {
                      setPastePending(result.data.pasteOrgPending);
                      setPasteSigned(result2.data.pasteOrgSigned);
                      setDisplay(true);
                      setLoading3(false);
                    });
                });
            }}
          >
            {" "}
            <option value="">selecione a pasta </option>
            {orgsPastes.map((iten, i) => (
              <option value={iten.id} key={i}>
                {iten.nome}
              </option>
            ))}
          </select>{" "}
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
          <div>
            <img
              className="img-fluid img-backbutton"
              id="img-paste"
              src={Folder1}
              alt=""
            />{" "}
            <div>
              {" "}
              {loading3 === true ? (
                <div>
                  <Loading />
                  <p>selecione uma pasta</p>
                </div>
              ) : (
                <div>
                  {" "}
                  <p>{currentRef.current.selectedOptions[0].innerText} </p>
                  <a
                    href="/"
                    data-toggle="modal"
                    data-target="#modalLoginAvatar"
                  >
                    <img
                      className="img-fluid img-backbutton"
                      id="img-paste"
                      title="configurar pasta"
                      src={Folder}
                      alt=""
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
          {display3 && (
            <div className="nav-edit">
              {" "}
              <img
                src={trash}
                alt=""
                id="img-delete"
                className="img-fluid img-backbutton"
                data-toggle="modal"
                data-target="#exampleModalpending"
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

        <li className="nav-item ">
          {displayconclude && (
            <div className="myinput2">
              <input type="text" id="myInput2" onKeyUp={() => myFunction2()} />{" "}
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

      {display && (
        <div>
          {" "}
          {loading3 === true ? (
            <div>
              <div className="container-loading">
                <Loading color="#3D92C2" height={80} width={80} />
              </div>
            </div>
          ) : (
            <div>
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
                        <span className="badge badge-danger">
                          {pastePending.length}
                        </span>
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
                        <span className="badge badge-success">
                          {pasteSigned.length}
                        </span>
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
                    {pastePending.map((iten, i) => (
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
                                    setDisplay3(true);
                                  }
                                  if (a.length < 1) {
                                    setDisplay3(false);
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
                                  {moment(iten.createdAt).format(
                                    "DD-MM-YY HH:mm:ss"
                                  )}
                                </small>
                              </a>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="user"
                      role="tabpanel"
                      aria-labelledby="user-tab"
                    ></div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  <ul className="list-group list-group-flush" id="myUL2">
                    {pasteSigned.map((iten, i) => (
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
                                  {moment(iten.createdAt).format(
                                    "DD-MM-YY HH:mm:ss"
                                  )}
                                </small>
                              </a>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}{" "}
        </div>
      )}
    </div>
  );
}

export default PasteOrganization;
