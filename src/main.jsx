import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { DriverProvider } from "./context/DriverContext";
import { ErrorBoundary } from "./ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <DriverProvider>
       <App />
    </DriverProvider>
  </ErrorBoundary>
);