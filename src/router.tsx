import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import ConvexHull from "./components/ConvexHull/ConvexHull";
import SweepingLines from "./components/SweepLine/SweepLine";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/convex-hull",
        element: <ConvexHull />,
      },
      {
        path: "/sweep-line",
        element: <SweepingLines />,
      },
    ],
  },
]);

export { router };
