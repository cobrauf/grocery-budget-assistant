import React from "react";
import NavTabs from "./main/NavTabs";
// import SponsoredAd from "./main/SponsoredAd";
import SearchResultsList from "./search/SearchResultsList";
import { Product } from "../types/product";

interface MainContentProps {
  children: React.ReactNode;
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  children,
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
}) => {
  const mainContentStyle: React.CSSProperties = {
    padding: "0", // Remove padding if sub-components handle it
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)", // Main content background
  };

  const flashDealsPlaceholderStyle: React.CSSProperties = {
    padding: "1rem",
    margin: "1rem",
    border: "1px dashed #ccc",
    textAlign: "center",
    color: "#777",
  };

  // Determine if we should show search-related content or default content
  const showSearchResults =
    searchQuery || searchResults.length > 0 || isLoadingSearch || searchError;

  return (
    <main style={mainContentStyle}>
      {showSearchResults ? (
        <SearchResultsList
          searchQuery={searchQuery}
          items={searchResults}
          totalResults={totalResults}
          isLoading={isLoadingSearch}
          error={searchError}
          hasMore={hasMoreResults}
          loadMore={loadMoreResults}
        />
      ) : (
        <>
          <NavTabs />
          {/* <SponsoredAd /> */}
          {/* Placeholder for Flash Deals Section */}
          <div style={flashDealsPlaceholderStyle}>
            Front Page Section (Coming Soon)
          </div>
          {/* Keep the existing children prop for the test backend button */}
          {children}
        </>
      )}
    </main>
  );
};

export default MainContent;
