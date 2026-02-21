import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "react-snackify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SnackbarProvider globalPosition="bottom-center">
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </StrictMode>,
);
