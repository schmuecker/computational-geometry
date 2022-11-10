import { CubeIcon, PauseIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import useRedirect from "./hooks/useRedirect";

import RootLayout from "./components/RootLayout/RootLayout";

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

  return <RootLayout links={links} />;
}

export default App;
