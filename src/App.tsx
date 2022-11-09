import { CubeIcon, PauseIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import useRedirect from "./assets/hooks/useRedirect";

import Layout from "./components/Layout/Layout";

function App() {
  useRedirect("/", "/convex-hull");
  const { pathname } = useLocation();

  const links = [
    {
      name: "Convex Hull",
      href: "/convex-hull",
      icon: CubeIcon,
      current: pathname === "/convex-hull",
    },
    {
      name: "Sweeping Lines",
      href: "/sweeping-lines",
      icon: PauseIcon,
      current: pathname === "/sweeping-lines",
    },
  ];

  return <Layout links={links} />;
}

export default App;
