import React, { useEffect, useContext, useState } from "react";
import { Context } from "../Context/AuthContext";
import api from "../services/api";
import NoCertificate from "../components/NoCertficate";

import { FaIdCard } from "react-icons/fa";

function Certificate() {
  const [loading, setLoading] = useState(true);
  const [userCerts, setUserCerts] = useState();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 5000);

    async function loadCertificate() {
      const loadCert = await api.get(`/user/usercert`);
      if (loadCert) {
        setUserCerts(loadCert.data);
      }
    }
    loadCertificate();
  }, [setLoading]);
  console.log(userCerts);

  function deleteCert(id) {
    setLoading(true);
    api.delete(`/user/${id}/usercert`);
    setLoading(false);
    window.location.reload(false);
  }

  return loading ? (
    <div>
      <h1>loading</h1>
    </div>
  ) : (
    <div>
      {userCerts.length !== 0 ? (
        <div>
          <h4>
            <strong>dados dos certificados</strong>{" "}
            <FaIdCard className="icontitleCertificate" />
          </h4>
          {userCerts.map((certs) => (
            <div key={certs.id}>
              <div className="containerCertificate">
                <button onClick={() => deleteCert(certs.id)}>
                  <strong>excluir</strong>
                </button>
                <ul>
                  <li>
                    <p>
                      <strong>nome : </strong>
                      {certs.nome}
                    </p>
                  </li>

                  <li>
                    <p>
                      <strong>cpf : </strong>
                      {certs.cpf}
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>emissão : </strong>
                      {certs.validityStart}
                    </p>
                    <p>
                      <strong>expiração : </strong>
                      {certs.validityEnd}
                    </p>
                  </li>

                  <li>
                    <p>
                      <strong>a. certificadora : </strong>
                      {certs.emitido}
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>thumbprint : </strong>
                      {certs.thumbprint}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoCertificate />
      )}
    </div>
  );
}

export default Certificate;
