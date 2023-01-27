import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import ConvexHull from "./components/ConvexHull/ConvexHull";
import Delauny from "./components/DelaunyTriangulation/Delauny";
import Newton from "./components/Newton/Newton";
import SweepingLines from "./components/SweepLine/SweepLine";
import TwoDTrees from "./components/TwoDTrees/TwoDTrees";

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
      {
        path: "/2d-trees",
        element: <TwoDTrees />,
      },
      {
        path: "/delauny",
        element: <Delauny />,
      },
    ],
  },
]);

export { router };
