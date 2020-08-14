import React from "react";
import Reactloading from "react-loading";

const Loading = ({ color = "#ffff", width = 30, height = 30 }) => (
  <div class="text-center">
    <div class="spinner-grow text-primary" role="status"></div>
  </div>
);

export default Loading;
