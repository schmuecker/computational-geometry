import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../types/Path";

const useRedirect = (from: Path, to: Path) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  useEffect(() => {
    if (pathname === from) {
      navigate(to);
    }
  }, []);
};

export default useRedirect;
