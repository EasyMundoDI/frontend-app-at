import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import api from "../services/api";
import email from "../images/email.png";
import logo from "../images/Mundo_Digital_Logo_Fundo_Transparente.png";
import Loading from "../components/Loading";
function EmailVerification() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState(null);
  const history = useHistory();
  useEffect(() => {
    async function checkEmail() {
      const tokenSearch = await api.post(`/active/${token}`);
      if (tokenSearch) {
        setConfirm(tokenSearch.data.token);
        setConfirmEmail(tokenSearch.data.confirmed);
        setLoading(false);
      }
    }
    checkEmail();
  }, [token]);

  function gotoSign() {
    history.push("/signin");
  }

  return (
    <div className="container-verification">
      {loading === true ? (
        <Loading color="#FFF" height={80} width={80} />
      ) : (
        <div>
          <div>
            <img src={email} alt="" />
            <h2>email confirmado</h2>
            <button className="btn btn-primary" onClick={() => gotoSign()}>
              LOGIN
            </button>
            <footer>
              <p className="copyright">
                {" "}
                <img src={logo} alt="" srcSet="" /> © 2020 - Todos os direitos
                reservados
              </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailVerification;
