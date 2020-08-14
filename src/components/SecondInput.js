import React, { useEffect, useRef } from "react";
import { useField } from "@unform/core";

export default function SecondInput({ name, ...rest }) {
  const { fieldName, registerField, defaultValue, error } = useField(name);
  const inputRef = useRef(null);
  console.log(error);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "value",
    });
  }, [fieldName, registerField]);

  return (
    <div>
      <input
        type="input"
        required
        ref={inputRef}
        defaultValue={defaultValue}
        {...rest}
      />
      {error && <span style={{ color: "#f00" }}>{error}</span>}
    </div>
  );
}
