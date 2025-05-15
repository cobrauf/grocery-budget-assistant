import React, { useState, useEffect, useRef } from "react";
import TopBar from "./header/TopBar";
import SearchBar from "./header/SearchBar";
import SearchOverlay from "./common/SearchOverlay";

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => Promise<void>;
  isLoadingSearch: boolean;
  onClearSearch: () => void;
  initialSearchQuery?: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearch,
  isLoadingSearch,
  onClearSearch,
  initialSearchQuery,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const prevIsLoadingSearchRef = useRef<boolean>(isLoadingSearch); // Initialize with isLoadingSearch

  useEffect(() => {
    if (prevIsLoadingSearchRef.current === true && !isLoadingSearch) {
      if (isSearchFocused) {
        setIsSearchFocused(false);
      }
    }
    prevIsLoadingSearchRef.current = isLoadingSearch;
  }, [isLoadingSearch, isSearchFocused, setIsSearchFocused]);

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
          onClear={onClearSearch}
          initialValue={initialSearchQuery}
        />
      </header>
      {isSearchFocused && <SearchOverlay onClick={handleCloseSearchMode} />}
    </>
  );
};

export default Header;
