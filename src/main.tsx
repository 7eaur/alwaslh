import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

try {
  const container = document.getElementById("root");
  if (!container) throw new Error("Root element not found");
  
  createRoot(container).render(
    <StrictMode>
      <AppWrapper>
        <App />
      </AppWrapper>
    </StrictMode>
  );
} catch (e: any) {
  console.error("Critical Render Error:", e);
  if (typeof (window as any).__showError === 'function') {
    (window as any).__showError("فشل تشغيل التطبيق (Render Error)", e.message);
  }
}

