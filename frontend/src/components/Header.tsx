import React, { useState } from "react";
import TopBar from "./header/TopBar";
import SearchBar from "./header/SearchBar";
// import DeliveryOptions from './header/DeliveryOptions'; // User commented out
import SearchOverlay from "./common/SearchOverlay"; // Corrected import path

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky", // Make header sticky
    top: 0,
    zIndex: 1001, // Above search history dropdown but below modals if any
    backgroundColor: "#0071dc", // To avoid content showing through during blur
  };

  // Callback to close search/history/overlay
  const handleCloseSearchMode = () => {
    setIsSearchFocused(false);
    // We rely on SearchBar to blur its input when its isFocused prop becomes false
  };

  return (
    <>
      <header style={headerStyle}>
        <TopBar />
        <SearchBar
          isFocused={isSearchFocused}
          setIsFocused={setIsSearchFocused}
        />
        {/* <DeliveryOptions /> */} {/* User commented out */}
      </header>
      {isSearchFocused && <SearchOverlay onClick={handleCloseSearchMode} />}
    </>
  );
};

export default Header;
