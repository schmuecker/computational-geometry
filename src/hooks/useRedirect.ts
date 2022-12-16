import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useRedirect = (from: string, to: string) => {
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
