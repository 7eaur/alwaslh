import React from "react";
import ReactDOM from "react-dom/client";
import "@alwaslh/brand/tokens.css";
import "@alwaslh/ui/styles.css";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import "./stage14.css";
import "./student-shell.css";
import "./student-learning.css";
import "./foundation.css";
import { registerStudentServiceWorker } from "./pwa";
import { StudentRouter } from "./router";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Student root element was not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudentRouter />
    </BrowserRouter>
  </React.StrictMode>,
);

void registerStudentServiceWorker().catch(() => undefined);
