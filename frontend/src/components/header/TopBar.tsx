import React from "react";
import CartIcon from "./CartIcon";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const topBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "var(--theme-header-background, #0071dc)", // Theming placeholder
    color: "var(--theme-header-text, white)", // Theming placeholder
    height: "56px", // Standard app bar height
  };

  const logoStyle: React.CSSProperties = {
    height: "30px", // Placeholder for logo, adjust as needed
    width: "auto",
  };

  const greetingStyle: React.CSSProperties = {
    fontSize: "0.9rem",
  };

  const menuIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    cursor: "pointer",
    padding: "0.5rem",
  };

  return (
    <div style={topBarStyle}>
      <span onClick={onMenuClick} style={menuIconStyle} title="Open menu">
        ☰
      </span>
      {/* Using a text placeholder for the logo for now */}
      {/* <img src="https://via.placeholder.com/100x30?text=Walmart" alt="Walmart Logo" style={logoStyle} /> */}
      <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Grocery-Assistant
      </span>
      <CartIcon />
    </div>
  );
};

export default TopBar;
