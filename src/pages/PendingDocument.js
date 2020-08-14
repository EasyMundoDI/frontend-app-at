import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { cpfMask } from "../util/Mask";
import Filepdf from "../images/pdf.png";
import Filegeneric from "../images/filegeneric.png";
import Mail from "../images/mail.png";
import PasteComponent from "../components/PasteComponent";
import OrganizationComponent from "../components/OrganizationComponent";
import Caution from "../images/caution.png";
import Loading from "../components/Loading";
import moment from "moment";

import hashids from "hashids";
import Axios from "axios";
const hash = new hashids("", 35);

function PedingDocument() {
  const [currentOrder, setCurrentOrder] = useState([]);

  const [fileDocument, setFileDocument] = useState([]);
  const [pasteDocument, setPasteDocument] = useState(null);
  const [organizationDocument, setOrganizationDocument] = useState(null);
  const [userOrder, setUserOrder] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [pending, setPendingDocument] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const history = useHistory();

  useEffect(() => {
    Axios.all([
      api.get(`/pending/${id}`),
      api.get(`/user/paste/${id}`),
      api.get(`/auth/userinfo`),
      api.get(`/organization/pendingPaste/${id}`),
      api.get(`/user/order/${id}`),
    ]).then(
      Axios.spread(
        (
          pendingDocument,
          pasteDocument,
          currentUser,
          organizationDocument,
          currentOrder
        ) => {
          api
            .get(`/user/file/${pendingDocument.data.file}`)
            .then((fileDocument) => {
              setFileDocument(fileDocument.data);
              api
                .get(`/user/pending/${id}/${currentUser.data.cpf}`)
                .then((userOrder) => {
                  setUserOrder(userOrder.data[0]);
                  console.log(currentOrder.data);
                  setPasteDocument(pasteDocument.data);
                  setPendingDocument(pendingDocument.data);
                  setCurrentUser(currentUser.data);
                  setOrganizationDocument(organizationDocument.data[0]);
                  setCurrentOrder(currentOrder.data);
                  setLoading(false);
                });
            });
        }
      )
    );
  }, [id]);

  function gotoSign() {
    history.push(
      `/dashboard/document/pendingdocument/${hash.encode(pending.id)}/sign`
    );
  }

  /*voltar aqui */

  function sendingMail(email) {
    api.post(`/eletronic/signature/${email}`);
  }

  /*voltar aqui */

  return loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div className="main-container">
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
              <li>{moment(pending.createdAt).format("DD-MM-YY HH:mm:ss")}</li>
              <div className="document-container-information-img">
                {currentUser.nome === pending.submetido ? (
                  <div className="document-container-information-img">
                    <PasteComponent paste={pasteDocument} document={pending} />
                    <OrganizationComponent
                      organizations={organizationDocument}
                      document={pending}
                    />
                  </div>
                ) : (
                  <div>
                    <small>
                      {organizationDocument !== undefined ? (
                        <strong>{organizationDocument.nome}</strong>
                      ) : (
                        <div>
                          <strong>sem organização</strong>
                        </div>
                      )}
                    </small>
                  </div>
                )}
              </div>
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
                      <p>{cpfMask(element.cpf)}</p>
                    </div>
                    {element.conclude === true || element.view === null ? (
                      <div></div>
                    ) : (
                      <div>
                        {" "}
                        <button
                          className="email-button"
                          onClick={() => sendingMail(element.email)}
                        >
                          {" "}
                          <img src={Mail} alt="" />
                        </button>
                      </div>
                    )}

                    <div className="sending-mail">
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
            <div></div>
          ) : (
            <div>
              {userOrder.type === "observador" ? <div></div> : <div></div>}
              {userOrder.type === "signatario" ? (
                <div></div>
              ) : (
                <div className="button-signer col-md-1">
                  {userOrder.conclude === true || userOrder.view === null ? (
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
              )}
              {userOrder.type === "aprovador" ? (
                <div></div>
              ) : (
                <div className="button-signer col-md-1">
                  {userOrder.conclude === true || userOrder.view === null ? (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PedingDocument;
