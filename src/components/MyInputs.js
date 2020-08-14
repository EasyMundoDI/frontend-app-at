import React, { useEffect, useRef } from "react";
import { useField } from "@unform/core";

export default function MyInputs({ name, ...rest }) {
  const { fieldName, registerField, defaultValue, error } = useField(name);
  const inputRef = useRef(null);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "value",
    });
  }, [fieldName, registerField]);

  return (
    <div>
      <div className="form__group field">
        <input
          type="input"
          className="form__field"
          placeholder={fieldName}
          required
          ref={inputRef}
          defaultValue={defaultValue}
          {...rest}
        />
        {error && <span style={{ color: "#f00" }}>{error}</span>}
        <label htmlFor={fieldName} className="form__label">
          {fieldName}
        </label>
      </div>
    </div>
  );
}
