import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import useRedirect from "./assets/hooks/useRedirect";

import Layout from "./components/Layout/Layout";

const links = [
  { name: "Convex Hull", href: "/convex-hull", icon: HomeIcon },
  {
    name: "Sweeping Lines",
    href: "/sweeping-lines",
    icon: Squares2X2Icon,
  },
];

function App() {
  useRedirect("/", "/convex-hull");

  return <Layout links={links} />;
}

export default App;
