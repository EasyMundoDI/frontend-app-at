import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import api from "../services/api";
import Hashids from "hashids";
import axios from "axios";
import Loading from "../components/Loading";
import moment from "moment";
import Mail from "../images/mail.png";
import Caution from "../images/caution.png";
import Filepdf from "../images/pdf.png";
import Filegeneric from "../images/filegeneric.png";
import Iconnewdocument from "../assets/icons/file.png";

import Logo from "../images/logo_branca.png";
////***voltar akiiiiiiiiiiiiiii** */
function DocumentStrange() {
  const { id, strangeId } = useParams();
  const history = useHistory();

  const [pending, setPendingDocument] = useState([]);
  const [userOrder, setUserOrder] = useState(null);
  const [fileDocument, setFileDocument] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.all([api.get(`/pending/${id}`)]).then(
      axios.spread((pendingInfo) => {
        if (pendingInfo.data !== null) {
          api.get(`/user/file/${pendingInfo.data.file}`).then((fileInfo) => {
            setFileDocument(fileInfo.data);
          });
          api.get(`/user/order/${id}`).then((orderInfo) => {
            setCurrentOrder(orderInfo.data);
          });
          api
            .get(`/user/strangeorder/${strangeId}/${id}`)
            .then((strangeOrder) => {
              setUserOrder(strangeOrder.data);
            });
          setPendingDocument(pendingInfo.data);
        }

        setTimeout(() => {
          setLoading(false);
        }, 3000);
      })
    );
  }, [id, setLoading, strangeId]);

  function gotoSign() {
    history.push(`/document/${id}/sign/${strangeId}`);
  }

  function sendingMail(email) {
    api.post(`/eletronic/signature/${email}`);
  }

  function sendingMail2(email) {
    api.post(`/eletronic/signature/${email}`);
  }

  return loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div>
      {pending.length < 1 ? (
        <div>hello</div>
      ) : (
        <div>
          {" "}
          <div className="main-container">
            <div className="header-strange">
              <img src={Logo} className="img-fluid" alt="" />
            </div>
            <div className="card card-document-container">
              <div className="document-pending">
                {" "}
                <img src={Caution} alt="" /> <p>documento pendente</p>
              </div>
              <div className="row  document-container">
                <div className="col document-container-img  ">
                  {pending.action === 0 ? (
                    <div>
                      <a href={fileDocument.url} target="_blank">
                        <img src={Filepdf} alt="" />
                        <span>documento original</span>
                      </a>
                    </div>
                  ) : (
                    <div>
                      <a href={fileDocument.url} target="_blank">
                        <img src={Filegeneric} alt="" />
                        <span>documento original</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="col document-container-information ">
                  <div className="document-container-information-list">
                    <small>nome</small>
                    <li>{pending.nome}</li>
                    <small>submetido por:</small>
                    <li> {pending.submetido}</li>
                    <small>descrição:</small>
                    <li> {pending.description}</li>
                    <small>criado em:</small>
                    <li>
                      {moment(pending.createdAt).format("DD-MM-YY HH:mm:ss")}
                    </li>
                    <div className="document-container-information-img"></div>
                  </div>
                  <div className="document-container-information-paste"></div>
                </div>
              </div>
            </div>
            <div className="card-document-container">
              <div className=" row ">
                <div className="container-boards col-lg-5">
                  <div className="container-board">
                    <h3>Ordem das Ações</h3>
                    <div className="container-dropzone" id="main">
                      {currentOrder.map((element, i) => (
                        <div
                          key={i}
                          className="cards-dropzone"
                          draggable="true"
                          id="cards-dropzone"
                        >
                          <div className="status"> </div>
                          <div className="content-type">
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
                          <div className="sending-mail">
                            {element.signature === "pending" &&
                            element.view === true ? (
                              <button
                                className="email-button"
                                onClick={() => sendingMail(element.email)}
                              >
                                {" "}
                                <img src={Mail} alt="" />
                              </button>
                            ) : (
                              <div></div>
                            )}
                            {element.signature === "strange" &&
                            element.view === true ? (
                              <button
                                className="email-button"
                                onClick={() => sendingMail(element.email)}
                              >
                                {" "}
                                <img src={Mail} alt="" />
                              </button>
                            ) : (
                              <div></div>
                            )}
                            {element.conclude === false ? (
                              <p className="element-pending">pendente</p>
                            ) : (
                              <p className="element-conclude">concluído</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {userOrder === undefined ? (
                  <div> </div>
                ) : (
                  <div>
                    {userOrder.view === true ? (
                      <div>
                        {userOrder.type === "observador" ? (
                          <div></div>
                        ) : (
                          <div></div>
                        )}
                        {userOrder.type === "signatario" ? (
                          <div>
                            {" "}
                            <div className="button-signer col-md-1">
                              {userOrder.conclude === true ? (
                                <div></div>
                              ) : (
                                <button
                                  className="btn btn-cyan mt-1"
                                  onClick={() => gotoSign()}
                                >
                                  assinar{" "}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        {userOrder.type === "aprovador" ? (
                          <div className="button-signer col-md-1">
                            {userOrder.conclude === false ? (
                              <div>
                                {" "}
                                <button
                                  className="btn btn-cyan mt-1"
                                  onClick={() => gotoSign()}
                                >
                                  aprovar{" "}
                                </button>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentStrange;
