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
      ? `❤️ Fav (${favoriteItems.length > 99 ? "99+" : favoriteItems.length})`
      : "🤍 Fav"
  }`;

  const navItems: { label: string; tab: AppTab; icon?: string }[] = [
    {
      label:
        activeTab === "browse"
          ? viewMode.browse === "results"
            ? "< Browse"
            : "Browse >"
          : "Browse",
      tab: "browse",
      icon: "",
    },
    {
      label:
        activeTab === "search"
          ? viewMode.search === "results"
            ? "< Search"
            : "Search >"
          : "Search",
      tab: "search",
      icon: "",
    },
    { label: favoritesLabel, tab: "favorites", icon: "" },
    {
      label:
        activeTab === "ai"
          ? viewMode.ai === "results"
            ? "✨ < AI"
            : "✨ AI >"
          : "AI",
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
          {/* <span className="bottom-nav-icon">{item.icon}</span> */}
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
