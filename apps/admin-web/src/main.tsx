import React from "react";
import ReactDOM from "react-dom/client";
import "@alwaslh/brand/tokens.css";
import "@alwaslh/ui/styles.css";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import "./content-ingestion.css";
import "./foundation.css";
import "./admin-shell.css";
import { AdminRouter } from "./router";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Admin root element was not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminRouter />
    </BrowserRouter>
  </React.StrictMode>,
);
