import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import api from "../services/api";
import moment from "moment";
import logo from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
import world from "../images/logo_world.png";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { jsPDF } from "jspdf";
import { cpfMask, phoneMask } from "../util/Mask";
import LacunaWebPki from "web-pki";
import Iframe from "react-iframe";
import Image001 from "../images/PdfStamp.png";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import Person from "../images/user.png";
import Signature from "../images/signature.png";
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

  const [avatar, setAvatar] = useState(null);
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
              .then((resultOrder) => {
                api.get(`/user/file/${pendingRes.data.file}`).then((result) => {
                  api
                    .get(`/uploadavatar/${findInfo.data.id}`)
                    .then((resultAvatar) => {
                      setFindOrder(resultOrder.data[0]);
                      setAvatar(resultAvatar.data);
                      setCurrentFile(result.data);
                      setFindPending(pendingRes.data);
                      setFindUser(findInfo.data);

                      setCurrentOrder(findOrdens.data);
                      setCurrentPaste(findPaste.data);
                      setCurrentOrg(findOrg.data[0]);
                      setLoading(false);
                    });
                });
              });

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
  const signCanvas = useRef([]);
  const canvasRef = useRef(null);
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
  async function eletronicSignature() {
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
    setLoading(true);
    if (currentOrder[0].cpf === findUser.cpf) {
      const doc = new jsPDF();
      doc.addImage(world, "png", 10, 10, 35, 35);
      doc.addImage(logo, "png", 60, 20, 80, 25);
      doc.setFontSize(10);
      doc.addImage(
        `${process.env.REACT_APP_BACKEND_URL}/files/${avatar.key}`,
        "txt",
        10,
        78,
        60,
        38
      );

      doc.text(10, 60, `documento submetido por ${findPending.submetido}.`);

      doc.text(
        10,
        150,
        `documento assinado por ${currentOrder[0].nome} cpf:${currentOrder[0].cpf}`
      );
      var string = doc.output("datauristring");
      srcToFile(string, `${findUser.nome}.pdf`, "application/pdf").then(
        (file) => {
          const fd = new FormData();
          fd.append("userfile", file);
          return api
            .post(`/uploadEletronic/${currentFile.key}`, fd, {
              nome: "signature",
              size: file.size,
            })
            .then((resultEletronic) => {
              api
                .put(`/user/${findPending.id}/pending/${resultEletronic.data}`)
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
                          key: resultEletronic.data,
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
        }
      );
      function srcToFile(src, fileName, mimeType) {
        return fetch(src)
          .then((res) => res.arrayBuffer())
          .then((buf) => new File([buf], fileName, { type: mimeType }));
      }
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
      ctx.drawImage(image, 130, 70, 100, 80);
      ctx.fillStyle = "black";
      ctx.font = "10pt Arial";
      ctx.fillText("Documento assinado eletronicamente por:", 2, 30);
      ctx.fillText(`nome:${findUser.nome}`, 1, 60);
      ctx.fillText(`email:${findUser.email}`, 1, 90);
      ctx.fillText(`cpf:${cpfMask(findUser.cpf)}`, 1, 120);
      const carimbo = canvas.toDataURL("image/png");
      srcToFile(carimbo, `${findUser.nome}.txt`, "image/png").then((file) => {
        const fd = new FormData();
        fd.append("userfile", file);
        return api.post(`/uploadavatar/${findUser.id}`, fd, {
          nome: "signature",
          size: file.size,
        });
      });
    };

    function srcToFile(src, fileName, mimeType) {
      return fetch(src)
        .then((res) => res.arrayBuffer())
        .then((buf) => new File([buf], fileName, { type: mimeType }));
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

  return loading === true ? (
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
                        {avatar === null ? (
                          <div>
                            <img
                              className="container-eletronicimg"
                              src={Phone}
                              alt=""
                            />
                          </div>
                        ) : (
                          <div>
                            <p>carimbo da assinatura</p>
                            <img
                              className="img-signature"
                              src={`${process.env.REACT_APP_BACKEND_URL}/files/${avatar.key}`}
                              alt=""
                            />
                          </div>
                        )}
                        <p>
                          Para continuar, clique no botão para solicitar o
                          código de verificação por SMS.
                        </p>
                        {avatar === null ? (
                          <div>
                            <div className="alert alert-danger" role="alert">
                              {" "}
                              A sua rubrica está pendente, adicione! será
                              necessária para a assinatura eletrônica{" "}
                              <p
                                className="modal-signature"
                                data-toggle="modal"
                                data-target="#exampleModal3"
                              >
                                &nbsp; clique aqui!
                              </p>
                            </div>
                            <div
                              class="modal fade"
                              id="exampleModal3"
                              tabindex="-1"
                              aria-labelledby="exampleModalLabel2"
                              aria-hidden="true"
                            >
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <p
                                      class="modal-title"
                                      id="exampleModalLabel2"
                                    >
                                      insira sua rubrica{" "}
                                      <img src={Signature} alt="" />
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
                                      insira sua rubrica no campo abaixo ,ela
                                      será usada no carimbo da assinatura
                                      eletrônica
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
                                      <img
                                        className="canvas-img"
                                        src={Image001}
                                        alt=""
                                      />
                                    </canvas>
                                  </div>

                                  <button
                                    onClick={save}
                                    type="button"
                                    class="btn btn-primary"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={clear}
                                    type="button"
                                    class="btn btn-primary"
                                  >
                                    Limpar
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
                          </div>
                        ) : (
                          <button
                            className="btn btn-cyan mt-1"
                            onClick={() => submitSMS()}
                          >
                            {" "}
                            ENVIAR
                          </button>
                        )}
                      </div>
                      <div className="container-eletronic2 hidden">
                        <img src={Phone} alt="" />
                        <p>
                          Informe o código o com final{" "}
                          <small className="token-sms">{cod.slice(-3)}</small>{" "}
                          enviado para o telefone{" "}
                          <small className="token-sms">
                            {phoneMask(findUser.number)}
                          </small>{" "}
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
                      <div className="container-eletronic3 hidden ">
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
