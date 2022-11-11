import { CubeIcon, PauseIcon } from "@heroicons/react/24/outline";
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
      current: pathname === "/convex-hull"
    },
    {
      name: "Sweep Line",
      href: "/sweep-line",
      icon: PauseIcon,
      current: pathname === "/sweep-line"
    }
  ];

  return <RootLayout links={links} />;
}

export default App;
