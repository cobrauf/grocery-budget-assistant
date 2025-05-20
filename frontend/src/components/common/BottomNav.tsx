import React from "react";
import { AppTab } from "../../hooks/useAppTab"; // Ensure correct path
import "../../styles/BottomNav.css"; // Updated path for CSS
import { Product } from "../../types/product";

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  areNavBarsVisible: boolean;
  favoriteItems: Product[]; // Add favorites count
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  areNavBarsVisible,
  favoriteItems,
}) => {
  // Create dynamic label for favorites that includes the count
  const favoritesLabel = `❤️ Favs${
    favoriteItems.length > 0
      ? ` (${favoriteItems.length > 99 ? "99+" : favoriteItems.length})`
      : ""
  }`;

  const navItems: { label: string; tab: AppTab; icon?: string }[] = [
    { label: "🛒 Browse", tab: "browse", icon: "" },
    { label: "🔍 Search", tab: "search", icon: "" },
    { label: favoritesLabel, tab: "favorites", icon: "" },
    { label: "✨ AI (WIP)", tab: "ai", icon: "" },
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
          {/* <span className="bottom-nav-icon">{item.icon}</span> */}
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
