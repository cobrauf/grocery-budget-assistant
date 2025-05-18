import React from "react";
import CartIcon from "./CartIcon";
import { AppTab } from "../../hooks/useAppTab"; // Import AppTab

interface TopBarProps {
  onMenuClick: () => void;
  isShrunk?: boolean; // Added prop to control shrunken state
  activeTab?: AppTab; // Added activeTab prop
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  isShrunk,
  activeTab,
}) => {
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
    height: "30px",
    justifyContent: "center",
    backgroundColor: "var(--theme-header-background, #0071dc)",
    width: "100%",
    display: "flex", // Added for centering content
    alignItems: "center", // Added for vertical centering
    color: "var(--theme-header-text, white)", // Ensure text color is applied
  };

  const menuIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    cursor: "pointer",
    padding: "0.5rem",
  };

  // const menuIconStyleShruken: React.CSSProperties = {
  //   fontSize: "1.5rem",
  //   cursor: "pointer",
  //   padding: "1rem",
  // };

  const shrunkenTitleStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontSize: "1rem",
  };

  if (isShrunk) {
    // Capitalize the first letter of the active tab name for display
    const capitalizedTabName = activeTab
      ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      : "";
    return (
      <div style={shrunkenTopBarStyle}>
        <span style={shrunkenTitleStyle}>{capitalizedTabName}</span>
      </div>
    );
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
