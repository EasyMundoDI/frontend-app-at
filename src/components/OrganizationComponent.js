import React, { useEffect, useState, useRef } from "react";
import Axios from "axios";
import House from "../images/house.png";
import world from "../images/world.png";
import api from "../services/api";
import hashids from "hashids";

const hash = new hashids("", 35);

function OrganizationComponent({ organizations, document, type }) {
  const [organization, setOrganization] = useState([]);
  const [documentOrganization, setDocumentOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const referenceOrg = useRef(null);

  useEffect(() => {
    Axios.all([api.get(`/user/organization`)]).then(
      Axios.spread((infoOrganization) => {
        if (type === "signed") {
          api
            .get(`/organization/signedPaste/${hash.encode(document.id)}`)
            .then((documentOrganization) => {
              setDocumentOrganization(documentOrganization.data[0]);
            });
        } else {
          api
            .get(`/organization/pendingPaste/${hash.encode(document.id)}`)
            .then((documentOrganization) => {
              setDocumentOrganization(documentOrganization.data[0]);
            });
        }
        setOrganization(infoOrganization.data);

        setLoading(false);
      })
    );
  }, []);

  function changeOrganizationPending() {
    if (organizations == null || organizations === undefined) {
      api
        .post(`/organization/pendingPaste/${document.id}`, {
          org: referenceOrg.current.value,
        })
        .then(window.location.reload(false));
    } else {
      api
        .put(
          `/user/${document.id}/pendingorganization/${referenceOrg.current.value}`
        )
        .then(window.location.reload(false));
    }
  }
  function changeOrganizationConclude() {
    if (organizations.length < 1) {
      api
        .post(`/user/signedOrgPaste/${document.id}`, {
          paste: referenceOrg.current.value,
        })
        .then(window.location.reload(false));
    } else {
      api
        .put(
          `/user/${document.id}/signedorganization/${referenceOrg.current.value}`
        )
        .then(window.location.reload(false));
    }
  }

  return loading === true ? (
    <div></div>
  ) : (
    <div>
      {" "}
      <div>
        <a href="/" data-toggle="modal" data-target="#modalOrganizationAvatar">
          <img src={House} alt="" />
        </a>
        <small>
          {documentOrganization === null ||
          documentOrganization === undefined ? (
            <p>sem organização</p>
          ) : (
            <p>{documentOrganization.nome}</p>
          )}
        </small>
        <div
          className="modal fade"
          id="modalOrganizationAvatar"
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
                <h5>Organizações</h5>

                <div className="md-form ml-0 mr-0">
                  <select
                    className="custom-select select-custom"
                    ref={referenceOrg}
                  >
                    <option value={0}>Organizações</option>
                    {organization.map((v, i) => (
                      <option value={v.id} key={i}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "signed" ? (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => changeOrganizationConclude()}
                      className="btn btn-cyan mt-1"
                    >
                      adicionar <i className="fas fa-sign-in ml-1"></i>
                    </button>
                  </div>
                ) : (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => changeOrganizationPending()}
                      className="btn btn-cyan mt-1"
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
    </div>
  );
}

export default OrganizationComponent;
