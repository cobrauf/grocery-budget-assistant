import React from "react";
import { AppTab, ViewMode } from "../../hooks/useAppTab"; // Ensure correct path
import "../../styles/BottomNav.css"; // Updated path for CSS
import { Product } from "../../types/product";

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  areNavBarsVisible: boolean;
  favoriteItems: Product[]; // Add favorites count
  viewMode: Record<"browse" | "search" | "ai", ViewMode>; // Add viewMode
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  areNavBarsVisible,
  favoriteItems,
  viewMode, // Destructure viewMode
}) => {
  // Create dynamic label for favorites that includes the count
  const favoritesLabel = `${
    favoriteItems.length > 0
      ? `Favs (${favoriteItems.length > 99 ? "99+" : favoriteItems.length})`
      : "Favs"
    // ? `❤️ Fav (${favoriteItems.length > 99 ? "99+" : favoriteItems.length})`
    // : "🤍 Fav"
  }`;

  const navItems: { label: string; tab: AppTab; icon?: string }[] = [
    {
      label:
        activeTab === "browse"
          ? viewMode.browse === "results"
            ? "Browse"
            : "Browse"
          : "Browse",
      tab: "browse",
      icon: "",
    },
    {
      label:
        activeTab === "search"
          ? viewMode.search === "results"
            ? "Search"
            : "Search"
          : "Search",
      tab: "search",
      icon: "",
    },
    { label: favoritesLabel, tab: "favorites", icon: "" },
    {
      label:
        activeTab === "ai"
          ? viewMode.ai === "results"
            ? "Chat AI"
            : "Chat AI"
          : "Chat AI",
      tab: "ai",
      icon: "",
    },
  ];

  return (
    <nav
      className={`bottom-nav ${
        !areNavBarsVisible ? "bottom-nav-hidden" : ""
      }`.trim()}
    >
      {navItems.map((item) => (
        <button
          key={item.tab}
          className={`bottom-nav-item ${
            activeTab === item.tab ? "active" : ""
          }`}
          onClick={() => setActiveTab(item.tab)}
        >
          {/* Toggle indicator for browse, search, and ai tabs */}
          {(item.tab === "browse" ||
            item.tab === "search" ||
            item.tab === "ai") &&
            activeTab === item.tab && (
              <div className="tab-toggle-indicator">
                <div
                  className={`toggle-switch ${
                    viewMode[item.tab] === "results"
                      ? "toggle-right"
                      : "toggle-left"
                  }`}
                >
                  <div className="toggle-dot"></div>
                </div>
              </div>
            )}
          {/* <span className="bottom-nav-icon">{item.icon}</span> */}
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
