import React from "react";

const SearchBar = () => {
  const searchBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#0071dc", // Walmart blue
  };

  const inputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "0.75rem",
    border: "none",
    borderRadius: "20px",
    marginRight: "0.5rem",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "1.5rem", // Placeholder for barcode icon
    color: "white",
    cursor: "pointer",
  };

  return (
    <div style={searchBarStyle}>
      <input
        type="text"
        placeholder="Search for weekly sale items"
        style={inputStyle}
      />
      {/* Using a text placeholder for the barcode icon */}
      {/* <span style={iconStyle}>📷</span> */}
    </div>
  );
};

export default SearchBar;
