import React from "react";
import { themes, Theme } from "../../styles/themes";

interface ThemeSelectorProps {
  currentThemeName: string;
  onSelectTheme: (themeName: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeName,
  onSelectTheme,
}) => {
  const itemStyle = (themeName: string): React.CSSProperties => ({
    padding: "0.5rem 0",
    fontSize: "1rem",
    cursor: "pointer",
    color:
      themeName === currentThemeName
        ? "var(--theme-sidebar-highlight, #3498db)"
        : "var(--theme-sidebar-text, white)",
    fontWeight: themeName === currentThemeName ? "bold" : "normal",
    borderLeft:
      themeName === currentThemeName
        ? "3px solid var(--theme-sidebar-highlight, #3498db)"
        : "3px solid transparent",
    paddingLeft: themeName === currentThemeName ? "calc(1rem - 3px)" : "1rem",
  });

  return (
    <div>
      {themes.map((theme: Theme) => (
        <div
          key={theme.name}
          style={itemStyle(theme.name)}
          onClick={() => onSelectTheme(theme.name)}
        >
          {theme.name}
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
