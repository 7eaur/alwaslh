import React from "react";
import ReactDOM from "react-dom/client";
import "@alwaslh/brand/tokens.css";
import "./styles.css";
import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Student root element was not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
