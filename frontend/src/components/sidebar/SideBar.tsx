import React, { useState, useEffect } from "react";
import ThemeSelector from "./ThemeSelector";
import FontSelector from "./FontSelector";
import { availableFonts } from "../../styles/fonts";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeName: string;
  onSelectTheme: (themeName: string) => void;
  currentFont: (typeof availableFonts)[0];
  onSelectFont: (font: (typeof availableFonts)[0]) => void;
}

const SideBar: React.FC<SideBarProps> = ({
  isOpen,
  onClose,
  currentThemeName,
  onSelectTheme,
  currentFont,
  onSelectFont,
}) => {
  const [isThemesExpanded, setIsThemesExpanded] = useState(false);
  const [isFontsExpanded, setIsFontsExpanded] = useState(false);

  // When sidebar closes, reset themes expansion
  useEffect(() => {
    if (!isOpen) {
      setIsThemesExpanded(false);
      setIsFontsExpanded(false);
    }
  }, [isOpen]);

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: isOpen ? "0" : "-300px",
    width: "200px",
    height: "100%",
    backgroundColor: "var(--theme-sidebar-background, #2c3e50)",
    color: "var(--theme-sidebar-text, white)",
    boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
    padding: "1rem",
    zIndex: 1050,
    transition:
      "left .5s ease-in-out, background-color .5s ease, color 0.5s ease",
    overflowY: "auto",
    display: "flex", // For easier spacing of logo/close and content
    flexDirection: "column",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
  };

  const closeButtonStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    color: "var(--theme-sidebar-text, white)",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "color 0.3s ease",
  };

  const navStyle: React.CSSProperties = {
    flexGrow: 1,
  };

  const menuItemStyle: React.CSSProperties = {
    padding: "0.75rem 0",
    fontSize: "1.1rem",
    cursor: "pointer",
    borderBottom: "1px solid var(--theme-sidebar-divider, #34495e)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "border-color 0.3s ease",
  };

  const lastMenuItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    borderBottom: "none",
  };

  const subMenuContainerStyle: React.CSSProperties = {
    paddingLeft: "1rem",
    maxHeight: isThemesExpanded ? "500px" : "0", // Control expansion
    overflow: "hidden",
    transition: "max-height 0.3s ease-in-out", // Animate expansion
  };

  //   const subMenuItemStyle: React.CSSProperties = {
  //     padding: "0.5rem 0",
  //     fontSize: "1rem",
  //     cursor: "pointer",
  //   };

  // Placeholder for animation, not fully implemented yet
  //   const itemAnimationStyle = (index: number) => ({
  //     animation: isOpen
  //       ? `slideInFromLeft 0.5s ease-out ${index * 0.1}s forwards`
  //       : "none",
  //     opacity: isOpen ? 0 : 1, // Start transparent for animation
  //     transform: isOpen ? "translateX(-20px)" : "translateX(0)",
  //   });

  const menuItems = [
    {
      name: "Themes",
      action: () => setIsThemesExpanded(!isThemesExpanded),
      expandable: true,
    },
    {
      name: "Fonts",
      action: () => setIsFontsExpanded(!isFontsExpanded),
      expandable: true,
    },
    { name: "Settings", action: () => console.log("Settings clicked") },
    { name: "User", action: () => console.log("User clicked") },
  ];

  if (!isOpen && !document.body.classList.contains("sidebar-was-open")) {
    // Optimization: Don't render if never opened or fully closed and animation ended.
    // This needs a way to track if it *was* open to allow animation out.
    // A simpler approach is to always render and control with left position.
    // For now, always render to handle animation correctly. //TODO
  }

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <span style={logoStyle}> ☰ </span> {/* Or your app logo/name */}
        <button onClick={onClose} style={closeButtonStyle} title="Close menu">
          ✕
        </button>
      </div>
      <nav style={navStyle}>
        {menuItems.map((item, index) => (
          <div
            key={item.name}
            className={isOpen ? "sidebar-nav-item-animate" : ""} // Apply class for animation
            style={{
              animationName: isOpen ? "slideInFromLeftNavItems" : "none",
              animationDuration: "0.5s",
              animationDelay: isOpen ? `${index * 0.3}s` : "0s", // Staggered delay
            }}
          >
            <div
              style={
                index === menuItems.length - 1
                  ? lastMenuItemStyle
                  : menuItemStyle
              }
              onClick={item.action}
            >
              {item.name}
              {item.expandable && (
                <span>
                  {(item.name === "Themes" && isThemesExpanded) ||
                  (item.name === "Fonts" && isFontsExpanded)
                    ? "▲"
                    : "▼"}
                </span>
              )}
            </div>
            {item.name === "Themes" && (
              <div
                style={{
                  ...subMenuContainerStyle,
                  maxHeight: isThemesExpanded ? "500px" : "0",
                }}
              >
                <ThemeSelector
                  currentThemeName={currentThemeName}
                  onSelectTheme={onSelectTheme}
                />
              </div>
            )}
            {item.name === "Fonts" && (
              <div
                style={{
                  ...subMenuContainerStyle,
                  maxHeight: isFontsExpanded ? "500px" : "0",
                }}
              >
                <FontSelector
                  currentFont={currentFont}
                  onSelectFont={onSelectFont}
                />
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;

/* Basic CSS for slide-in (can be moved to App.css or component CSS) */
/* @keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
} */
