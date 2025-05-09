import React, { useState } from "react";
import TopBar from "./header/TopBar";
import SearchBar from "./header/SearchBar";
// import DeliveryOptions from './header/DeliveryOptions'; // User commented out
import SearchOverlay from "./common/SearchOverlay"; // Corrected import path

interface HeaderProps {
  onMenuClick: () => void; // To be passed from App.tsx
  onSearch: (query: string) => Promise<void>; // Added
  isLoadingSearch: boolean; // Added
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearch,
  isLoadingSearch,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky", // Make header sticky
    top: 0,
    zIndex: 1001, // Above search history dropdown but below modals if any
    backgroundColor: "var(--theme-header-background, #0071dc)", // To avoid content showing through during blur
  };

  // Callback to close search/history/overlay
  const handleCloseSearchMode = () => {
    setIsSearchFocused(false);
    // We rely on SearchBar to blur its input when its isFocused prop becomes false
  };

  return (
    <>
      <header style={headerStyle}>
        <TopBar onMenuClick={onMenuClick} />
        <SearchBar
          isFocused={isSearchFocused}
          setIsFocused={setIsSearchFocused}
          onSearch={onSearch}
          isLoading={isLoadingSearch}
        />
        {/* <DeliveryOptions /> */} {/* User commented out */}
      </header>
      {isSearchFocused && <SearchOverlay onClick={handleCloseSearchMode} />}
    </>
  );
};

export default Header;
