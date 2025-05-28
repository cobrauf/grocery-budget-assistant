import React, { useState, useEffect } from "react";
import ThemeSelector from "./ThemeSelector";
import FontSelector from "./FontSelector";
import { availableFonts } from "../../styles/fonts";
import "../../styles/SideBar.css"; // Import the CSS file

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeName: string;
  onSelectTheme: (themeName: string) => void;
  currentFont: (typeof availableFonts)[0];
  onSelectFont: (font: (typeof availableFonts)[0]) => void;
  onGoHome?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  isOpen,
  onClose,
  currentThemeName,
  onSelectTheme,
  currentFont,
  onSelectFont,
  onGoHome,
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

  const menuItems = [
    {
      name: "Home",
      action: () => {
        if (onGoHome) onGoHome();
        onClose();
      },
      expandable: false,
    },
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
    // { name: "Settings", action: () => console.log("Settings clicked") },
    // { name: "User", action: () => console.log("User clicked") },
  ];

  if (!isOpen && !document.body.classList.contains("sidebar-was-open")) {
    // Optimization: Don't render if never opened or fully closed and animation ended.
    // This needs a way to track if it *was* open to allow animation out.
    // A simpler approach is to always render and control with left position.
    // For now, always render to handle animation correctly. //TODO
  }

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo"> </span> {/* Or your app logo/name */}
        <button
          onClick={onClose}
          className="sidebar-close-button"
          title="Close menu"
        >
          ✕
        </button>
      </div>
      <nav className="sidebar-nav">
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
              className={
                index === menuItems.length - 1
                  ? "sidebar-menu-item sidebar-menu-item-last"
                  : "sidebar-menu-item"
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
                className="sidebar-submenu-container"
                style={{
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
                className="sidebar-submenu-container"
                style={{
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
