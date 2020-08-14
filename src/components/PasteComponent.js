import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import Folder from "../images/folder.png";
import world from "../images/world.png";
import api from "../services/api";
import hashids from "hashids";

const hash = new hashids("", 35);

function PasteComponent({ paste, document, type }) {
  const [pastes, setPastes] = useState([]);
  const [documentPastes, setDocumentPastes] = useState(null);
  const [loading, setLoading] = useState(true);
  const reference = useRef(null);

  useEffect(() => {
    Axios.all([api.get(`/user/userpaste`)]).then(
      Axios.spread((infoPaste) => {
        if (type === "signed") {
          api
            .get(`/user/paste/signed/${hash.encode(document.id)}`)
            .then((documentPaste) => {
              setDocumentPastes(documentPaste.data);
            });
        } else {
          api
            .get(`/user/paste/${hash.encode(document.id)}`)
            .then((documentPaste) => {
              setDocumentPastes(documentPaste.data);
            });
        }
        setPastes(infoPaste.data);

        setLoading(false);
      })
    );
  }, []);

  function changePasteSigned() {
    if (paste === undefined || paste === null) {
      api
        .post(`/user/signedPaste/${document.id}`, {
          paste: reference.current.value,
        })
        .then(window.location.reload(false));
    } else {
      api
        .put(`/user/${document.id}/signedpaste/${reference.current.value}`)
        .then(window.location.reload(false));
    }
  }
  function changePaste() {
    if (paste === undefined || paste === null) {
      api
        .post(`/user/pendingPaste/${document.id}`, {
          paste: reference.current.value,
        })
        .then(window.location.reload(false));
    } else {
      api
        .put(`/user/${document.id}/pendingpaste/${reference.current.value}`)
        .then(window.location.reload(false));
    }
  }

  return loading === true ? (
    <div></div>
  ) : (
    <div>
      <a href="/" data-toggle="modal" data-target="#modalLoginAvatar">
        <img src={Folder} alt="" />
      </a>
      <small>
        {documentPastes === null ? (
          <p>sem pasta</p>
        ) : (
          <p>{documentPastes.nome}</p>
        )}
      </small>
      <div
        className="modal fade"
        id="modalLoginAvatar"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="myModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog cascading-modal modal-avatar modal-sm"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <img
                src={world}
                alt="avatar"
                className="rounded-circle img-responsive"
              />
            </div>

            <div className="modal-body text-center mb-1">
              <h1>Pastas</h1>

              <div className="md-form ml-0 mr-0">
                <select className="custom-select select-custom" ref={reference}>
                  <option value={0}>Pastas pessoais</option>
                  {pastes.map((v, i) => (
                    <option value={v.id} key={i}>
                      {v.nome}
                    </option>
                  ))}
                </select>
              </div>

              {type === "signed" ? (
                <div className="text-center mt-4">
                  <button
                    onClick={() => changePasteSigned()}
                    className="btn btn-cyan mt-1"
                    id="adicionarnumero"
                  >
                    adicionar <i className="fas fa-sign-in ml-1"></i>
                  </button>
                </div>
              ) : (
                <div className="text-center mt-4">
                  <button
                    onClick={() => changePaste()}
                    className="btn btn-cyan mt-1"
                    id="adicionarnumero"
                  >
                    adicionar <i className="fas fa-sign-in ml-1"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasteComponent;
