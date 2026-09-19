import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";
import { useAppStore } from "./store/useAppStore";

function AppToaster() {
  const theme = useAppStore((state) => state.theme);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return (
    <Toaster
      closeButton
      position={isMobile ? "top-center" : "bottom-left"}
      richColors
      theme={theme}
      toastOptions={{
        classNames: {
          toast: "!border-retronexo-border !bg-retronexo-grey-300 !text-retronexo-white",
          title: "!text-retronexo-white",
          description: "!text-retronexo-grey-100",
        },
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <AppToaster />
    </BrowserRouter>
  </StrictMode>,
);
