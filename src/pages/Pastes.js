import React, { useEffect, useState, useRef } from "react";
import world from "../images/world.png";
import api from "../services/api";
import { cnpjMask } from "../util/Mask";
import axios from "axios";
import Loading from "../components/Loading";
import Folder from "../images/add.png";
import Folder2 from "../images/folder.png";

import trash from "../images/trash.png";
import searchimg from "../images/searchimg.png";
import hashids from "hashids";
const hash = new hashids("", 35);
function Pastes() {
  const currentRef = useRef();
  const [paste, setPastes] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [orgsPaste, setOrgsPastes] = useState([]);
  const [orgsPasteDesc, setOrgsPastesDesc] = useState([]);
  const [orgsOrgid, setOrgid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [value, setValue] = useState([]);
  const [display, setDisplay] = useState(true);
  const [display1, setDisplay1] = useState(false);
  const [search, setSearch] = useState("pessoal");
  const [searchValue, setSearchValue] = useState(0);

  console.log(searchValue);

  useEffect(() => {
    axios.all([api.get(`/user/userpaste`), api.get(`/user/organization`)]).then(
      axios.spread((findPaste, findOrganization) => {
        setPastes(findPaste.data);
        setLoading2(false);
        setOrgs(findOrganization.data);
        setLoading(false);
      })
    );
  }, []);

  async function addPaste(data, value) {
    var pastePessoal = document.getElementById("form28").value;
    var pastePessoalDesc = document.getElementById("form29").value;
    if (data === "pessoal") {
      api
        .post(`/user/userpaste`, {
          nome: pastePessoal,
          description: pastePessoalDesc,
        })
        .then((result) => {
          window.location.reload(false);
        });
    } else {
      api
        .post(`/pasteorganization/${value}/${pastePessoal}`, {
          description: pastePessoalDesc,
        })
        .then((result) => {
          window.location.reload(false);
        });
    }
  }
  async function deletePessoal(data) {
    api.delete(`/user/${data}/paste`).then((result) => {
      window.location.reload(false);
    });
  }
  async function deleteOrg(data) {
    api.delete(`/user/${data}/pasteOrg`).then((result) => {
      window.location.reload(false);
    });
  }
  function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("p")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  return loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div className="main-container">
      <ul className="nav nav-pills nav-fill">
        <li className=" nav-item ">
          <select
            className="nav-link custom-select select-custom"
            id="select-custom"
            ref={currentRef}
            onChange={(e) => {
              setDisplay(!display);
              setLoading2(true);

              if (
                currentRef.current.selectedOptions[0].innerText !== "pessoal"
              ) {
                api
                  .get(`/pasteorganization/${currentRef.current.value}`)
                  .then((result) => {
                    setOrgsPastes(result.data);

                    setLoading2(false);
                  });
                api
                  .get(`/user/organization/${currentRef.current.value}`)
                  .then((result) => {
                    setOrgsPastesDesc(cnpjMask(result.data.number));
                    setOrgid(result.data.id);
                  });
                setDisplay(false);
                setSearch(currentRef.current.selectedOptions[0].innerText);
                setSearchValue(currentRef.current.value);
              }
              if (
                currentRef.current.selectedOptions[0].innerText === "pessoal"
              ) {
                setLoading2(false);
                setDisplay(true);
                setSearch(currentRef.current.selectedOptions[0].innerText);
                setSearchValue(currentRef.current.value);
              }
            }}
          >
            <option value={0}>pessoal</option>
            {orgs.map((iten, i) => (
              <option value={iten.id} key={i}>
                {iten.nome}
              </option>
            ))}
          </select>
        </li>
        <li className="nav-item">
          <label
            data-error="wrong"
            data-success="right"
            htmlFor="select-custom"
            className="ml-0 label-select"
          ></label>
        </li>
        <li className="nav-item"></li>
        <li className="nav-item">
          <div className="myinput">
            <a href="/" data-toggle="modal" data-target="#modalLoginAvatar">
              <img
                className="img-fluid img-backbutton"
                id="img-paste"
                src={Folder}
                alt=""
              />
            </a>
            <input type="text" id="myInput" onKeyUp={() => myFunction()} />
            <img src={searchimg} alt="" />
          </div>
        </li>

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
                <h5>criar pasta</h5>
                <p>{search}</p>

                <div className="md-form ml-0 mr-0">
                  <input
                    type="text"
                    id="form28"
                    className="form-control form-control-sm validate ml-0"
                  />
                  <label
                    data-error="wrong"
                    data-success="right"
                    htmlFor="form28"
                    className="ml-0"
                  >
                    nome
                  </label>
                </div>
                <div className="md-form ml-0 mr-0">
                  <input
                    type="text"
                    id="form29"
                    className="form-control form-control-sm validate ml-0"
                  />
                  <label
                    data-error="wrong"
                    data-success="right"
                    htmlFor="form29"
                    className="ml-0"
                  >
                    descrição
                  </label>

                  <div className="text-center mt-4">
                    <button
                      onClick={() => addPaste(search, searchValue)}
                      className="btn btn-cyan mt-1"
                      id="adicionarnumero"
                    >
                      adicionar <i className="fas fa-sign-in ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ul>

      {display === true ? (
        <div>
          {loading2 === true ? (
            <div className="main-container">
              <div className="container-loading">
                <Loading color="#3D92C2" height={80} width={80} />
              </div>
            </div>
          ) : (
            <div>
              <ul className="list-group list-group-flush " id="myUL">
                {paste.length < 1 ? (
                  <div className="no-paste">
                    <p>Nenhuma pasta encontrada.</p>
                    <h5>
                      adicionar pasta{" "}
                      <a
                        href="/"
                        data-toggle="modal"
                        data-target="#modalLoginAvatar"
                      >
                        <img
                          className="img-fluid img-paste"
                          id="img-paste"
                          src={Folder}
                          alt=""
                        />
                      </a>
                    </h5>
                  </div>
                ) : (
                  <div></div>
                )}
                {paste.map((iten, i) => (
                  <li className="list-group-item-info" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <a href={`/dashboard/pastas/${hash.encode(iten.id)}`}>
                            <img className=" img-fluid " src={Folder2} alt="" />
                            <p>{iten.nome}</p>
                          </a>
                        </div>
                        <div className="col">
                          {" "}
                          <a href={`/dashboard/pastas/${hash.encode(iten.id)}`}>
                            <small>{iten.description}</small>
                          </a>
                        </div>
                        <div className="col">
                          {" "}
                          <img
                            className=" img-fluid "
                            src={trash}
                            alt=""
                            onClick={() => deletePessoal(iten.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          {" "}
          {loading2 === true ? (
            <div className="main-container">
              <div className="container-loading">
                <Loading color="#3D92C2" height={80} width={80} />
              </div>
            </div>
          ) : (
            <div>
              <ul className="list-group list-group-flush" id="myUL">
                {" "}
                {orgsPaste.length < 1 ? (
                  <div className="no-paste">
                    <p>Nenhuma pasta encontrada.</p>
                    <h5>
                      adicionar pasta{" "}
                      <a
                        href="/"
                        data-toggle="modal"
                        data-target="#modalLoginAvatar"
                      >
                        <img
                          className="img-fluid img-paste"
                          id="img-paste"
                          src={Folder}
                          alt=""
                        />
                      </a>
                    </h5>
                  </div>
                ) : (
                  <div></div>
                )}
                {orgsPaste.map((iten, i) => (
                  <li className="list-group-item-info" key={i}>
                    <div className="container">
                      <div className="row">
                        <div className="col ">
                          <a
                            href={`/dashboard/organizationPastas/${hash.encode(
                              orgsOrgid
                            )}`}
                          >
                            <img className=" img-fluid " src={Folder2} alt="" />
                            <p>{iten.nome}</p>
                          </a>
                        </div>
                        <div className="col">
                          {" "}
                          <a
                            href={`/dashboard/organizationPastas/${hash.encode(
                              orgsOrgid
                            )}`}
                          >
                            <small>{iten.description}</small>
                          </a>
                        </div>
                        <div className="col">
                          {" "}
                          <img
                            className=" img-fluid "
                            src={trash}
                            alt=""
                            onClick={() => deleteOrg(iten.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Pastes;
