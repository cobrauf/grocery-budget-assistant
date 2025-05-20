import React from "react";
import { AppTab } from "../../hooks/useAppTab"; // Ensure correct path
import "../../styles/BottomNav.css"; // Updated path for CSS

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { label: string; tab: AppTab; icon?: string }[] = [
    { label: "Browse", tab: "browse", icon: "🛒" },
    { label: "Search", tab: "search", icon: "🔍" },
    { label: "AI (WIP)", tab: "ai", icon: "✨" },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.tab}
          className={`bottom-nav-item ${
            activeTab === item.tab ? "active" : ""
          }`}
          onClick={() => setActiveTab(item.tab)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
