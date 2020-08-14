import React from "react";
import "../styles/styles.css";

function Alert(...props) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="alert alert-dismissable alert-danger">
            <button
              type="button"
              className="close"
              data-dismiss="alert"
              aria-hidden="true"
            >
              ×
            </button>
            <h4>{props.title}</h4> <strong>{props.nome}</strong>
            {props.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alert;
