import { useState, useEffect } from "react";
import { themes, Theme, DEFAULT_THEME_NAME } from "../styles/themes";
import { availableFonts, Font } from "../styles/fonts";

export const useThemeManager = () => {
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem("appTheme") || DEFAULT_THEME_NAME;
  });

  const [currentFont, setCurrentFont] = useState<Font>(() => {
    const savedFont = localStorage.getItem("appFont");
    return savedFont ? JSON.parse(savedFont) : availableFonts[0];
  });

  // Update font in localStorage and CSS when it changes
  useEffect(() => {
    localStorage.setItem("appFont", JSON.stringify(currentFont));
    document.documentElement.style.setProperty(
      "--current-font-family",
      currentFont.family
    );
  }, [currentFont]);

  // Apply theme colors as CSS variables to body
  useEffect(() => {
    const selectedTheme =
      themes.find((t) => t.name === currentThemeName) ||
      themes.find((t) => t.name === DEFAULT_THEME_NAME);
    if (selectedTheme) {
      localStorage.setItem("appTheme", selectedTheme.name);
      const root = document.documentElement; // Or document.body
      // Example: root.style.setProperty('--theme-background', selectedTheme.colors.background);
      // More robust: Iterate over theme colors
      for (const [key, value] of Object.entries(selectedTheme.colors)) {
        const cssVarName = `--theme-${key
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      }
    }
  }, [currentThemeName]);

  return {
    currentThemeName,
    setCurrentThemeName,
    currentFont,
    setCurrentFont,
  };
};
