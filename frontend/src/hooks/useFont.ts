import { useEffect } from "react";
import { currentFont } from "../styles/fonts";

export const useFont = () => {
  useEffect(() => {
    // Set CSS custom property for the font family
    document.documentElement.style.setProperty(
      "--current-font-family",
      currentFont.family
    );
  }, []);

  return currentFont;
};
