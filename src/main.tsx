import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ConvexHull from "./components/ConvexHull/ConvexHull";
import SweepingLines from "./components/SweepingLines/SweepingLines";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="convex-hull" element={<ConvexHull />} />
          <Route path="sweeping-lines" element={<SweepingLines />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
