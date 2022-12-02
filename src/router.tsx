import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import ConvexHull from "./components/ConvexHull/ConvexHull";
import { Newton } from "./components/Newton/Newton";
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
      {
        path: "/newtons-method",
        element: <Newton />,
      },
    ],
  },
]);

export { router };
