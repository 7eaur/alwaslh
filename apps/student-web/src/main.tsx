import React from "react";
import ReactDOM from "react-dom/client";
import "@alwaslh/brand/tokens.css";
import "@alwaslh/ui/styles.css";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import "./student-shell.css";
import "./student-learning.css";
import "./foundation.css";
import "./assessment-integration.css";
import "./student-entry.css";
import "./student-session.css";
import "./student-library-account.css";
import { registerStudentServiceWorker } from "./pwa";
import { StudentRouter } from "./router";

const root = document.getElementById("root");
if (!root) throw new Error("Student root element was not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudentRouter />
    </BrowserRouter>
  </React.StrictMode>,
);

void registerStudentServiceWorker().catch(() => undefined);
