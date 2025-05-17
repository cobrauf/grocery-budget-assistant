import React from "react";
import CartIcon from "./CartIcon";

interface TopBarProps {
  onMenuClick: () => void;
  isShrunk?: boolean; // Added prop to control shrunken state
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isShrunk }) => {
  const topBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "var(--theme-header-background, #0071dc)", // Theming placeholder
    color: "var(--theme-header-text, white)", // Theming placeholder
    height: "56px", // Standard app bar height
  };

  const shrunkenTopBarStyle: React.CSSProperties = {
    height: "20px",
    backgroundColor: "var(--theme-header-background, #0071dc)", // Or a different color if preferred
    width: "100%",
  };

  const menuIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    cursor: "pointer",
    padding: "0.5rem",
  };

  if (isShrunk) {
    return <div style={shrunkenTopBarStyle}></div>;
  }

  return (
    <div style={topBarStyle}>
      <span onClick={onMenuClick} style={menuIconStyle} title="Open menu">
        ☰
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Grocery-Assistant
      </span>
      <CartIcon />
    </div>
  );
};

export default TopBar;
