import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    Authorization: localStorage.getItem("@tokenAuth"),
  },
});

export default api;
