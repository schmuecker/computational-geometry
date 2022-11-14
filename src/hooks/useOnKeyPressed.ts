import { useEffect } from "react";
import useKeyPress from "./useKeyPress";

function onKeyPressed(key: string, callback: () => void) {
  const escapePressed = useKeyPress(key);
  useEffect(() => {
    if (escapePressed) {
      callback();
    }
  }, [escapePressed]);
}

export default onKeyPressed;
