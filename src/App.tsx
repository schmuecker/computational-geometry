import {
  CubeIcon,
  PauseIcon,
  VariableIcon,
  QrCodeIcon,
  ChartPieIcon,
  MapIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import useRedirect from "./hooks/useRedirect";

import RootLayout from "./components/RootLayout/RootLayout";
import { Link } from "./types/Link";

function App() {
  useRedirect("/", "/convex-hull");
  const { pathname } = useLocation();

  const links: Link[] = [
    {
      name: "Convex Hull",
      href: "/convex-hull",
      icon: CubeIcon,
      current: pathname === "/convex-hull",
    },
    {
      name: "Sweep Line",
      href: "/sweep-line",
      icon: PauseIcon,
      current: pathname === "/sweep-line",
    },
    {
      name: "Newton's Method ",
      href: "/newtons-method",
      icon: VariableIcon,
      current: pathname === "/newtons-method",
      hardRefresh: true,
    },
    {
      name: "2D-Trees ",
      href: "/2d-trees",
      icon: QrCodeIcon,
      current: pathname === "/2d-trees",
    },
    {
      name: "Monotone Triangulation",
      href: "/monotone-triangulation",
      icon: MapIcon,
      current: pathname === "/monotone-triangulation",
    },
    {
      name: "Delaunay Triangulation ",
      href: "/delaunay",
      icon: GlobeAltIcon,
      current: pathname === "/delaunay",
    },
  ];

  return <RootLayout links={links} />;
}

export default App;
