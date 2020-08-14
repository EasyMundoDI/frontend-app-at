import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";
import Axios from "axios";
import moment from "moment";
import Loading from "../components/Loading";
import Tick from "../images/tick.png";
import Filepdf from "../images/pdf.png";
import Filegeneric from "../images/filegeneric.png";
import Mail from "../images/mail.png";
import PasteComponent from "../components/PasteComponent";
import OrganizationComponent from "../components/OrganizationComponent";

function SignConcluded() {
  const { id } = useParams();
  const [signed, setSigned] = useState();
  const [loading, setLoading] = useState(true);
  const [organizationDocument, setOrganizationDocument] = useState(null);
  const [fileDocument, setFileDocument] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [pasteDocument, setPasteDocument] = useState();
  const [currentUser, setCurrentUser] = useState();
  const [userOrder, setUserOrder] = useState([]);

  useEffect(() => {
    Axios.all([
      api.get(`/user/signed/${id}`),
      api.get(`/user/paste/signed/${id}`),
      api.get(`/organization/signedPaste/${id}`),
      api.get(`/ordem/signed/${id}`),
      api.get(`/auth/userinfo`),
    ]).then(
      Axios.spread(
        (
          signed,
          pasteDocument,
          organizationDocument,
          currentOrder,
          currentUser
        ) => {
          api
            .get(`/user/pending/${id}/${currentUser.data.cpf}`)
            .then((userOrder) => {
              setUserOrder(userOrder.data[0]);
            });
          api.get(`/user/file/${signed.data.file}`).then((fileDocument) => {
            setFileDocument(fileDocument.data);
          });
          setSigned(signed.data);
          setPasteDocument(pasteDocument.data);
          setOrganizationDocument(organizationDocument.data);
          setCurrentUser(currentUser.data);
          setCurrentOrder(currentOrder.data);
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }
      )
    );
  }, [id]);

  function sendingMail(email) {
    api.post(`/eletronic/signature/${email}`);
  }

  function sendingMail2(email) {
    api.post(`/eletronic/signature/${email}`);
  }

  return loading === true ? (
    <div>
      <div className="main-container">
        <div className="container-loading">
          <Loading color="#3D92C2" height={80} width={80} />
        </div>
      </div>
    </div>
  ) : (
    <div className="main-container">
      <div className="card card-document-container">
        <div className="document-concluido">
          {" "}
          <img src={Tick} alt="" /> <p>documento concluído</p>
        </div>
        <div className="row  document-container">
          <div className="col document-container-img  ">
            {signed.action === 0 ? (
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
              <li>{signed.nome}</li>
              <small>submetido por:</small>
              <li> {signed.submetido}</li>
              <small>descrição:</small>
              <li> {signed.description}</li>
              <small>criado em:</small>
              <li>{moment(signed.createdAt).format("DD-MM-YY HH:mm:ss")}</li>
              <div className="document-container-information-img">
                {currentUser.nome === signed.submetido ? (
                  <div className="document-container-information-img">
                    <PasteComponent
                      type={"signed"}
                      paste={pasteDocument}
                      document={signed}
                    />
                    <OrganizationComponent
                      type={"signed"}
                      organizations={organizationDocument}
                      document={signed}
                    />
                  </div>
                ) : (
                  <div>
                    <small>
                      {organizationDocument.lenght >= 1 ? (
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
                      <p>{element.cpf}</p>
                    </div>
                    <div className="sending-mail">
                      {element.signature === "signed" &&
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
          <div className=" col-lg-5">
            <div className="btn-group-vertical">
              {signed.action === 0 ? (
                <a
                  href={`${process.env.REACT_APP_BACKEND_URL}/printer-friendly/${signed.key}/pades`}
                  target="_blank"
                >
                  <button className="btn btn-info">
                    versão para impressão
                  </button>
                </a>
              ) : (
                <a
                  href={`${process.env.REACT_APP_BACKEND_URL}/files/${signed.key}`}
                  target="_blank"
                >
                  <button className="btn btn-info">assinaturas</button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignConcluded;
