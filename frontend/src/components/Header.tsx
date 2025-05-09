import React from "react";
import TopBar from "./header/TopBar";
import SearchBar from "./header/SearchBar";
// import DeliveryOptions from "./header/DeliveryOptions";

const Header = () => {
  const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow for separation
  };

  return (
    <header style={headerStyle}>
      <TopBar />
      <SearchBar />
      {/* <DeliveryOptions /> */}
    </header>
  );
};

export default Header;
