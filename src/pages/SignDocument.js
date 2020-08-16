import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import api from "../services/api";
import moment from "moment";
import { cpfMask, phoneMask } from "../util/Mask";
import LacunaWebPki from "web-pki";
import Iframe from "react-iframe";
import axios from "axios";
import Person from "../images/user.png";
import BlockUi from "react-block-ui";
import hashids from "hashids";
import Phone from "../images/phone.png";
import Filegeneric from "../images/filegeneric.png";
import AlertTelefone from "../components/AlertTelefone";
import $ from "jquery";
import Loading from "../components/Loading";
const hash = new hashids("", 35);

const pki = new LacunaWebPki();

function SignDocument() {
  const { id } = useParams();
  const [findUser, setFindUser] = useState();
  const [block, setBlock] = useState(false);
  const [cod, setCod] = useState("");
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentPaste, setCurrentPaste] = useState(null);
  const [findPending, setFindPending] = useState();
  const [currentFile, setCurrentFile] = useState([]);
  const [findOrder, setFindOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [erros, setErros] = useState(null);
  const [status, setStatus] = useState(true);
  const history = useHistory();
  const [currentOrder, setCurrentOrder] = useState([]);

  const idPending = id;

  useEffect(() => {
    axios
      .all([
        api.get(`/pending/${id}`),
        api.get(`/auth/userinfo`),
        api.get(`/user/order/${id}`),
        api.get(`/user/paste/${id}`),
        api.get("/user/searchuser"),
        api.get(`/organization/pendingPaste/${id}`),
      ])
      .then(
        axios.spread(
          (
            pendingRes,
            findInfo,
            findOrdens,
            findPaste,
            searchUser,
            findOrg
          ) => {
            api
              .get(`/user/pending/${id}/${findInfo.data.cpf}`)
              .then((result) => {
                setFindOrder(result.data[0]);
                api.get(`/user/file/${pendingRes.data.file}`).then((result) => {
                  setCurrentFile(result.data);

                  setLoading(false);
                });
              });
            setFindPending(pendingRes.data);
            setFindUser(findInfo.data);

            setCurrentOrder(findOrdens.data);
            setCurrentPaste(findPaste.data);
            setCurrentOrg(findOrg.data[0]);

            async function loadcertificate() {
              pki.init({
                ready: start,
                notInstalled: notInstalled,
              });

              function start() {
                pki.listCertificates().success((certificates) => {
                  var select = $("#certificateSelect");
                  function filterObj(obj) {
                    if (obj.pkiBrazil.cpf === searchUser.data.cpf) {
                      return obj;
                    }
                  }

                  var filtered = certificates.filter(filterObj);
                  $.each(filtered, function () {
                    select.append(
                      $("<option />")
                        .val(this.thumbprint)
                        .text(
                          this.subjectName +
                            " (emitido por " +
                            this.issuerName +
                            ")"
                        )
                    );
                  });
                });
              }

              function notInstalled() {
                alert(
                  "você está sendo redirecionado para a página de instalação do plugin"
                );
                pki.redirectToInstallPage();
              }
            }
            loadcertificate();
            setTimeout(() => {
              setLoading(false);
            }, 3000);
          }
        )
      );
  }, [id]);

  var pasteDoc;
  var orgDoc;

  async function startAprovador() {
    if (currentOrg === null || currentOrg === undefined) {
      orgDoc = null;
    } else {
      orgDoc = currentOrg.id;
    }
    if (currentPaste === null) {
      pasteDoc = null;
    } else {
      pasteDoc = currentPaste.id;
    }

    if (currentOrder[0].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${currentFile.key}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[0].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: currentFile.key,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api
                      .post(`/ordem/signed/${result.data.id}`, {
                        email: element.email,
                        nome: element.nome,
                        cpf: element.cpf,
                        conclude: element.conclude,
                        type: element.type,
                      })
                      .then((resultc) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                      })
                      .then((resultaaa) => {
                        if (currentOrder.length === 1) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[1].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[1].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                            api.post(``);
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[1].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[1].cpf}/ordem/${currentOrder[1].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
                });
            });
        });
    } else if (currentOrder[1].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[1].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                  });

                  if (currentOrder.length === 2) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[2].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[2].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[2].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[2].cpf}/ordem/${currentOrder[2].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[2].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[2].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                  });

                  if (currentOrder.length === 3) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[3].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[3].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[3].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[3].cpf}/ordem/${currentOrder[3].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[3].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[3].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[3].email,
                      nome: array[3].nome,
                      cpf: array[3].cpf,
                      conclude: true,
                      type: array[3].type,
                    });
                  });

                  if (currentOrder.length === 4) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[4].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[4].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[4].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[4].cpf}/ordem/${currentOrder[4].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[4].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[4].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[3].email,
                      nome: array[3].nome,
                      cpf: array[3].cpf,
                      conclude: true,
                      type: array[3].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[4].email,
                      nome: array[4].nome,
                      cpf: array[4].cpf,
                      conclude: true,
                      type: array[4].type,
                    });
                  });

                  if (currentOrder.length === 5) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[5].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[5].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[5].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[5].cpf}/ordem/${currentOrder[5].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[5].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[5].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[3].email,
                      nome: array[3].nome,
                      cpf: array[3].cpf,
                      conclude: true,
                      type: array[3].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[4].email,
                      nome: array[4].nome,
                      cpf: array[4].cpf,
                      conclude: true,
                      type: array[4].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[5].email,
                      nome: array[5].nome,
                      cpf: array[5].cpf,
                      conclude: true,
                      type: array[5].type,
                    });
                  });

                  if (currentOrder.length === 6) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[6].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[6].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[6].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[6].cpf}/ordem/${currentOrder[6].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[6].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[6].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[3].email,
                      nome: array[3].nome,
                      cpf: array[3].cpf,
                      conclude: true,
                      type: array[3].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[4].email,
                      nome: array[4].nome,
                      cpf: array[4].cpf,
                      conclude: true,
                      type: array[4].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[5].email,
                      nome: array[5].nome,
                      cpf: array[5].cpf,
                      conclude: true,
                      type: array[5].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[6].email,
                      nome: array[6].nome,
                      cpf: array[6].cpf,
                      conclude: true,
                      type: array[6].type,
                    });
                  });

                  if (currentOrder.length === 7) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  } else {
                    if (currentOrder[7].signature === "strange") {
                      api.post(`/eletronic/strange/${currentOrder[7].email}`, {
                        idPending,
                        idConclude: hash.encode(result.data.id),
                      });
                    } else {
                      api.post(`/eletronic/signature/${currentOrder[7].email}`);
                    }

                    api.put(
                      `/user/${currentOrder[7].cpf}/ordem/${currentOrder[7].id}`
                    );
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    } else if (currentOrder[7].cpf === findUser.cpf) {
      api
        .put(`/user/${findPending.id}/pending/${findPending.signedFile}`)
        .then((result) => {
          api
            .put(`/user/${currentOrder[7].id}/pending`, {
              conclude: true,
            })
            .then((result) => {
              api
                .post(`/user/signedDocument`, {
                  orgDoc,
                  pasteDoc,
                  file: findPending.file,
                  url: currentFile.key,
                  nome: findPending.nome,
                  action: findPending.action,
                  key: findPending.signedFile,
                  status: 0,
                  submetido: findPending.submetido,
                  descriptionDoc: findPending.description,
                  uniqueCod: findPending.uniqueCod,
                })
                .then((result) => {
                  currentOrder.forEach((element, i, array) => {
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[0].email,
                      nome: array[0].nome,
                      cpf: array[0].cpf,
                      conclude: true,
                      type: array[0].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[1].email,
                      nome: array[1].nome,
                      cpf: array[1].cpf,
                      conclude: true,
                      type: array[1].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[2].email,
                      nome: array[2].nome,
                      cpf: array[2].cpf,
                      conclude: true,
                      type: array[2].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[3].email,
                      nome: array[3].nome,
                      cpf: array[3].cpf,
                      conclude: true,
                      type: array[3].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[4].email,
                      nome: array[4].nome,
                      cpf: array[4].cpf,
                      conclude: true,
                      type: array[4].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[5].email,
                      nome: array[5].nome,
                      cpf: array[5].cpf,
                      conclude: true,
                      type: array[5].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[6].email,
                      nome: array[6].nome,
                      cpf: array[6].cpf,
                      conclude: true,
                      type: array[6].type,
                    });
                    api.post(`/ordem/signed/${result.data.id}`, {
                      email: array[7].email,
                      nome: array[7].nome,
                      cpf: array[7].cpf,
                      conclude: true,
                      type: array[7].type,
                    });
                  });

                  if (currentOrder.length === 8) {
                    api.put(`/user/signedStatus/${result.data.id}`);
                    api.delete(`/user/${id}/pending`);
                    history.push(
                      `/dashboard/document/signed/${hash.encode(
                        result.data.id
                      )}`
                    );
                  }
                });
            });
        });
    }
  }

  function startCades() {
    if (currentOrg === null || currentOrg === undefined) {
      orgDoc = null;
    } else {
      orgDoc = currentOrg.id;
    }
    if (currentPaste === null) {
      pasteDoc = null;
    } else {
      pasteDoc = currentPaste.id;
    }

    if (currentOrder[0].cpf === findUser.cpf) {
      api.get(`/signaturestartCades/${currentFile.id}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinishCades/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api
                    .put(`/user/${currentOrder[0].id}/pending`, {
                      conclude: true,
                    })
                    .then((result) => {
                      api
                        .post(`/user/signedDocument`, {
                          orgDoc,
                          pasteDoc,
                          file: findPending.file,
                          url: currentFile.key,
                          nome: findPending.nome,
                          action: findPending.action,
                          key: res.data.signedFile,
                          status: 0,
                          submetido: findPending.submetido,
                          descriptionDoc: findPending.description,
                          uniqueCod: findPending.uniqueCod,
                        })
                        .then((result) => {
                          currentOrder.forEach((element, i, array) => {
                            api
                              .post(`/ordem/signed/${result.data.id}`, {
                                email: element.email,
                                nome: element.nome,
                                cpf: element.cpf,
                                conclude: element.conclude,
                                type: element.type,
                              })
                              .then((resultc) => {
                                api.post(`/ordem/signed/${result.data.id}`, {
                                  email: array[0].email,
                                  nome: array[0].nome,
                                  cpf: array[0].cpf,
                                  conclude: true,
                                  type: array[0].type,
                                });
                              })
                              .then((resultaaa) => {
                                if (currentOrder.length === 1) {
                                  api.put(
                                    `/user/signedStatus/${result.data.id}`
                                  );
                                  api.delete(`/user/${id}/pending`);
                                  history.push(
                                    `/dashboard/document/signed/${hash.encode(
                                      result.data.id
                                    )}`
                                  );
                                } else {
                                  if (currentOrder[1].signature === "strange") {
                                    api.post(
                                      `/eletronic/strange/${currentOrder[1].email}`,

                                      {
                                        idConclude: hash.encode(result.data.id),
                                        idPending,
                                      }
                                    );
                                  } else {
                                    api.post(
                                      `/eletronic/signature/${currentOrder[1].email}`
                                    );
                                  }

                                  api.put(
                                    `/user/${currentOrder[1].cpf}/ordem/${currentOrder[1].id}`
                                  );
                                  history.push(
                                    `/dashboard/document/signed/${hash.encode(
                                      result.data.id
                                    )}`
                                  );
                                }
                              });
                          });
                        });
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[1].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[1].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                        });

                        if (currentOrder.length === 2) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[2].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[2].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[2].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[2].cpf}/ordem/${currentOrder[2].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[2].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[2].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[2].email,
                            nome: array[2].nome,
                            cpf: array[2].cpf,
                            conclude: true,
                            type: array[2].type,
                          });
                        });

                        if (currentOrder.length === 3) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[3].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[3].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[3].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[3].cpf}/ordem/${currentOrder[3].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[3].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[3].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[2].email,
                            nome: array[2].nome,
                            cpf: array[2].cpf,
                            conclude: true,
                            type: array[2].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[3].email,
                            nome: array[3].nome,
                            cpf: array[3].cpf,
                            conclude: true,
                            type: array[3].type,
                          });
                        });

                        if (currentOrder.length === 4) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[4].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[4].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[4].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[4].cpf}/ordem/${currentOrder[4].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[4].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[4].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[2].email,
                            nome: array[2].nome,
                            cpf: array[2].cpf,
                            conclude: true,
                            type: array[2].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[3].email,
                            nome: array[3].nome,
                            cpf: array[3].cpf,
                            conclude: true,
                            type: array[3].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[4].email,
                            nome: array[4].nome,
                            cpf: array[4].cpf,
                            conclude: true,
                            type: array[4].type,
                          });
                        });

                        if (currentOrder.length === 5) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[5].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[5].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[5].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[5].cpf}/ordem/${currentOrder[5].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[5].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[5].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[2].email,
                            nome: array[2].nome,
                            cpf: array[2].cpf,
                            conclude: true,
                            type: array[2].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[3].email,
                            nome: array[3].nome,
                            cpf: array[3].cpf,
                            conclude: true,
                            type: array[3].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[4].email,
                            nome: array[4].nome,
                            cpf: array[4].cpf,
                            conclude: true,
                            type: array[4].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[5].email,
                            nome: array[5].nome,
                            cpf: array[5].cpf,
                            conclude: true,
                            type: array[5].type,
                          });
                        });

                        if (currentOrder.length === 6) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[6].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[6].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[6].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[6].cpf}/ordem/${currentOrder[6].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[6].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api.put(`/user/${currentOrder[6].id}/pending`, {
                      conclude: true,
                    });
                    api
                      .post(`/user/signedDocument`, {
                        orgDoc,
                        pasteDoc,
                        file: findPending.file,
                        url: currentFile.key,
                        nome: findPending.nome,
                        action: findPending.action,
                        key: res.data.signedFile,
                        status: 0,
                        submetido: findPending.submetido,
                        descriptionDoc: findPending.description,
                        uniqueCod: findPending.uniqueCod,
                      })
                      .then((result) => {
                        currentOrder.forEach((element, i, array) => {
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[0].email,
                            nome: array[0].nome,
                            cpf: array[0].cpf,
                            conclude: true,
                            type: array[0].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[1].email,
                            nome: array[1].nome,
                            cpf: array[1].cpf,
                            conclude: true,
                            type: array[1].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[2].email,
                            nome: array[2].nome,
                            cpf: array[2].cpf,
                            conclude: true,
                            type: array[2].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[3].email,
                            nome: array[3].nome,
                            cpf: array[3].cpf,
                            conclude: true,
                            type: array[3].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[4].email,
                            nome: array[4].nome,
                            cpf: array[4].cpf,
                            conclude: true,
                            type: array[4].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[5].email,
                            nome: array[5].nome,
                            cpf: array[5].cpf,
                            conclude: true,
                            type: array[5].type,
                          });
                          api.post(`/ordem/signed/${result.data.id}`, {
                            email: array[6].email,
                            nome: array[6].nome,
                            cpf: array[6].cpf,
                            conclude: true,
                            type: array[6].type,
                          });
                        });

                        if (currentOrder.length === 7) {
                          api.put(`/user/signedStatus/${result.data.id}`);
                          api.delete(`/user/${id}/pending`);
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        } else {
                          if (currentOrder[7].signature === "strange") {
                            api.post(
                              `/eletronic/strange/${currentOrder[7].email}`,
                              {
                                idConclude: hash.encode(result.data.id),
                                idPending,
                              }
                            );
                          } else {
                            api.post(
                              `/eletronic/signature/${currentOrder[7].email}`
                            );
                          }

                          api.put(
                            `/user/${currentOrder[7].cpf}/ordem/${currentOrder[7].id}`
                          );
                          history.push(
                            `/dashboard/document/signed/${hash.encode(
                              result.data.id
                            )}`
                          );
                        }
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    } else if (currentOrder[7].cpf === findUser.cpf) {
      api
        .get(`/signaturestart-coCades/${findPending.signedFile}`)
        .then((result) => {
          pki
            .signWithRestPki({
              token: result.data.token,
              thumbprint: $("#certificateSelect").val(),
            })
            .success((resultado) => {
              api.post(`/signaturefinishCades/${resultado}`).then((res) => {
                setLoading(true);

                api
                  .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                  .then((result) => {
                    api
                      .put(`/user/${currentOrder[7].id}/pending`, {
                        conclude: true,
                      })
                      .then((result) => {
                        api
                          .post(`/user/signedDocument`, {
                            orgDoc,
                            pasteDoc,
                            file: findPending.file,
                            url: currentFile.key,
                            nome: findPending.nome,
                            action: findPending.action,
                            key: res.data.signedFile,
                            status: 0,
                            submetido: findPending.submetido,
                            descriptionDoc: findPending.description,
                            uniqueCod: findPending.uniqueCod,
                          })
                          .then((result) => {
                            currentOrder.forEach((element, i, array) => {
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[0].email,
                                nome: array[0].nome,
                                cpf: array[0].cpf,
                                conclude: true,
                                type: array[0].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[1].email,
                                nome: array[1].nome,
                                cpf: array[1].cpf,
                                conclude: true,
                                type: array[1].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[2].email,
                                nome: array[2].nome,
                                cpf: array[2].cpf,
                                conclude: true,
                                type: array[2].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[3].email,
                                nome: array[3].nome,
                                cpf: array[3].cpf,
                                conclude: true,
                                type: array[3].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[4].email,
                                nome: array[4].nome,
                                cpf: array[4].cpf,
                                conclude: true,
                                type: array[4].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[5].email,
                                nome: array[5].nome,
                                cpf: array[5].cpf,
                                conclude: true,
                                type: array[5].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[6].email,
                                nome: array[6].nome,
                                cpf: array[6].cpf,
                                conclude: true,
                                type: array[6].type,
                              });
                              api.post(`/ordem/signed/${result.data.id}`, {
                                email: array[7].email,
                                nome: array[7].nome,
                                cpf: array[7].cpf,
                                conclude: true,
                                type: array[7].type,
                              });
                            });

                            if (currentOrder.length === 8) {
                              api.put(`/user/signedStatus/${result.data.id}`);
                              api.delete(`/user/${id}/pending`);
                              history.push(
                                `/dashboard/document/signed/${hash.encode(
                                  result.data.id
                                )}`
                              );
                            }
                          });
                      });
                  });
              });
            })
            .fail((fail) => {
              console.log(fail);
            });
        });
    }
  }

  async function startPades() {
    if (currentOrg === null || currentOrg === undefined) {
      orgDoc = null;
    } else {
      orgDoc = currentOrg.id;
    }
    if (currentPaste === null) {
      pasteDoc = null;
    } else {
      pasteDoc = currentPaste.id;
    }

    if (currentOrder[0].cpf === findUser.cpf) {
      api.get(`/signaturestart/${currentFile.id}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((resultb) => {
                  api
                    .put(`/user/${currentOrder[0].id}/pending`, {
                      conclude: true,
                    })
                    .then((resulta) => {
                      api
                        .post(`/user/signedDocument`, {
                          orgDoc,
                          pasteDoc,
                          file: findPending.file,
                          url: currentFile.key,
                          nome: findPending.nome,
                          action: findPending.action,
                          key: res.data.signedFile,
                          status: 0,
                          submetido: findPending.submetido,
                          descriptionDoc: findPending.description,
                          uniqueCod: findPending.uniqueCod,
                        })
                        .then((result) => {
                          currentOrder.forEach((element, i, array) => {
                            api
                              .post(`/ordem/signed/${result.data.id}`, {
                                email: element.email,
                                nome: element.nome,
                                cpf: element.cpf,
                                conclude: element.conclude,
                                type: element.type,
                              })
                              .then((resultc) => {
                                api.post(`/ordem/signed/${result.data.id}`, {
                                  email: array[0].email,
                                  nome: array[0].nome,
                                  cpf: array[0].cpf,
                                  conclude: true,
                                  type: array[0].type,
                                });
                              })
                              .then((resultaaa) => {
                                if (currentOrder.length === 1) {
                                  api.put(
                                    `/user/signedStatus/${result.data.id}`
                                  );
                                  api.delete(`/user/${id}/pending`);
                                  history.push(
                                    `/dashboard/document/signed/${hash.encode(
                                      result.data.id
                                    )}`,
                                    window.location.reload(true)
                                  );
                                } else {
                                  if (currentOrder[1].signature === "strange") {
                                    api.post(
                                      `/eletronic/strange/${currentOrder[1].email}`,

                                      {
                                        idConclude: hash.encode(result.data.id),
                                        idPending,
                                      }
                                    );
                                  } else {
                                    api.post(
                                      `/eletronic/signature/${currentOrder[1].email}`
                                    );
                                  }

                                  api.put(
                                    `/user/${currentOrder[1].cpf}/ordem/${currentOrder[1].id}`
                                  );
                                  history.push(
                                    `/dashboard/document/signed/${hash.encode(
                                      result.data.id
                                    )}`
                                  );
                                }
                              });
                          });
                        });
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[1].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[1].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                      });
                      if (currentOrder.length === 2) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[2].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[2].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[2].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[2].cpf}/ordem/${currentOrder[2].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[2].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[2].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[2].email,
                          nome: array[2].nome,
                          cpf: array[2].cpf,
                          conclude: true,
                          type: array[2].type,
                        });
                      });
                      if (currentOrder.length === 3) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[3].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[3].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[3].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[3].cpf}/ordem/${currentOrder[3].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[3].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[3].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[2].email,
                          nome: array[2].nome,
                          cpf: array[2].cpf,
                          conclude: true,
                          type: array[2].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[3].email,
                          nome: array[3].nome,
                          cpf: array[3].cpf,
                          conclude: true,
                          type: array[3].type,
                        });
                      });
                      if (currentOrder.length === 4) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[4].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[4].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[4].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[4].cpf}/ordem/${currentOrder[4].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[4].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[4].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[2].email,
                          nome: array[2].nome,
                          cpf: array[2].cpf,
                          conclude: true,
                          type: array[2].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[3].email,
                          nome: array[3].nome,
                          cpf: array[3].cpf,
                          conclude: true,
                          type: array[3].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[4].email,
                          nome: array[4].nome,
                          cpf: array[4].cpf,
                          conclude: true,
                          type: array[4].type,
                        });
                      });
                      if (currentOrder.length === 5) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[5].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[5].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[5].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[5].cpf}/ordem/${currentOrder[5].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[5].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[5].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[2].email,
                          nome: array[2].nome,
                          cpf: array[2].cpf,
                          conclude: true,
                          type: array[2].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[3].email,
                          nome: array[3].nome,
                          cpf: array[3].cpf,
                          conclude: true,
                          type: array[3].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[4].email,
                          nome: array[4].nome,
                          cpf: array[4].cpf,
                          conclude: true,
                          type: array[4].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[5].email,
                          nome: array[5].nome,
                          cpf: array[5].cpf,
                          conclude: true,
                          type: array[5].type,
                        });
                      });
                      if (currentOrder.length === 6) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[6].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[6].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[6].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[6].cpf}/ordem/${currentOrder[6].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[6].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api.put(`/user/${currentOrder[6].id}/pending`, {
                    conclude: true,
                  });
                  api
                    .post(`/user/signedDocument`, {
                      orgDoc,
                      pasteDoc,
                      file: findPending.file,
                      url: currentFile.key,
                      nome: findPending.nome,
                      action: findPending.action,
                      key: res.data.signedFile,
                      status: 0,
                      submetido: findPending.submetido,
                      descriptionDoc: findPending.description,
                      uniqueCod: findPending.uniqueCod,
                    })
                    .then((result) => {
                      currentOrder.forEach((element, i, array) => {
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[0].email,
                          nome: array[0].nome,
                          cpf: array[0].cpf,
                          conclude: true,
                          type: array[0].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[1].email,
                          nome: array[1].nome,
                          cpf: array[1].cpf,
                          conclude: true,
                          type: array[1].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[2].email,
                          nome: array[2].nome,
                          cpf: array[2].cpf,
                          conclude: true,
                          type: array[2].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[3].email,
                          nome: array[3].nome,
                          cpf: array[3].cpf,
                          conclude: true,
                          type: array[3].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[4].email,
                          nome: array[4].nome,
                          cpf: array[4].cpf,
                          conclude: true,
                          type: array[4].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[5].email,
                          nome: array[5].nome,
                          cpf: array[5].cpf,
                          conclude: true,
                          type: array[5].type,
                        });
                        api.post(`/ordem/signed/${result.data.id}`, {
                          email: array[6].email,
                          nome: array[6].nome,
                          cpf: array[6].cpf,
                          conclude: true,
                          type: array[6].type,
                        });
                      });
                      if (currentOrder.length === 7) {
                        api.put(`/user/signedStatus/${result.data.id}`);
                        api.delete(`/user/${id}/pending`);
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      } else {
                        if (currentOrder[7].signature === "strange") {
                          api.post(
                            `/eletronic/strange/${currentOrder[7].email}`,
                            {
                              idConclude: hash.encode(result.data.id),
                              idPending,
                            }
                          );
                        } else {
                          api.post(
                            `/eletronic/signature/${currentOrder[7].email}`
                          );
                        }

                        api.put(
                          `/user/${currentOrder[7].cpf}/ordem/${currentOrder[7].id}`
                        );
                        history.push(
                          `/dashboard/document/signed/${hash.encode(
                            result.data.id
                          )}`
                        );
                      }
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    } else if (currentOrder[7].cpf === findUser.cpf) {
      api.get(`/signaturestart-co/${findPending.signedFile}`).then((result) => {
        pki
          .signWithRestPki({
            token: result.data.token,
            thumbprint: $("#certificateSelect").val(),
          })
          .success((resultado) => {
            api.post(`/signaturefinish/${resultado}`).then((res) => {
              setLoading(true);

              api
                .put(`/user/${findPending.id}/pending/${res.data.signedFile}`)
                .then((result) => {
                  api
                    .put(`/user/${currentOrder[2].id}/pending`, {
                      conclude: true,
                    })
                    .then((result) => {
                      api
                        .post(`/user/signedDocument`, {
                          orgDoc,
                          pasteDoc,
                          file: findPending.file,
                          url: currentFile.key,
                          nome: findPending.nome,
                          action: findPending.action,
                          key: res.data.signedFile,
                          status: 0,
                          submetido: findPending.submetido,
                          descriptionDoc: findPending.description,
                          uniqueCod: findPending.uniqueCod,
                        })
                        .then((result) => {
                          currentOrder.forEach((element, i, array) => {
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[0].email,
                              nome: array[0].nome,
                              cpf: array[0].cpf,
                              conclude: true,
                              type: array[0].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[1].email,
                              nome: array[1].nome,
                              cpf: array[1].cpf,
                              conclude: true,
                              type: array[1].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[2].email,
                              nome: array[2].nome,
                              cpf: array[2].cpf,
                              conclude: true,
                              type: array[2].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[3].email,
                              nome: array[3].nome,
                              cpf: array[3].cpf,
                              conclude: true,
                              type: array[3].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[4].email,
                              nome: array[4].nome,
                              cpf: array[4].cpf,
                              conclude: true,
                              type: array[4].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[5].email,
                              nome: array[5].nome,
                              cpf: array[5].cpf,
                              conclude: true,
                              type: array[5].type,
                            });
                            api.post(`/ordem/signed/${result.data.id}`, {
                              email: array[6].email,
                              nome: array[6].nome,
                              cpf: array[6].cpf,
                              conclude: true,
                              type: array[6].type,
                            });
                          });

                          if (currentOrder.length === 8) {
                            api.put(`/user/signedStatus/${result.data.id}`);
                            api.delete(`/user/${id}/pending`);
                            history.push(
                              `/dashboard/document/signed/${hash.encode(
                                result.data.id
                              )}`
                            );
                          }
                        });
                    });
                });
            });
          })
          .fail((fail) => {
            console.log(fail);
          });
      });
    }
  }

  $("#certificate").change(function () {
    if ($(this).is(":checked")) {
      $(".eletronic-body").addClass("hidden");
      $(".certificate-body").removeClass("hidden");
      $(".container-eletronic2").addClass("hidden");
      $(".container-eletronic").removeClass("hidden");
    }
  });
  $("#eletronic").change(function () {
    if ($(this).is(":checked")) {
      $(".eletronic-body").removeClass("hidden");
      $(".certificate-body").addClass("hidden");
      $(".eletronic-body").removeClass("hidden");
    }
  });

  function submitSMS() {
    $(".certificate").addClass("hidden");
    setLoading2(true);

    $(".container-eletronic").addClass("hidden");
    api.get(`/eletronic/${findUser.email}`).then((result) => {
      $(".alertSMS").removeClass("hidden");
      setTimeout(() => {
        $(".alertSMS").addClass("hidden");
      }, 3000);
      setCod(result.data.tokenSMS);
      setLoading2(false);
      $(".container-eletronic").addClass("hidden");
      $(".container-eletronic2").removeClass("hidden");
    });
  }
  async function eletronicSignature() {}
  async function confirmSMS() {
    var smsCod = document.getElementById("sms").value;
    api.post(`/eletronic/${smsCod}/${findUser.email}`).then((result) => {
      if (result.data.checked === true || result.data === "incorrect token") {
        $(".alertSMS2").removeClass("hidden");
        setTimeout(() => {
          $(".alertSMS2").addClass("hidden");
        }, 3000);
      } else {
        $(".container-eletronic3").removeClass("hidden");
        $(".container-eletronic2").addClass("hidden");
      }
    });
  }

  return block === true ? (
    <div>
      <BlockUi tag="div" blocking={block}>
        <p>assinando os documentos</p>
      </BlockUi>
    </div>
  ) : loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div className="main-container">
      <div>
        {findUser.number === null ? (
          <AlertTelefone nome={findUser.nome.split("")[0].toLowerCase()} />
        ) : (
          <div />
        )}
      </div>
      <div className="row ">
        <div className=" card container-pdf col-lg-5">
          {findPending.action === 1 ? (
            <div>
              <h5>disponível a apenas visualização do documento original</h5>
              <a href={currentFile.url} target="_blank">
                <img src={Filegeneric} alt="" />
                <span>documento original</span>
              </a>
            </div>
          ) : (
            <div>
              {findOrder.type === "signatario" ? (
                <div>
                  <p>documento a ser assinado:</p>
                </div>
              ) : (
                <div></div>
              )}
              {findOrder.type === "aprovador" ? (
                <div>
                  <p>aprovar documento:</p>
                </div>
              ) : (
                <div></div>
              )}
              {findPending.signedFile !== null ? (
                <div>
                  {" "}
                  <Iframe
                    src={`${process.env.REACT_APP_BACKEND_URL}/files/${findPending.signedFile}`}
                    className="iframe-container"
                  />
                </div>
              ) : (
                <div>
                  <Iframe
                    src={`${process.env.REACT_APP_BACKEND_URL}/files/${currentFile.key}`}
                    className="iframe-container"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className=" card container-signature col-lg-5">
          {" "}
          <div className="document-container-information-list">
            <small>nome</small>
            <li>{findPending.nome}</li>
            <small>submetido por:</small>
            <li> {findPending.submetido}</li>
            <small>descrição:</small>
            <li> {findPending.description}</li>
            <small>criado em:</small>
            <li>{moment(findPending.createdAt).format("DD-MM-YY HH:mm:ss")}</li>
          </div>
          {findOrder.signatureType === true ? (
            <div>
              <div className="inputsType">
                <div className="certificate">
                  <li>
                    <input
                      type="radio"
                      name="type"
                      id="certificate"
                      value={"certificate"}
                    />{" "}
                    <label htmlFor="certificate" className="list-nome-types">
                      <i className="fas fa-address-card" />
                      assinatura com certificado
                    </label>{" "}
                  </li>
                </div>

                <div>
                  {" "}
                  <div className="certificate-body hidden">
                    {findOrder.type === "signatario" ? (
                      <div>
                        {findOrder.conclude === true ? (
                          <div></div>
                        ) : (
                          <div>
                            {" "}
                            <div className="container-certificados">
                              <p>Certificados disponíveis:</p>
                            </div>
                            <select
                              className="custom-select "
                              id="certificateSelect"
                            />
                            {findPending.action === 0 ? (
                              <div>
                                {" "}
                                <button
                                  onClick={() => startPades()}
                                  className="btn btn-cyan mt-1"
                                >
                                  assinar{" "}
                                </button>
                              </div>
                            ) : (
                              <div>
                                <button
                                  onClick={() => startCades()}
                                  className="btn btn-cyan mt-1"
                                >
                                  assinar{" "}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
                <li>
                  <input
                    type="radio"
                    name="type"
                    id="eletronic"
                    value={"eletronic"}
                  />{" "}
                  <label htmlFor="eletronic" className="list-nome-types">
                    <i className="fas fa-signature" />
                    assinatura eletrônica
                  </label>{" "}
                </li>
                <div class="alert alert-success alertSMS hidden" role="alert">
                  token enviado com sucesso
                </div>
                <div class="alert alert-danger alertSMS2 hidden" role="alert">
                  token incorreto
                </div>
                <div className="eletronic-body hidden">
                  {loading2 ? (
                    <div>
                      {" "}
                      <div className="container-loading">
                        <Loading color="#3D92C2" height={80} width={80} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="container-eletronic">
                        <img src={Phone} alt="" />
                        <p>
                          Para continuar, clique no botão para solicitar o
                          código de verificação por SMS.
                        </p>
                        <button
                          className="btn btn-cyan mt-1"
                          onClick={() => submitSMS()}
                        >
                          {" "}
                          ENVIAR
                        </button>
                      </div>
                      <div className="container-eletronic2 hidden">
                        <img src={Phone} alt="" />
                        <p>
                          Informe o código enviado para o telefone com final{" "}
                          <small className="token-sms">{cod.slice(-3)}</small>{" "}
                          abaixo:
                        </p>
                        <div className="container-description form__group field">
                          <input
                            type="input"
                            className="form__field"
                            placeholder="Código"
                            id="sms"
                          />
                          <label htmlFor="sms" className="form__label">
                            Código
                          </label>
                        </div>
                        <button
                          className="btn btn-cyan mt-1"
                          onClick={() => confirmSMS()}
                        >
                          {" "}
                          ENVIAR
                        </button>
                      </div>
                      <div className="container-eletronic3 hidden">
                        <p>
                          Informações da assinatura eletrônica{" "}
                          <i className="fas fa-signature" />
                        </p>

                        <div className="card-info-eletronic ">
                          <img src={Person} alt="" />
                          <div className="row">
                            {" "}
                            <small>{findUser.nome}</small>
                          </div>
                          <div className="row">
                            <small>{findUser.email}</small>
                          </div>
                          <div className="row">
                            {" "}
                            <small>{cpfMask(findUser.cpf)}</small>
                          </div>
                          <div className="row">
                            {" "}
                            <small>{phoneMask(findUser.number)}</small>
                          </div>
                        </div>

                        <button
                          className="btn btn-cyan mt-1"
                          onClick={() => eletronicSignature()}
                        >
                          {" "}
                          ASSINAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {" "}
              <div className="certificate-body">
                {findOrder.type === "signatario" ? (
                  <div>
                    {findOrder.conclude === true ? (
                      <div></div>
                    ) : (
                      <div>
                        {" "}
                        <div className="container-certificados">
                          <p>Certificados disponíveis:</p>
                        </div>
                        <select
                          className="custom-select "
                          id="certificateSelect"
                        />
                        {findPending.action === 0 ? (
                          <div>
                            {" "}
                            <button
                              onClick={() => startPades()}
                              className="btn btn-cyan mt-1"
                            >
                              assinar{" "}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => startCades()}
                              className="btn btn-cyan mt-1"
                            >
                              assinar{" "}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          )}
          {findOrder.type === "aprovador" ? (
            <div>
              <button
                onClick={() => startAprovador()}
                className="btn btn-cyan mt-1"
              >
                aprovar{" "}
              </button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignDocument;
