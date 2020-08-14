import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";

import api from "../services/api";
import { cnpjMask, cpfMask, phoneMask } from "../util/Mask";
import Loading from "../components/Loading";
import $ from "jquery";
import hashids from "hashids";
import edit from "../images/edit.png";
import warning from "../images/warning.png";
import trash from "../images/trash.png";
import world from "../images/world.png";
import Adduser from "../images/adduser.png";
import Person from "../images/user.png";
import addorg from "../images/addorg.png";
const hash = new hashids("", 35);
function Organization() {
  const listRef = useRef(null);
  const [displayCpf, setDisplayCpf] = useState(false);
  const [infouser, setInfouser] = useState([]);
  const [searchCpf, setSearchCpf] = useState("");
  const [permission, setPermission] = useState("");
  const [displayautonome, setDisplayAutonome] = useState(false);
  const [displayautoemail, setDisplayAutoemail] = useState(false);
  const [displayadmin, setDisplayAdmin] = useState(false);
  const [displaydefault, setDisplayDefault] = useState(true);
  const [displaymanager, setDisplayManager] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [display, setDisplay] = useState(false);
  const [currentOrg, setCurrentOrg] = useState();
  const [currentOrgDocs, setCurrentOrgDocs] = useState();
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState();
  const [cnpj, setCnpj] = useState("");
  const [orgs, setOrgs] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Axios.all([
      api.get(`/user/organization`),
      api.get(`/user/searchusers`),
    ]).then(
      Axios.spread((searchOrgs, users) => {
        setOrgs(searchOrgs.data);
        setUsers(users.data);
        setLoading(false);
      })
    );
  }, []);

  const handleAutoComplete = (nome, cpf, email) => {
    setSearchCpf(cpf);
    setSearch(nome);
    setSearchEmail(email);
    setDisplayAutonome(false);
    setDisplayAutoemail(false);
  };
  const handleCompleteCpf = (value) => {
    if (
      search.length === 0 ||
      searchCpf.length === 0 ||
      searchEmail.length === 0
    ) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearchCpf(value);

    if (value.length === 3) {
      setDisplayCpf(!displayCpf);
    } else if (value.length < 3) {
      setDisplayCpf(false);
    }
  };
  const handleCompleteName = (value) => {
    if (search.length === 0) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearch(value);
    setSearchEmail(value);

    if (value.length === 3) {
      setDisplayAutonome(true);
    } else if (value.length < 3) {
      setDisplayAutonome(false);
    }
  };
  const handleCompleteEmail = (value) => {
    if (search.length === 0) {
      document.getElementById("adicionar").disabled = false;
    }

    setSearch(value);
    setSearchEmail(value);

    if (value.length === 3) {
      setDisplayAutoemail(!display);
    } else if (value.length < 3) {
      setDisplayAutoemail(false);
    }
  };

  var numsStr = cnpj.replace(/[^0-9]/g, "");
  async function addOrg() {
    var nome = document.getElementById("formaddnome").value;
    var description = document.getElementById("formaddorgdesc").value;
    api
      .post(`/user/organization`, {
        nome: nome,
        number: parseInt(numsStr),
        description: description,
      })
      .then((result) => {
        window.location.reload(false);
      });
  }

  function myFunction2() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchorg");
    filter = input.value;
    ul = document.getElementById("searchorgul");
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

  function processar(value) {
    setCnpj(value);
    if (value.length < 18) {
      document.getElementById("adicionarorg").disabled = true;
    } else {
      document.getElementById("adicionarorg").disabled = false;
    }
  }
  function processar2(value) {
    setCnpj(value);
    var nome = document.getElementById("formeditorgnome").value;
    if (value.length < 18) {
      document.getElementById("adicionarnumero").disabled = true;
    } else {
      document.getElementById("adicionarnumero").disabled = false;
    }
  }
  function editOrg(id) {
    var nome = document.getElementById("formeditorgnome").value;
    var number = document.getElementById("formeditorgcnpj").value;
    var description = document.getElementById("formeditorgdescription").value;
    api
      .put(`/organization/${id}`, {
        nome,
        number,
        description,
      })
      .then((result) => {
        window.location.reload(false);
      });
  }

  function deleteOrg(data) {
    api.delete(`/organization/delete/${data}`).then((result) => {
      window.location.reload(false);
    });
  }
  function adduserpaste() {
    var nome = document.getElementById("form30").value;
    var email = document.getElementById("form31").value;
    api.post(`adduser/paste/teste/${nome}/${email}`).then((result) => {
      window.location.reload(false);
    });
  }
  function deleteUser() {
    if (currentOrg.userOrg.length <= 1) {
      document.getElementById("divUser").style.display = "block";
      setTimeout(() => {
        document.getElementById("divUser").style.display = "none";
      }, 3500);
    } else {
      api.delete(`/delete/user/org/${infouser.email}/${currentOrg.id}`);
      window.location.reload(false);
    }
  }
  function adduserOrg() {
    api
      .post(`/add/org/${currentOrg.id}`, {
        cpf: searchCpf,
        nome: search,
        email: searchEmail,
        permission: permission,
      })
      .then((result) => {
        window.location.reload(false);
      });
  }
  function edituserorg() {
    var numsStr = infouser.cpf.replace(/[^0-9]/g, "");
    api
      .post(`/add/org/${currentOrg.id}`, {
        cpf: numsStr,
        nome: infouser.nome,
        email: infouser.email,
        permission: permission,
      })
      .then((result) => {
        window.location.reload(false);
      });
  }

  return loading === true ? (
    <div className="main-container">
      <div className="container-loading">
        <Loading color="#3D92C2" height={80} width={80} />
      </div>
    </div>
  ) : (
    <div className="main-container">
      <div className="row">
        <div className="col col-lg-3">
          <div className="container-organization">
            <div className="container-organization-scroll">
              <div>
                <input
                  type="text"
                  id="searchorg"
                  placeholder="Pesquisar"
                  onKeyUp={() => myFunction2()}
                />
              </div>
              {orgs.map((iten, i) => (
                <div
                  data-toggle="tooltip"
                  data-placement="top"
                  title={iten.description}
                  className="organization-list"
                  key={i}
                  onClick={function () {
                    setLoading2(true);
                    setDisplay(true);
                    api.get(`/user/organization/${iten.id}`).then((result) => {
                      api
                        .get(`/user/organizationDocuments/${iten.id}`)
                        .then((resultDoc) => {
                          setCurrentOrg(result.data);
                          console.log(resultDoc.data);
                          setCurrentOrgDocs(resultDoc.data);
                          api
                            .get(`/user/organization/unique/${iten.id}`)
                            .then((uniqueUser) => {
                              setCurrentUser(uniqueUser.data[0]);
                              setLoading2(false);
                            });
                        });
                    });
                  }}
                >
                  <ul id="searchorgul">
                    <li>
                      <p>{iten.nome}</p>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
            <a href="/" data-toggle="modal" data-target="#modalAdd">
              <img
                data-toggle="tooltip"
                data-placement="top"
                title="criar organização"
                src={addorg}
                alt=""
              />
            </a>
            <div
              className="modal fade"
              id="modalAdd"
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
                    <h5>Adicionar organização</h5>
                    <div className="md-form ml-0 mr-0">
                      <label
                        data-error="wrong"
                        data-success="right"
                        htmlFor="formaddnome"
                        className="ml-0"
                      >
                        nome
                      </label>
                      <input
                        type="text"
                        id="formaddnome"
                        className="form-control form-control-sm validate ml-0"
                      />
                    </div>
                    <div className="md-form ml-0 mr-0">
                      <input
                        type="text"
                        id="formadd"
                        className="form-control form-control-sm validate ml-0"
                        value={cnpjMask(cnpj)}
                        onChange={(e) => processar(e.target.value)}
                      />
                      <label
                        data-error="wrong"
                        data-success="right"
                        htmlFor="formadd"
                        className="ml-0"
                      >
                        cnpj
                      </label>
                    </div>
                    <div className="md-form ml-0 mr-0">
                      <input
                        type="text"
                        id="formaddorgdesc"
                        className="form-control form-control-sm validate ml-0"
                      />
                      <label
                        data-error="wrong"
                        data-success="right"
                        htmlFor="formaddorgdesc"
                        className="ml-0"
                      >
                        descrição
                      </label>
                      <div className="text-center mt-4">
                        <button
                          onClick={() => addOrg()}
                          className="btn btn-cyan mt-1"
                          id="adicionarorg"
                        >
                          adicionar <i className="fas fa-sign-in ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          {display && (
            <div>
              {loading2 === true ? (
                <div className="main-container">
                  <div className="container-loading">
                    <Loading color="#3D92C2" height={80} width={80} />
                  </div>
                </div>
              ) : (
                <div className="container-organization-main">
                  <div className="row">
                    <div className="col">
                      {" "}
                      <div className="header-organization">
                        <h3>
                          {" "}
                          <i className="far fa-building"></i> {currentOrg.nome}{" "}
                          <small> {cnpjMask(currentOrg.number)}</small>
                        </h3>
                      </div>
                    </div>
                    <div className="col">
                      <div className="header-organization-edit">
                        {currentUser.user_organization.permission ===
                        "Admin" ? (
                          <div>
                            {" "}
                            <a
                              href="/"
                              data-toggle="modal"
                              data-target="#modalEdit"
                            >
                              {" "}
                              <img
                                data-toggle="tooltip"
                                data-placement="top"
                                title="editar organização"
                                src={edit}
                                alt=""
                                id="img-delete"
                                className="img-fluid img-delete"
                              />
                            </a>
                            <div
                              className="modal fade"
                              id="modalEdit"
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
                                    <small>
                                      {" "}
                                      <p> editar organização</p>olá{" "}
                                      {currentUser.nome}(
                                      {currentUser.user_organization.permission}
                                      ) edite a organização
                                    </small>

                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgnome"
                                        className="form-control form-control-sm validate ml-0"
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgnome"
                                        className="ml-0"
                                      >
                                        nome
                                      </label>
                                    </div>
                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgcnpj"
                                        className="form-control form-control-sm validate ml-0"
                                        value={cnpjMask(cnpj)}
                                        onChange={(e) =>
                                          processar2(e.target.value)
                                        }
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgcnpj"
                                        className="ml-0"
                                      >
                                        cnpj
                                      </label>
                                    </div>
                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgdescription"
                                        className="form-control form-control-sm validate ml-0"
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgdescription"
                                        className="ml-0"
                                      >
                                        descrição
                                      </label>
                                    </div>

                                    <div className="text-center mt-4">
                                      <button
                                        className="btn btn-cyan mt-1"
                                        id="adicionarnumero"
                                        onClick={() => editOrg(currentOrg.id)}
                                      >
                                        salvar{" "}
                                        <i className="fas fa-sign-in ml-1"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <img
                              data-toggle="modal"
                              data-target="#exampleModal"
                              data-placement="top"
                              title="excluir organização"
                              src={trash}
                              alt=""
                              id="img-delete"
                              className="img-fluid img-delete"
                            />
                            <div
                              class="modal fade"
                              id="exampleModal"
                              tabindex="-1"
                              role="dialog"
                              aria-labelledby="exampleModalLabel"
                              aria-hidden="true"
                            >
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5
                                      class="modal-title"
                                      id="exampleModalLabel"
                                    >
                                      <img src={warning} alt="" /> excluir
                                      organização
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
                                  <small>
                                    {" "}
                                    {currentUser.nome}(
                                    {currentUser.user_organization.permission})
                                  </small>
                                  <div class="modal-body">
                                    <div className="row">
                                      <div className="col">
                                        <small>
                                          {" "}
                                          <p> {currentOrg.nome}</p>{" "}
                                        </small>
                                      </div>
                                      <div className="col">
                                        <small>
                                          {" "}
                                          <p>
                                            {" "}
                                            {cnpjMask(currentOrg.number)}
                                          </p>{" "}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="modal-footer">
                                    <button
                                      type="button"
                                      class="btn btn-danger"
                                      onClick={() => deleteOrg(currentOrg.id)}
                                    >
                                      excluir organização e pastas
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        {currentUser.user_organization.permission ===
                        "Gerente" ? (
                          <div>
                            {" "}
                            <a
                              href="/"
                              data-toggle="modal"
                              data-target="#modalEdit"
                            >
                              {" "}
                              <img
                                data-toggle="tooltip"
                                data-placement="top"
                                title="editar organização"
                                src={edit}
                                alt=""
                                id="img-delete"
                                className="img-fluid img-delete"
                              />
                            </a>
                            <div
                              className="modal fade"
                              id="modalEdit"
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
                                    <small>
                                      {" "}
                                      <p> editar organização</p>olá{" "}
                                      {currentUser.nome}(
                                      {currentUser.user_organization.permission}
                                      ) edite a organização
                                    </small>

                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgnome"
                                        className="form-control form-control-sm validate ml-0"
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgnome"
                                        className="ml-0"
                                      >
                                        nome
                                      </label>
                                    </div>
                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgcnpj"
                                        className="form-control form-control-sm validate ml-0"
                                        value={cnpjMask(cnpj)}
                                        onChange={(e) =>
                                          processar2(e.target.value)
                                        }
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgcnpj"
                                        className="ml-0"
                                      >
                                        cnpj
                                      </label>
                                    </div>
                                    <div className="md-form ml-0 mr-0">
                                      <input
                                        type="text"
                                        id="formeditorgdescription"
                                        className="form-control form-control-sm validate ml-0"
                                      />
                                      <label
                                        data-error="wrong"
                                        data-success="right"
                                        htmlFor="formeditorgdescription"
                                        className="ml-0"
                                      >
                                        descrição
                                      </label>
                                    </div>

                                    <div className="text-center mt-4">
                                      <button
                                        className="btn btn-cyan mt-1"
                                        id="adicionarnumero"
                                        onClick={() => editOrg(currentOrg.id)}
                                      >
                                        salvar{" "}
                                        <i className="fas fa-sign-in ml-1"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="container-organization-docs">
                    <div className="row">
                      <div className="col doc-lenght">
                        <p
                          className="doc-pending-lenght"
                          title="documentos pendentes"
                        >
                          {currentOrgDocs.OrganizationPaste.length}
                        </p>
                        <p
                          className="doc-all-lenght"
                          title="total de documentos"
                        >
                          (
                          {currentOrgDocs.OrganizationPaste.length +
                            currentOrgDocs.OrganizationSigned.length}
                          )
                        </p>
                        <a
                          href={`/dashboard/organization/${hash.encode(
                            currentOrg.id
                          )}`}
                        >
                          <i className="fas fa-file" title="documentos"></i>
                        </a>
                      </div>

                      <div className="col paste-lenght" title="pastas">
                        {currentOrg.OrganizationPastesOrg.length}
                        <a
                          href={`/dashboard/organizationPastas/${hash.encode(
                            currentOrg.id
                          )}`}
                        >
                          <i className="fas fa-folder-open"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <a
                        className="nav-link"
                        id="user-tab"
                        data-toggle="tab"
                        href="#user"
                        role="tab"
                        aria-controls="user"
                        aria-selected="true"
                      >
                        <div className="document-person">
                          {" "}
                          <img src={Person} alt="" />{" "}
                          <p>
                            Usuários com acesso a organização
                            <span className="badge badge-info">
                              {currentOrg.userOrg.length}
                            </span>
                          </p>
                        </div>
                      </a>
                    </li>
                  </ul>
                  {currentUser.user_organization.permission === "Admin" ? (
                    <div>
                      {" "}
                      <a
                        href="/"
                        data-toggle="modal"
                        data-target="#exampleModal2"
                        className="alert-danger"
                      >
                        <img
                          title="adicionar usuário"
                          src={Adduser}
                          alt=""
                          className="img-adduser"
                        />
                      </a>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {currentUser.user_organization.permission === "Gerente" ? (
                    <div>
                      {" "}
                      <a
                        href="/"
                        data-toggle="modal"
                        data-target="#exampleModal2"
                      >
                        <img
                          title="adicionar usuário"
                          src={Adduser}
                          alt=""
                          className="img-adduser"
                        />
                      </a>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  <div
                    class="modal fade"
                    id="exampleModal2"
                    tabindex="-1"
                    role="dialog"
                    aria-labelledby="exampleModalLabel2"
                    aria-hidden="true"
                  >
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="exampleModalLabel2">
                            <img
                              title="adicionar usuário"
                              src={Adduser}
                              alt=""
                              className="img-delete"
                            />{" "}
                            adicionar usuário a organização
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

                        <div class="modal-body">
                          <div className="row">
                            <div className="col">
                              <div className="md-form ml-0 mr-0">
                                <label
                                  data-error="wrong"
                                  data-success="right"
                                  htmlFor="form30"
                                  className="ml-0"
                                >
                                  nome
                                </label>
                                <input
                                  value={search}
                                  type="text"
                                  id="form30"
                                  className="form-control form-control-sm validate ml-0"
                                  onChange={(e) =>
                                    handleCompleteName(e.target.value)
                                  }
                                />
                              </div>
                              {displayautonome && (
                                <div className="container-autocomplete">
                                  {users
                                    .filter(
                                      ({ nome }) =>
                                        nome
                                          .toLowerCase()
                                          .indexOf(search.toLowerCase()) > -1
                                    )
                                    .map((v, i) => (
                                      <div
                                        className="card-autocomplete"
                                        onClick={() =>
                                          handleAutoComplete(
                                            v.nome,
                                            v.cpf,
                                            v.email
                                          )
                                        }
                                        key={i}
                                      >
                                        {" "}
                                        <li>{v.nome}</li>
                                        <li>{cpfMask(v.cpf)}</li>
                                        <li>{v.email}</li>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div className="col">
                              <div className="md-form ml-0 mr-0">
                                <label
                                  data-error="wrong"
                                  data-success="right"
                                  htmlFor="form31"
                                  className="ml-0"
                                >
                                  email
                                </label>
                                <input
                                  value={searchEmail}
                                  type="text"
                                  id="form31"
                                  className="form-control form-control-sm validate ml-0"
                                  onChange={(e) =>
                                    handleCompleteEmail(e.target.value)
                                  }
                                />
                              </div>
                              {displayautoemail && (
                                <div className="container-autocomplete">
                                  {users
                                    .filter(
                                      ({ email }) =>
                                        email
                                          .toLowerCase()
                                          .indexOf(searchEmail.toLowerCase()) >
                                        -1
                                    )
                                    .map((v, i) => (
                                      <div
                                        className="card-autocomplete"
                                        onClick={() =>
                                          handleAutoComplete(
                                            v.nome,
                                            v.cpf,
                                            v.email
                                          )
                                        }
                                        key={i}
                                      >
                                        {" "}
                                        <li>{v.nome}</li>
                                        <li>{cpfMask(v.cpf)}</li>
                                        <li>{v.email}</li>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div className="col">
                              <div className="md-form ml-0 mr-0">
                                <label
                                  data-error="wrong"
                                  data-success="right"
                                  htmlFor="formcpf"
                                  className="ml-0"
                                >
                                  cpf
                                </label>
                                <input
                                  type="text"
                                  id="formcpf"
                                  className="form-control form-control-sm validate ml-0"
                                  value={cpfMask(searchCpf)}
                                  onChange={(e) =>
                                    handleCompleteCpf(e.target.value)
                                  }
                                />
                                {displayCpf && (
                                  <div className="container-autocomplete">
                                    {users
                                      .filter(
                                        ({ cpf }) =>
                                          cpf
                                            .toLowerCase()
                                            .indexOf(
                                              searchCpf.replace(/\D/g, "")
                                            ) > -1
                                      )
                                      .map((v, i) => (
                                        <div
                                          className="card-autocomplete"
                                          onClick={() =>
                                            handleAutoComplete(
                                              v.nome,
                                              v.cpf,
                                              v.email
                                            )
                                          }
                                          key={i}
                                        >
                                          {" "}
                                          <li>{v.nome}</li>
                                          <li>{cpfMask(v.cpf)}</li>
                                          <li>{v.email}</li>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className=" row-modal row ">
                            <div className="col">
                              <input
                                type="radio"
                                id="checkboxTypeSignatario2"
                                name="type"
                                value={"Admin"}
                                onClick={(e) => {
                                  if (
                                    $("#checkboxTypeSignatario2").prop(
                                      "checked",
                                      true
                                    )
                                  ) {
                                    setPermission(e.target.value);
                                    setDisplayDefault(false);
                                    setDisplayManager(false);
                                    setDisplayAdmin(true);
                                  }
                                }}
                              />{" "}
                              <label
                                htmlFor="checkboxTypeSignatario2"
                                className="list-nome-types"
                              >
                                Administrador
                              </label>
                              {displayadmin && (
                                <div>
                                  <ul>
                                    <li>Visualizar organização</li>
                                    <li>Enviar documentos</li>
                                    <li>Visualizar pastas</li>
                                    <li>Gerenciar usuários</li>
                                    <li>Gerenciar organização</li>
                                  </ul>
                                </div>
                              )}
                              {displaydefault && (
                                <div>
                                  {" "}
                                  <ul>
                                    <li>Enviar documentos</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="col">
                              <input
                                type="radio"
                                id="checkboxTypeGerente2"
                                name="type"
                                value={"Gerente"}
                                onClick={(e) => {
                                  if (
                                    $("#checkboxTypeGerente2").prop(
                                      "checked",
                                      true
                                    )
                                  ) {
                                    setPermission(e.target.value);
                                    setDisplayDefault(false);
                                    setDisplayAdmin(false);
                                    setDisplayManager(true);
                                  }
                                }}
                              />{" "}
                              <label
                                htmlFor="checkboxTypeGerente2"
                                className="list-nome-types"
                              >
                                Gerente
                              </label>
                              {displaymanager && (
                                <div>
                                  {" "}
                                  <div>
                                    <ul>
                                      <li>Visualizar organização</li>
                                      <li>Enviar documentos</li>
                                      <li>Visualizar pastas</li>
                                      <li>Gerenciar pastas</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                              {displaydefault && (
                                <div>Visualizar organização</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button
                            id="adicionar"
                            type="button"
                            class="btn btn-warning"
                            onClick={() => adduserOrg()}
                          >
                            adicionar usuário a organização
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="user"
                      role="tabpanel"
                      aria-labelledby="user-tab"
                    >
                      <ul className="list-group list-group-flush">
                        {currentOrg.userOrg.map((iten, i) => (
                          <div>
                            <div
                              class="modal fade"
                              id="exampleModal3"
                              tabindex="-1"
                              role="dialog"
                              aria-labelledby="exampleModalLabel3"
                              aria-hidden="true"
                            >
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5
                                      class="modal-title"
                                      id="exampleModalLabel3"
                                    >
                                      <img src={warning} alt="" /> excluir
                                      usuário
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
                                  <small>
                                    {" "}
                                    {currentUser.nome}(
                                    {currentUser.user_organization.permission})
                                  </small>
                                  <div id="divUser" className="hidden">
                                    {" "}
                                    o último usuário não pode ser excluído
                                  </div>
                                  <div class="modal-body">
                                    <div className="row">
                                      <div className="col">
                                        <small>
                                          {" "}
                                          <p> {infouser.nome}</p>{" "}
                                        </small>
                                      </div>
                                      <div className="col">
                                        <small>
                                          {" "}
                                          <p> {infouser.cpf}</p>{" "}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="modal-footer">
                                    <button
                                      type="button"
                                      class="btn btn-danger"
                                      onClick={() => deleteUser(currentOrg.id)}
                                    >
                                      excluir usuário
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              class="modal fade"
                              id="exampleModalEditUser"
                              tabindex="-1"
                              role="dialog"
                              aria-labelledby="exampleModalCenterTitle"
                              aria-hidden="true"
                            >
                              <div
                                class="modal-dialog modal-dialog-centered"
                                role="document"
                              >
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5
                                      class="modal-title"
                                      id="exampleModalLongTitle"
                                    >
                                      <img
                                        title="adicionar usuário"
                                        src={Adduser}
                                        alt=""
                                        className="img-delete"
                                      />
                                      Editar usuário
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
                                  <div class="modal-body">
                                    <div className="row">
                                      <div className="col">
                                        <p
                                          id="nome-edit"
                                          className="infouseredit"
                                        >
                                          {infouser.nome}
                                        </p>
                                      </div>
                                      <div className="col">
                                        <p
                                          id="cpf-edit"
                                          className="infouseredit"
                                        >
                                          {infouser.cpf}
                                        </p>
                                      </div>
                                      <div className="col">
                                        <p
                                          id="email-edit"
                                          className="infouseredit"
                                        >
                                          {infouser.email}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="row row-modal2">
                                      <div className="col">
                                        <input
                                          type="radio"
                                          id="checkboxTypeSignatario"
                                          name="type"
                                          value={"Admin"}
                                          onClick={(e) => {
                                            if (
                                              $("#checkboxTypeSignatario").prop(
                                                "checked",
                                                true
                                              )
                                            ) {
                                              setPermission(e.target.value);
                                              setDisplayDefault(false);
                                              setDisplayManager(false);
                                              setDisplayAdmin(true);
                                            }
                                          }}
                                        />{" "}
                                        <label
                                          htmlFor="checkboxTypeSignatario"
                                          className="list-nome-types"
                                        >
                                          Administrador
                                        </label>
                                        {displayadmin && (
                                          <div>
                                            <ul>
                                              <li>Visualizar organização</li>
                                              <li>Enviar documentos</li>
                                              <li>Visualizar pastas</li>
                                              <li>Gerenciar usuários</li>
                                              <li>Gerenciar organização</li>
                                            </ul>
                                          </div>
                                        )}
                                        {displaydefault && (
                                          <div>
                                            {" "}
                                            <ul>
                                              <li>Enviar documentos</li>
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                      <div className="col">
                                        <input
                                          type="radio"
                                          id="checkboxTypeGerente"
                                          name="type"
                                          value={"Gerente"}
                                          onClick={(e) => {
                                            if (
                                              $("#checkboxTypeGerente").prop(
                                                "checked",
                                                true
                                              )
                                            ) {
                                              setPermission(e.target.value);
                                              setDisplayDefault(false);
                                              setDisplayAdmin(false);
                                              setDisplayManager(true);
                                            }
                                          }}
                                        />{" "}
                                        <label
                                          htmlFor="checkboxTypeGerente"
                                          className="list-nome-types"
                                        >
                                          Gerente
                                        </label>
                                        {displaymanager && (
                                          <div>
                                            {" "}
                                            <div>
                                              <ul>
                                                <li>Visualizar organização</li>
                                                <li>Enviar documentos</li>
                                                <li>Visualizar pastas</li>
                                                <li>Gerenciar pastas</li>
                                              </ul>
                                            </div>
                                          </div>
                                        )}
                                        {displaydefault && (
                                          <div>Visualizar organização</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div class="modal-footer">
                                    <button
                                      type="button"
                                      class="btn btn-warning"
                                      onClick={() => edituserorg()}
                                    >
                                      SALVAR
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <li
                              className="list-group-item-warning"
                              key={i}
                              onClick={() => setInfouser(iten)}
                            >
                              <div className="container">
                                <div className="row">
                                  <div className="col ">
                                    <small>{iten.nome}</small>
                                  </div>
                                  <div className="col">
                                    <small>{cpfMask(iten.cpf)}</small>
                                  </div>
                                  <div className="col">
                                    <small>{iten.email}</small>
                                  </div>
                                  <div className="col">
                                    {" "}
                                    <small>
                                      {iten.user_organization.permission}
                                    </small>
                                  </div>
                                  <div className="col">
                                    {currentUser.user_organization
                                      .permission === "Admin" ? (
                                      <div>
                                        {" "}
                                        <img
                                          data-toggle="modal"
                                          data-target="#exampleModalEditUser"
                                          data-placement="top"
                                          title="editar usuário"
                                          src={edit}
                                          alt=""
                                          id="img-delete"
                                          className="img-fluid img-delete"
                                        />
                                        <img
                                          data-placement="top"
                                          title="excluir usuário"
                                          data-toggle="modal"
                                          data-target="#exampleModal3"
                                          src={trash}
                                          alt=""
                                          id="img-delete"
                                          className="img-fluid img-delete"
                                        />
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                    {currentUser.user_organization
                                      .permission === "Gerente" &&
                                    iten.user_organization.permission !==
                                      "Admin" ? (
                                      <div>
                                        {" "}
                                        <img
                                          data-toggle="modal"
                                          data-target="#exampleModalEditUser"
                                          data-placement="top"
                                          title="editar usuário"
                                          src={edit}
                                          alt=""
                                          id="img-delete"
                                          className="img-fluid img-delete"
                                        />
                                        <img
                                          data-placement="top"
                                          title="excluir usuário"
                                          data-toggle="modal"
                                          data-target="#exampleModal3"
                                          src={trash}
                                          alt=""
                                          id="img-delete"
                                          className="img-fluid img-delete"
                                        />
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          </div>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Organization;
