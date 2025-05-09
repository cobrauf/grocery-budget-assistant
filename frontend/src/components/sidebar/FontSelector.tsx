import React from "react";
import { availableFonts } from "../../styles/fonts";

interface FontSelectorProps {
  currentFont: {
    name: string;
    family: string;
    style: string;
  };
  onSelectFont: (font: (typeof availableFonts)[0]) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  currentFont,
  onSelectFont,
}) => {
  const fontItemStyle: React.CSSProperties = {
    padding: "0.5rem",
    cursor: "pointer",
    borderRadius: "4px",
    marginBottom: "0.5rem",
    backgroundColor:
      "var(--theme-sidebar-item-background, rgba(255,255,255,0.1))",
    transition: "background-color 0.3s ease",
  };

  const selectedFontStyle: React.CSSProperties = {
    ...fontItemStyle,
    backgroundColor: "var(--theme-primary, #3498db)",
  };

  return (
    <div>
      {availableFonts.map((font) => (
        <div
          key={font.name}
          style={
            font.name === currentFont.name ? selectedFontStyle : fontItemStyle
          }
          onClick={() => onSelectFont(font)}
        >
          <div style={{ fontFamily: font.family }}>{font.name}</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{font.style}</div>
        </div>
      ))}
    </div>
  );
};

export default FontSelector;
