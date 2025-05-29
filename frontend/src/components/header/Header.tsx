import React, { useState, useEffect, useRef } from "react";
import TopBar from "./TopBar";
import SearchBar from "./SearchBar";
import SearchOverlay from "../common/SearchOverlay"; // Adjusted from ../common to a more specific path if SearchOverlay moves too, or remains if it doesn't
import { AppTab } from "../../hooks/useAppTab";

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => Promise<void>;
  isLoadingSearch: boolean;
  onClearSearch: () => void;
  initialSearchQuery?: string;
  activeTab: AppTab;
  isInBrowseResultsView?: boolean;
  onGoHome?: () => void;
  areNavBarsVisible?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearch,
  isLoadingSearch,
  onClearSearch,
  initialSearchQuery,
  activeTab,
  isInBrowseResultsView,
  onGoHome,
  areNavBarsVisible,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const prevIsLoadingSearchRef = useRef<boolean>(isLoadingSearch);

  useEffect(() => {
    if (prevIsLoadingSearchRef.current === true && !isLoadingSearch) {
      if (isSearchFocused) {
        setIsSearchFocused(false);
      }
    }
    prevIsLoadingSearchRef.current = isLoadingSearch;
  }, [isLoadingSearch, isSearchFocused, setIsSearchFocused]);

  const headerStyle: React.CSSProperties = {
    backgroundColor: "var(--theme-header-background, #0071dc)", // To avoid content showing through during blur
  };

  let isTopBarShrunk: boolean | undefined;
  switch (activeTab) {
    case "browse":
      isTopBarShrunk = isInBrowseResultsView;
      break;
    default:
      isTopBarShrunk = true;
      break;
  }

  const handleCloseSearchMode = () => {
    setIsSearchFocused(false);
  };

  return (
    <>
      <header className="app-header" style={headerStyle}>
        <TopBar
          onMenuClick={onMenuClick}
          isShrunk={isTopBarShrunk}
          activeTab={activeTab}
          onGoHome={onGoHome}
        />
        {activeTab === "search" && (
          <SearchBar
            isFocused={isSearchFocused}
            setIsFocused={setIsSearchFocused}
            onSearch={onSearch}
            isLoading={isLoadingSearch}
            onClear={onClearSearch}
            initialValue={initialSearchQuery}
          />
        )}
      </header>
      {activeTab === "search" && isSearchFocused && (
        <SearchOverlay onClick={handleCloseSearchMode} />
      )}
    </>
  );
};

export default Header;
