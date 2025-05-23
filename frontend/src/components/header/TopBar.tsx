import React from "react";
import CartIcon from "./CartIcon";
import { AppTab } from "../../hooks/useAppTab"; // Import AppTab

interface TopBarProps {
  onMenuClick: () => void;
  isShrunk?: boolean;
  activeTab?: AppTab;
  onGoHome?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  isShrunk,
  activeTab,
  onGoHome,
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
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 0.5rem",
    backgroundColor: "var(--theme-header-background, #0071dc)",
    width: "100%",
    color: "var(--theme-header-text, white)",
  };

  const menuIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    cursor: "pointer",
    padding: "0.5rem",
    flexShrink: 0, // Prevent shrinking
  };

  const shrunkenHomeIconStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "0.25rem",
    flexShrink: 0,
  };

  const shrunkenTitleStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontSize: "1rem",
    flexGrow: 1,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  if (isShrunk) {
    // Capitalize the first letter of the active tab name for display
    const capitalizedTabName = activeTab
      ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      : "";
    return (
      <div style={shrunkenTopBarStyle}>
        {onGoHome && (
          <span
            onClick={onGoHome}
            style={shrunkenHomeIconStyle}
            title="Go Home"
          >
            🏠
          </span>
        )}
        <span style={shrunkenTitleStyle}>{capitalizedTabName}</span>
        <span style={{ minWidth: "24px" }} />
      </div>
    );
  }

  return (
    <div style={topBarStyle}>
      <span onClick={onMenuClick} style={menuIconStyle} title="Open menu">
        ☰
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Grocery-Buddy
      </span>
      <CartIcon />
    </div>
  );
};

export default TopBar;
