import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./AppRouter.tsx";
import "./index.css";
import AppLoader from "./components/AppLoader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppLoader>
      <App />
    </AppLoader>
  </StrictMode>
);