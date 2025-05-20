import React from "react";

const DefaultSearchView: React.FC = () => {
  const viewStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    padding: "20px",
    color: "var(--theme-text, #333)",
  };

  //   const pStyle: React.CSSProperties = {
  //     fontSize: "1.2rem",
  //     color: "var(--theme-secondary, #6c757d)",
  //   };

  return (
    <div style={viewStyle}>
      <h2>Search</h2>
      <p>Search for items using the search bar above.</p>
    </div>
  );
};

export default DefaultSearchView;
