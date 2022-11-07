import {
  Bars3BottomLeftIcon,
  CogIcon,
  HomeIcon,
  PhotoIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ConvexHull from "./components/ConvexHull/ConvexHull";
import Layout from "./components/Layout/Layout";

const links = [
  { name: "Home", href: "/convex-hull", icon: HomeIcon, current: false },
  { name: "Convex Hull", href: "/convex-hull", icon: HomeIcon, current: false },
  {
    name: "Sweeping Lines",
    href: "/sweeping-lines",
    icon: Squares2X2Icon,
    current: false,
  },
];

function App() {
  return <Layout links={links} />;
}

export default App;
