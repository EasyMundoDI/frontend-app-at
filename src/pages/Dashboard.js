import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Hashids from "hashids";
import BlockUi from "react-block-ui";
import moment from "moment";
import LacunaWebPki from "web-pki";
import api from "../services/api";
import Logo from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
import Image001 from "../images/image001.png";
import AlertTelefone from "../components/AlertTelefone";
import Loading from "../components/Loading";
import "react-block-ui/style.css";
import "../styles/styles.css";
import $ from "jquery";

const hash = new Hashids("", 35);
const pki = new LacunaWebPki();

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState(false);
  const [infoUser, setInfoUser] = useState();
  const history = useHistory();
  const signCanvas = useRef([]);
  const canvasRef = useRef(null);
  const [pending, setPending] = useState([]);
  const [signed, setSigned] = useState([]);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    axios.all([api.get("/auth/userinfo")]).then(
      axios.spread((Infouser) => {
        api
          .get(`/user/${Infouser.data.nome}/signedall`)
          .then((resultSigned) => {
            setSigned(resultSigned.data);
            api
              .get(`/user/pendingall/${Infouser.data.email}`)
              .then((result) => {
                setPending(result.data);
                setInfoUser(Infouser.data);
                setTimeout(() => {
                  setLoading(false);
                }, 3000);
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
                if (obj.pkiBrazil.cpf === Infouser.data.cpf) {
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
      })
    );
  }, []);

  const Logout = () => {
    localStorage.clear();
    history.push("/");
  };

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
      ctx.drawImage(image, 300, 150, 150, 150);
      ctx.fillStyle = "black";
      ctx.fillText(infoUser.nome, 9, 150);
      ctx.fillText(infoUser.email, 9, 200);
      ctx.fillText(infoUser.cpf, 9, 250);
      const carimbo = canvas.toDataURL("image/png");
      srcToFile(carimbo, "hello.txt", "image/png").then((file) => {
        const fd = new FormData();
        fd.append("userfile", file);
        return api
          .post(`/uploadavatar/${infoUser}`, fd, {
            nome: "signature",
            size: file.size,
          })
          .then((result) => {
            console.log(result);
          });
      });
    };
    ctx.font = "15px Arial";

    function srcToFile(src, fileName, mimeType) {
      return fetch(src)
        .then((res) => res.arrayBuffer())
        .then((buf) => new File([buf], fileName, { type: mimeType }));
    }
  }

  let pasteDoc;
  let orgDoc;

  function assinaturaLote() {
    const checados = [];
    const a = document.querySelectorAll("input:checked");
    var count = 0;
    a.forEach((element) => {
      checados.push(element.value);
    });
    checados.forEach((element) => {
      if (count === a.length) {
        window.location.reload(false);
      }
      axios
        .all([
          api.get(`/pending/${element}`),
          api.get(`/user/order/${element}`),
          api.get(`/user/paste/${element}`),
          api.get(`/organization/pendingPaste/${element}`),
        ])
        .then(
          axios.spread((pending, order, paste, org) => {
            const arrayOrder = new Array(order.data);

            const newArray = arrayOrder[0];

            if (
              org.data === null ||
              org.data === undefined ||
              org.data.length < 1
            ) {
              orgDoc = null;
            } else {
              orgDoc = org.data[0].id;
            }

            if (paste.data === null) {
              pasteDoc = null;
            } else {
              pasteDoc = paste.data.id;
            }

            if (checados.length === 1 && pending.data.action === 0) {
              api.get(`/user/file/${pending.data.file}`).then((currentFile) => {
                if (order.data[0].cpf === infoUser.cpf) {
                  api
                    .get(`/signaturestart/${currentFile.data.id}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((resultPut) => {
                                  api
                                    .put(`/user/${order.data[0].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((resultPut2) => {
                                      api
                                        .post("/user/signedDocument/", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api
                                                .post(
                                                  `/ordem/signed/${result.data.id}`,
                                                  {
                                                    email: element.email,
                                                    nome: element.nome,
                                                    cpf: element.cpf,
                                                    conclude: element.conclude,
                                                    type: element.type,
                                                  }
                                                )
                                                .then((resultc) => {
                                                  api.put(
                                                    `/ordem/signed/${result.data.id}`,
                                                    {
                                                      email: array[0].email,
                                                      nome: array[0].nome,
                                                      cpf: array[0].cpf,
                                                      conclude: true,
                                                      type: array[0].type,
                                                    }
                                                  );
                                                })
                                                .then((resultaaa) => {
                                                  if (order.data.length === 1) {
                                                    api.put(
                                                      `/user/signedStatus/${result.data.id}`
                                                    );
                                                    api.delete(
                                                      `/user/${hash.encode(
                                                        pending.data.id
                                                      )}/pending`
                                                    );
                                                  } else {
                                                    if (
                                                      order.data[1]
                                                        .signature === "pending"
                                                    ) {
                                                      api.post(
                                                        `/eletronic/strange/${order.data[1].email}`,
                                                        {
                                                          idPending: hash.encode(
                                                            pending.data.id
                                                          ),
                                                        }
                                                      );
                                                    } else {
                                                      api.post(
                                                        `/eletronic/signature/${order.data[1].email}`
                                                      );
                                                    }

                                                    api.put(
                                                      `/user/${order.data[1].id}/ordem`
                                                    );
                                                  }
                                                });
                                            }
                                          );
                                        });
                                    });
                                });
                            });
                        })
                        .fail((fail) => {
                          console.log(fail);
                        });
                    });
                } else if (
                  order.data[1].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[1].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 2) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[2].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[2].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[2].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[2].id}/ordem`
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
                } else if (
                  order.data[2].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[2].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 3) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[3].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[3].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[3].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[3].id}/ordem`
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
                } else if (
                  order.data[3].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[3].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 4) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[4].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[4].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[4].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[4].id}/ordem`
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
                } else if (
                  order.data[4].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[4].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 5) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[5].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[5].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[5].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[5].id}/ordem`
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
                } else if (
                  order.data[5].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[5].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 6) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[6].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[6].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[6].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[6].id}/ordem`
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
                } else if (
                  order.data[6].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[6].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[6].email,
                                                  nome: array[6].nome,
                                                  cpf: array[6].cpf,
                                                  conclude: true,
                                                  type: array[6].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 7) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[7].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[7].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[7].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[7].id}/ordem`
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
                } else if (
                  order.data[7].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[7].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[6].email,
                                                  nome: array[6].nome,
                                                  cpf: array[6].cpf,
                                                  conclude: true,
                                                  type: array[6].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[7].email,
                                                  nome: array[7].nome,
                                                  cpf: array[7].cpf,
                                                  conclude: true,
                                                  type: array[7].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 8) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
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
              });
            }
            if (checados.length >= 2 && pending.data.action === 0) {
              api.get(`/user/file/${pending.data.file}`).then((currentFile) => {
                if (order.data[0].cpf === infoUser.cpf) {
                  api
                    .get(`/signaturestart/${currentFile.data.id}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((resultPut) => {
                                  api
                                    .put(`/user/${order.data[0].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((resultPut2) => {
                                      api
                                        .post("/user/signedDocument/", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api
                                                .post(
                                                  `/ordem/signed/${result.data.id}`,
                                                  {
                                                    email: element.email,
                                                    nome: element.nome,
                                                    cpf: element.cpf,
                                                    conclude: element.conclude,
                                                    type: element.type,
                                                  }
                                                )
                                                .then((resultc) => {
                                                  api.put(
                                                    `/ordem/signed/${result.data.id}`,
                                                    {
                                                      email: array[0].email,
                                                      nome: array[0].nome,
                                                      cpf: array[0].cpf,
                                                      conclude: true,
                                                      type: array[0].type,
                                                    }
                                                  );
                                                })
                                                .then((resultaaa) => {
                                                  if (order.data.length === 1) {
                                                    api.put(
                                                      `/user/signedStatus/${result.data.id}`
                                                    );
                                                    api.delete(
                                                      `/user/${hash.encode(
                                                        pending.data.id
                                                      )}/pending`
                                                    );
                                                  } else {
                                                    if (
                                                      order.data[1]
                                                        .signature === "pending"
                                                    ) {
                                                      api.post(
                                                        `/eletronic/strange/${order.data[1].email}`,
                                                        {
                                                          idPending: hash.encode(
                                                            pending.data.id
                                                          ),
                                                        }
                                                      );
                                                    } else {
                                                      api.post(
                                                        `/eletronic/signature/${order.data[1].email}`
                                                      );
                                                    }

                                                    api.put(
                                                      `/user/${order.data[1].id}/ordem`
                                                    );
                                                  }
                                                });
                                            }
                                          );
                                        });
                                    });
                                });
                            });
                        })
                        .fail((fail) => {
                          console.log(fail);
                        });
                    });
                } else if (
                  order.data[1].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[1].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 2) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[2].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[2].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[2].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[2].id}/ordem`
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
                } else if (
                  order.data[2].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[2].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 3) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[3].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[3].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[3].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[3].id}/ordem`
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
                } else if (
                  order.data[3].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[3].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 4) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[4].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[4].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[4].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[4].id}/ordem`
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
                } else if (
                  order.data[4].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[4].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 5) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[5].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[5].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[5].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[5].id}/ordem`
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
                } else if (
                  order.data[5].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[5].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 6) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[6].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[6].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[6].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[6].id}/ordem`
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
                } else if (
                  order.data[6].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[6].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[6].email,
                                                  nome: array[6].nome,
                                                  cpf: array[6].cpf,
                                                  conclude: true,
                                                  type: array[6].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 7) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[7].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[7].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[7].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[7].id}/ordem`
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
                } else if (
                  order.data[7].cpf === infoUser.cpf &&
                  pending.data.action === 0
                ) {
                  api
                    .get(`/signaturestart-co/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: $("#certificateSelect").val(),
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinish/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[7].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[3].email,
                                                  nome: array[3].nome,
                                                  cpf: array[3].cpf,
                                                  conclude: true,
                                                  type: array[3].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[4].email,
                                                  nome: array[4].nome,
                                                  cpf: array[4].cpf,
                                                  conclude: true,
                                                  type: array[4].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[5].email,
                                                  nome: array[5].nome,
                                                  cpf: array[5].cpf,
                                                  conclude: true,
                                                  type: array[5].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[6].email,
                                                  nome: array[6].nome,
                                                  cpf: array[6].cpf,
                                                  conclude: true,
                                                  type: array[6].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[7].email,
                                                  nome: array[7].nome,
                                                  cpf: array[7].cpf,
                                                  conclude: true,
                                                  type: array[7].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 8) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
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
              });
            }
            if (checados.length === 1 && pending.data.action === 1) {
              api.get(`/user/file/${pending.data.file}`).then((currentFile) => {
                if (order.data[0].cpf === infoUser.cpf) {
                  api
                    .get(`/signaturestartCades/${currentFile.data.id}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[0].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[0].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument/", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api
                                                .post(
                                                  `/ordem/signed/${result.data.id}`,
                                                  {
                                                    email: element.email,
                                                    nome: element.nome,
                                                    cpf: element.cpf,
                                                    conclude: element.conclude,
                                                    type: element.type,
                                                  }
                                                )
                                                .then((resultc) => {
                                                  api.put(
                                                    `/ordem/signed/${result.data.id}`,
                                                    {
                                                      email: array[0].email,
                                                      nome: array[0].nome,
                                                      cpf: array[0].cpf,
                                                      conclude: true,
                                                      type: array[0].type,
                                                    }
                                                  );
                                                })
                                                .then((resultaa) => {
                                                  if (order.data.length === 1) {
                                                    api.put(
                                                      `/user/signedStatus/${result.data.id}`
                                                    );
                                                    api.delete(
                                                      `/user/${hash.encode(
                                                        pending.data.id
                                                      )}/pending`
                                                    );
                                                  } else {
                                                    if (
                                                      order.data[1]
                                                        .signature === "pending"
                                                    ) {
                                                      api.post(
                                                        `/eletronic/strange/${order.data[1].email}`,
                                                        {
                                                          idPending: hash.encode(
                                                            pending.data.id
                                                          ),
                                                        }
                                                      );
                                                    } else {
                                                      api.post(
                                                        `/eletronic/signature/${order.data[1].email}`
                                                      );
                                                    }

                                                    api.put(
                                                      `/user/${order.data[1].id}/ordem`
                                                    );
                                                  }
                                                });
                                            }
                                          );
                                        });
                                    });
                                });
                            });
                        })
                        .fail((fail) => {
                          console.log(fail);
                        });
                    });
                } else if (
                  order.data[1].cpf === infoUser.cpf &&
                  pending.data.action === 1
                ) {
                  api
                    .get(`/signaturestart-coCades/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[1].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[1].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 2) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[2].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[2].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[2].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[2].id}/ordem`
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
                } else if (
                  order.data[2].cpf === infoUser.cpf &&
                  pending.data.action === 1
                ) {
                  api
                    .get(`/signaturestart-coCades/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[2].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[2].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 3) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
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
              });
            }
            if (checados.length >= 2 && pending.data.action === 1) {
              api.get(`/user/file/${pending.data.file}`).then((currentFile) => {
                if (order.data[0].cpf === infoUser.cpf) {
                  api
                    .get(`/signaturestartCades/${currentFile.data.id}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[0].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[0].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument/", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api
                                                .post(
                                                  `/ordem/signed/${result.data.id}`,
                                                  {
                                                    email: element.email,
                                                    nome: element.nome,
                                                    cpf: element.cpf,
                                                    conclude: element.conclude,
                                                    type: element.type,
                                                  }
                                                )
                                                .then((resultc) => {
                                                  api.put(
                                                    `/ordem/signed/${result.data.id}`,
                                                    {
                                                      email: array[0].email,
                                                      nome: array[0].nome,
                                                      cpf: array[0].cpf,
                                                      conclude: true,
                                                      type: array[0].type,
                                                    }
                                                  );
                                                })
                                                .then((resultaa) => {
                                                  if (order.data.length === 1) {
                                                    api.put(
                                                      `/user/signedStatus/${result.data.id}`
                                                    );
                                                    api.delete(
                                                      `/user/${hash.encode(
                                                        pending.data.id
                                                      )}/pending`
                                                    );
                                                  } else {
                                                    if (
                                                      order.data[1]
                                                        .signature === "pending"
                                                    ) {
                                                      api.post(
                                                        `/eletronic/strange/${order.data[1].email}`,
                                                        {
                                                          idPending: hash.encode(
                                                            pending.data.id
                                                          ),
                                                        }
                                                      );
                                                    } else {
                                                      api.post(
                                                        `/eletronic/signature/${order.data[1].email}`
                                                      );
                                                    }

                                                    api.put(
                                                      `/user/${order.data[1].id}/ordem`
                                                    );
                                                  }
                                                });
                                            }
                                          );
                                        });
                                    });
                                });
                            });
                        })
                        .fail((fail) => {
                          console.log(fail);
                        });
                    });
                } else if (
                  order.data[1].cpf === infoUser.cpf &&
                  pending.data.action === 1
                ) {
                  api
                    .get(`/signaturestart-coCades/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[1].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[1].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 2) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
                                            );
                                          } else {
                                            if (
                                              order.data[2].signature ===
                                              "pending"
                                            ) {
                                              api.post(
                                                `/eletronic/strange/${order.data[2].email}`,
                                                {
                                                  idPending: hash.encode(
                                                    pending.data.id
                                                  ),
                                                }
                                              );
                                            } else {
                                              api.post(
                                                `/eletronic/signature/${order.data[2].email}`
                                              );
                                            }

                                            api.put(
                                              `/user/${order.data[2].id}/ordem`
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
                } else if (
                  order.data[2].cpf === infoUser.cpf &&
                  pending.data.action === 1
                ) {
                  api
                    .get(`/signaturestart-coCades/${pending.data.signedFile}`)
                    .then((result) => {
                      pki
                        .signWithRestPki({
                          token: result.data.token,
                          thumbprint: order.data[2].signature,
                        })
                        .success((resultado) => {
                          api
                            .post(`/signaturefinishCades/${resultado}`)
                            .then((res) => {
                              api
                                .put(
                                  `/user/${pending.data.id}/pending/${res.data.signedFile}`
                                )
                                .then((result) => {
                                  api
                                    .put(`/user/${order.data[2].id}/pending`, {
                                      conclude: true,
                                    })
                                    .then((result) => {
                                      api
                                        .post("/user/signedDocument", {
                                          orgDoc,
                                          pasteDoc,
                                          file: pending.data.file,
                                          url: currentFile.data.key,
                                          nome: pending.data.nome,
                                          action: pending.data.action,
                                          key: res.data.signedFile,
                                          status: 0,
                                          submetido: pending.data.submetido,
                                          descriptionDoc:
                                            pending.data.description,
                                          uniqueCod: pending.data.uniqueCod,
                                        })
                                        .then((result) => {
                                          newArray.forEach(
                                            (element, i, array) => {
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[0].email,
                                                  nome: array[0].nome,
                                                  cpf: array[0].cpf,
                                                  conclude: true,
                                                  type: array[0].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[1].email,
                                                  nome: array[1].nome,
                                                  cpf: array[1].cpf,
                                                  conclude: true,
                                                  type: array[1].type,
                                                }
                                              );
                                              api.post(
                                                `/ordem/signed/${result.data.id}`,
                                                {
                                                  email: array[2].email,
                                                  nome: array[2].nome,
                                                  cpf: array[2].cpf,
                                                  conclude: true,
                                                  type: array[2].type,
                                                }
                                              );
                                            }
                                          );

                                          if (order.data.length === 3) {
                                            api.put(
                                              `/user/signedStatus/${result.data.id}`
                                            );
                                            api.delete(
                                              `/user/${hash.encode(
                                                pending.data.id
                                              )}/pending`
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
              });
            }
          })
        );
    });
  }

  return block === true ? (
    <div>
      <BlockUi tag="div" blocking={block}>
        <h5>assinando os documentos</h5>
      </BlockUi>
    </div>
  ) : (
    <div className="main-container">
      {loading === true ? (
        <div />
      ) : (
        <div>
          {infoUser.number === null ? (
            <AlertTelefone nome={infoUser.nome.split("")[0].toLowerCase()} />
          ) : (
            <div />
          )}
        </div>
      )}

      <div className="container-fluid">
        <div className="row cards-body">
          <div className="col-md-4 card-pending">
            <h2>Documentos Pendentes</h2>
            <div className="cards-content">
              {loading === true ? (
                <Loading height={60} width={60} color="#404040" />
              ) : (
                <div>
                  {pending.map((item, i) => (
                    <div className="list-document" key={[i]}>
                      <a
                        href={`/dashboard/document/pendingdocument/${hash.encode(
                          item.id
                        )}`}
                      >
                        <p className="list-nome">
                          <i className="fas fa-file" />
                          {item.nome}
                        </p>
                        <div className="list-description">
                          {item.description === null ? (
                            <div />
                          ) : (
                            <div className="list-description-itens">
                              <small>descrição : </small>
                              <p className="">{item.description}</p>{" "}
                            </div>
                          )}

                          <div className="list-description-itens">
                            <small>criado em : </small>
                            <p className="">
                              {" "}
                              {moment(item.createdAt).format(
                                "DD-MM-YY HH:mm:ss"
                              )}
                            </p>{" "}
                          </div>
                        </div>
                      </a>
                      <div className="list-pastes">
                        <div className="list-pastes-itens">
                          {item.OrganizationPaste.length < 1 ? (
                            <div>
                              <a href="/dashboard/organization">
                                <i className="far fa-building" />
                              </a>
                            </div>
                          ) : (
                            <div>
                              <a
                                href={`/dashboard/organization/${item.OrganizationPaste[0].id}`}
                              >
                                <i className="far fa-building" />{" "}
                                {item.OrganizationPaste[0].nome}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="list-pastes-itens">
                          {item.pastePendings.length < 1 ? (
                            <div>
                              <a href="/dashboard/pastas">
                                <i className="fas fa-folder" />
                              </a>
                            </div>
                          ) : (
                            <div>
                              <a
                                href={`/dashboard/pastas/${item.pastePendings[0].id}`}
                              >
                                <i className="fas fa-folder" />{" "}
                                {item.pastePendings[0].nome}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4 card-conclude">
            <h2>Documentos concluídos</h2>
            <div className="cards-content">
              {loading === true ? (
                <Loading height={60} width={60} color="#404040" />
              ) : (
                <div>
                  {signed.map((item, i) => (
                    <div className="list-document" key={[i]}>
                      <a
                        href={`/dashboard/document/signed/${hash.encode(
                          item.id
                        )}`}
                      >
                        <p className="list-nome">
                          <i className="fas fa-file" />
                          {item.nome}
                        </p>
                        <div className="list-description">
                          {item.description === null ? (
                            <div />
                          ) : (
                            <div className="list-description-itens">
                              <small>descrição : </small>
                              <p className="">{item.description}</p>{" "}
                            </div>
                          )}

                          <div className="list-description-itens">
                            <small>concluído em : </small>
                            <p className="">
                              {" "}
                              {moment(item.createdAt).format(
                                "DD-MM-YY HH:mm:ss"
                              )}
                            </p>{" "}
                          </div>
                        </div>
                      </a>

                      <div className="list-pastes">
                        <div className="list-pastes-itens">
                          {item.OrganizationSigned.length < 1 ? (
                            <div>
                              <a href="/dashboard/organization">
                                <i className="far fa-building" />
                              </a>
                            </div>
                          ) : (
                            <div>
                              <a
                                href={`/dashboard/organization/${item.OrganizationSigned[0].id}`}
                              >
                                <i className="far fa-building" />{" "}
                                {item.OrganizationSigned[0].nome}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="list-pastes-itens">
                          {item.pasteSigned.length < 1 ? (
                            <div>
                              <a href="/dashboard/pastas">
                                <i className="fas fa-folder" />
                              </a>
                            </div>
                          ) : (
                            <div>
                              <a
                                href={`/dashboard/pastas/${item.pasteSigned[0].id}`}
                              >
                                <i className="fas fa-folder" />{" "}
                                {item.pasteSigned[0].nome}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4 card-action">
            <h2>Ações rápidas</h2>
            <div className="cards-content">
              {loading === true ? (
                <Loading width={60} height={60} color="#404040" />
              ) : (
                <div>
                  {pending.length >= 2 ? (
                    <div>
                      {pending.map((item, i) => (
                        <div className="list-document" key={[i]}>
                          <a
                            href={`/dashboard/document/pendingdocument/${hash.encode(
                              item.id
                            )}`}
                          >
                            <input
                              type="checkbox"
                              id={item.id}
                              value={hash.encode(item.id)}
                              onChange={function () {
                                const a = document.querySelectorAll(
                                  "input:checked"
                                );
                                if (a.length < 1) {
                                  setDisplay(false);
                                }
                              }}
                            />
                            <label htmlFor={item.id} className="list-nome">
                              <i className="fas fa-file" />
                              {item.nome}
                            </label>
                            <div className="list-description">
                              {item.description === null ? (
                                <div />
                              ) : (
                                <div className="list-description-itens">
                                  <small>descrição : </small>
                                  <p className="">{item.description}</p>{" "}
                                </div>
                              )}

                              <div className="list-description-itens">
                                <small>criado em : </small>
                                <p className="">
                                  {" "}
                                  {moment(item.createdAt).format(
                                    "DD-MM-YY HH:mm:ss"
                                  )}
                                </p>{" "}
                              </div>
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              )}
            </div>
            {pending.length >= 2 ? (
              <div>
                <div className="buttons">
                  <div className="container-button">
                    <select className="custom-select " id="certificateSelect" />
                    <button
                      type="button"
                      onClick={() => assinaturaLote()}
                      className="button-assinar effect01"
                      id="assinaturaLote"
                      disabled={!display}
                    >
                      <span>assinar </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
