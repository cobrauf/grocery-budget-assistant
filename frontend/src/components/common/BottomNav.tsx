import React from "react";
import { useAppTab, AppTab } from "../../hooks/useAppTab"; // Adjust path as necessary
import "./BottomNav.css"; // We'll create this for styling

const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAppTab();

  const navItems: { label: string; tab: AppTab; icon?: string }[] = [
    { label: "Browse", tab: "browse", icon: "🔍" }, // Placeholder icons
    { label: "Search", tab: "search", icon: "📄" },
    { label: "AI (WIP)", tab: "ai", icon: "🤖" },
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
