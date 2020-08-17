import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

import Image001 from "../images/image001.png";

function Signature() {
  const [infoUser, setInfoUser] = useState();
  const signCanvas = useRef([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    api.get("/auth/userinfo").then((infoUser) => {
      setInfoUser(infoUser.data);
    });
  }, []);

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
      ctx.drawImage(image2, 100, 200);
      ctx.drawImage(image, 300, 150, 150, 150);
      ctx.fillStyle = "black";
      ctx.fillText("Assinado eletronicamente por:", 9, 130);
      ctx.fillText(infoUser.nome, 9, 150);
      ctx.fillText(infoUser.email, 9, 200);
      ctx.fillText(infoUser.cpf, 9, 250);
      const carimbo = canvas.toDataURL("image/png");
      console.log(carimbo);
      srcToFile(carimbo, `${infoUser.nome}.txt`, "image/png").then((file) => {
        const fd = new FormData();
        fd.append("userfile", file);
        return api
          .post(`/uploadavatar/${infoUser.id}`, fd, {
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
  return (
    <div>
      <div className="alert alert-danger" role="alert">
        {" "}
        A sua rubrica está pendente, adicione! será necessária para a assinatura
        eletrônica{" "}
        <p
          className="modal-signature"
          data-toggle="modal"
          data-target="#exampleModal2"
        >
          &nbsp; clique aqui!
        </p>
      </div>
      <div
        class="modal fade"
        id="exampleModal2"
        tabindex="-1"
        aria-labelledby="exampleModalLabel2"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel2">
                Modal title
              </h5>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-dismiss="modal"
              >
                Fechar
              </button>
              <button type="button" class="btn btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signature;
