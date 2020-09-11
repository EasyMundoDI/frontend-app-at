import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AuthProvider } from "../src/Context/AuthContext";
import RoutesPrivate from "../src/Routes/Private/Private";
import Dashboard from "../src/pages/Dashboard";
import Register from "../src/pages/Register";
import MainPage from "./MainPage";
import SignIn from "../src/pages/SignIn";
import Certificate from "../src/pages/Certificate";
import Document from "../src/pages/Document";
import Pastes from "../src/pages/Pastes";
import PendingDocument from "../src/pages/PendingDocument";
import EmailVerification from "../src/pages/EmailVerification";
import SignConcluded from "../src/pages/SignConcluded";
import SignInCertificate from "../src/pages/SignInCertificate";
import SignDocument from "../src/pages/SignDocument";
import Organization from "../src/pages/Organization";
import FastSignature from "../src/pages/FastSignature";
import Paste from "../src/pages/Paste";
import PasteOrganization from "../src/pages/PasteOrganization";
import Perfil from "../src/pages/Perfil";
import DocumentsViewer from "../src/pages/DocumentViewer";
import DocumentsStrange from "../src/pages/DocumentStrange";
import DocumentsStrangeSign from "../src/pages/DocumentStrangeSign";
import DocumentsStrangeConclude from "../src/pages/DocumentStrangeConclude";
import OrganizationComponent from "../src/pages/OrganizationComponent";
import ForgetPassword from "../src/pages/ForgetPassword";

const PagesRoot = () => (
  <Router forceRefresh={true}>
    <Route exact path="/" component={MainPage} />
    <Route exact path="/forgot" component={ForgetPassword} />
    <AuthProvider>
      <Switch>
        <Route exact path="/signIn" component={SignIn} />
        <Route exact path="/signincert" component={SignInCertificate} />
        <Route exact path="/register" component={Register} />

        <Route
          exact
          path="/emailverification/:token"
          component={EmailVerification}
        />
        <Route
          exact
          path="/document/:id/:strangeId"
          component={DocumentsStrange}
        />
        <Route
          exact
          path="/document/:id/:strangeId"
          component={DocumentsStrangeSign}
        />
        <Route
          exact
          path="/document/:id/:strangeId/signed"
          component={DocumentsStrangeConclude}
        />
        <RoutesPrivate exact path="/dashboard" component={Dashboard} />
        <RoutesPrivate
          exact
          path="/dashboard/certificate"
          component={Certificate}
        />

        <RoutesPrivate exact path="/dashboard/Profile" component={Perfil} />
        <RoutesPrivate exact path="/dashboard/document" component={Document} />
        <RoutesPrivate
          exact
          path="/dashboard/document/pendingdocument/:id"
          component={PendingDocument}
        />
        <RoutesPrivate
          exact
          path="/dashboard/document/pendingdocument/:id/sign"
          component={SignDocument}
        />
        <RoutesPrivate
          exact
          path="/dashboard/document/signed/:id"
          component={SignConcluded}
        />
        <RoutesPrivate
          exact
          path="/dashboard/documentsViewer"
          component={DocumentsViewer}
        />
        <RoutesPrivate
          exact
          path="/dashboard/fastSignature"
          component={FastSignature}
        />
        <RoutesPrivate exact path="/dashboard/pastas" component={Pastes} />
        <RoutesPrivate exact path="/dashboard/pastas/:id" component={Paste} />
        <RoutesPrivate
          exact
          path="/dashboard/organizationPastas/:id"
          component={PasteOrganization}
        />
        <RoutesPrivate
          exact
          path="/dashboard/organization"
          component={Organization}
        />
        <RoutesPrivate
          exact
          path="/dashboard/organization/:id"
          component={OrganizationComponent}
        />
      </Switch>
    </AuthProvider>
  </Router>
);

export default PagesRoot;
