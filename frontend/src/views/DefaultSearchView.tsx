import React from "react";

const DefaultSearchView: React.FC = () => {
  const viewStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%" /* Take full available height within MainContent */,
    textAlign: "center",
    padding: "20px",
    color: "var(--theme-text, #333)",
  };

  const pStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    color: "var(--theme-secondary, #6c757d)",
  };

  return (
    <div style={viewStyle}>
      <p style={pStyle}>Search for items using the search bar above.</p>
      {/* You can add a search icon or other relevant graphics here */}
    </div>
  );
};

export default DefaultSearchView;
