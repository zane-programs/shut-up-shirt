import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";

import "normalize.css";

import App from "./app";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
