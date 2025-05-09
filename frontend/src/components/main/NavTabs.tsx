import React from "react";

const NavTabs = () => {
  const tabs = ["Mother's Day", "Dinner Solutions", "Pharmacy Delivery"];

  const navTabsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-around",
    padding: "0.75rem 0.5rem",
    backgroundColor: "#f8f8f8",
    borderBottom: "1px solid #e0e0e0",
  };

  const tabStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "#333",
    padding: "0.5rem",
    cursor: "pointer",
    borderBottom: "2px solid transparent", // For active state later
  };

  // Example: Make the first tab appear active for now
  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: "#0071dc", // Walmart blue
    // borderBottom: '2px solid #0071dc', // Indication of active tab
  };

  return (
    <div style={navTabsStyle}>
      {tabs.map((tab, index) => (
        <span key={tab} style={index === 0 ? activeTabStyle : tabStyle}>
          {tab}
        </span>
      ))}
    </div>
  );
};

export default NavTabs;
