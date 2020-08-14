import React from "react";
import { useHistory } from "react-router-dom";

import logo from "./images/logo_branca.png";
import world from "./images/world.png";
import facebook from "./images/facebook.png";
import instagran from "./images/instagram-sketched.png";

function App() {
  const history = useHistory();

  function gotoLogin() {
    history.push("/signin");
  }

  return (
    <div>
      <div class="preloader">
        <div class="sk-spinner sk-spinner-pulse"></div>
      </div>

      <section id="home">
        <div class="overlay"></div>
        <div class="container">
          <div class="row">
            <div
              class="col-md-offset-1 col-md-10 col-sm-12 wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <h1 class="wow fadeInUp" data-wow-delay="0.6s">
                <img src={world} alt="" /> easydoc MundoDigital
              </h1>
              <p class="wow fadeInUp" data-wow-delay="0.9s">
                Organize os documentos de sua empresa e colete assinaturas com o
                sistema mais rápido e intuitivo do mercado. Organize os
                documentos de sua empresa e colete assinaturas com o sistema
                mais rápido e intuitivo do mercado.
              </p>
              <a
                href="/signin"
                class="smoothScroll btn btn-primary btn-lg wow fadeInUp"
                data-wow-delay="1.2s"
              >
                login
              </a>
              <a
                href="#about"
                class="smoothScroll btn btn-primary btn-lg wow fadeInUp"
                data-wow-delay="1.2s"
              >
                validar documento
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <div class="container">
          <div class="row">
            <div class="col-md-9 col-sm-8 wow fadeInUp" data-wow-delay="0.9s">
              <div class="about-thumb">
                <h1>MundoDigital certificadora digital</h1>
                <p>
                  Quisque tempor bibendum dolor at volutpat. Suspendisse
                  venenatis quam sed libero euismod feugiat. In cursus nisi
                  vitae lectus facilisis mollis. Nullam scelerisque, quam nec
                  iaculis vulputate.
                </p>
              </div>
            </div>

            <div
              class="col-md-3 col-sm-4 wow fadeInUp about-img"
              data-wow-delay="0.6s"
            >
              <img
                src="images/logo_world.png"
                class="img-responsive img-circle"
                alt="About"
              />
            </div>

            <div class="clearfix"></div>

            <div class="col-md-12 col-sm-12 wow fadeInUp" data-wow-delay="0.3s">
              <div class="section-title text-center">
                <h3>Organize seus documentos</h3>
                <h5>
                  Design intuitivo, Acesso seguro e assinaturas de acordo com as
                  normas estipuladas pela ICP Brasil garantindo validade
                  jurírica a seus documentos.
                </h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact">
        <div class="container">
          <div class="row">
            <div class="col-md-offset-1 col-md-10 col-sm-12">
              <div
                class="col-lg-offset-1 col-lg-10  wow fadeInUp"
                data-wow-delay="0.4s"
              >
                <h1>Entre em contato</h1>
                <p>entre em contato conosco pelas nossas redes sociais . </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="footer-main">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12">
              <ul class="social-icon">
                <li>
                  <a href="/" data-wow-delay="0.6s">
                    <img src={facebook} alt="" className="" />
                  </a>
                </li>
                <li>
                  <a href="/" data-wow-delay="0.8s">
                    <img src={instagran} alt="" />
                  </a>
                </li>
              </ul>

              <p className="copyright">
                {" "}
                <img src={logo} alt="" srcSet="" /> © 2020 - Todos os direitos
                reservados
              </p>
            </div>
          </div>
        </div>
      </div>

      <a href="#" class="go-top">
        <i class="fa fa-angle-up"></i>
      </a>
    </div>
  );
}

export default App;
