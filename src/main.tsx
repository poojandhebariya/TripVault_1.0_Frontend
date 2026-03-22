import { StrictMode, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "react-snackify";
import AppSplash from "./components/splash-screen.tsx";

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleFinish = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <AppSplash visible={showSplash} onFinish={handleFinish} />
      <BrowserRouter>
        <SnackbarProvider globalPosition="bottom-center">
          <App />
        </SnackbarProvider>
      </BrowserRouter>
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
