import React, { useState, useEffect } from "react";
import NavTabs from "./main/NavTabs";
// import SponsoredAd from "./main/SponsoredAd";
import SearchResultsList from "./search/SearchResultsList";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer"; // Import Retailer type
import { fetchRetailers, fetchProductsByRetailer } from "../services/api"; // API functions
import FullOverlay from "./common/FullOverlay"; // For loading overlay
import LoadingSpinner from "./common/LoadingSpinner"; // For loading spinner

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
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedRetailerProducts, setSelectedRetailerProducts] = useState<
    Product[]
  >([]);
  const [isLoadingRetailers, setIsLoadingRetailers] = useState<boolean>(false);
  const [isLoadingRetailerProducts, setIsLoadingRetailerProducts] =
    useState<boolean>(false);
  const [retailerError, setRetailerError] = useState<string | null>(null);

  useEffect(() => {
    const loadRetailers = async () => {
      setIsLoadingRetailers(true);
      setRetailerError(null);
      try {
        const fetchedRetailers = await fetchRetailers();
        setRetailers(fetchedRetailers);
      } catch (error) {
        console.error("Error fetching retailers:", error);
        setRetailerError("Failed to load retailers.");
      }
      setIsLoadingRetailers(false);
    };
    // Fetch retailers only if no search is active and no retailer products are loaded
    if (!searchQuery && selectedRetailerProducts.length === 0) {
      loadRetailers();
    }
  }, [searchQuery, selectedRetailerProducts.length]); // Depend on searchQuery and selectedRetailerProducts

  const handleRetailerClick = async (retailerId: number) => {
    setIsLoadingRetailerProducts(true);
    setRetailerError(null);
    setSelectedRetailerProducts([]); // Clear previous retailer products
    try {
      const products = await fetchProductsByRetailer(retailerId, "current");
      setSelectedRetailerProducts(products);
    } catch (error) {
      console.error("Error fetching products for retailer:", error);
      setRetailerError("Failed to load products for this retailer.");
    }
    setIsLoadingRetailerProducts(false);
  };

  const mainContentStyle: React.CSSProperties = {
    padding: "0", // Remove padding if sub-components handle it
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)", // Main content background
    position: "relative", // For overlay positioning
  };

  const flashDealsPlaceholderStyle: React.CSSProperties = {
    padding: "1rem",
    margin: "1rem",
    border: "1px dashed #ccc",
    textAlign: "center",
    color: "#777",
  };

  const retailerLogosContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    padding: "20px",
  };

  const retailerButtonStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid var(--theme-border-color, #ddd)",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    textAlign: "center",
    minWidth: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const retailerLogoStyle: React.CSSProperties = {
    maxHeight: "60px",
    maxWidth: "100px",
    objectFit: "contain",
  };

  // Determine if we should show search-related content or default content
  const showSearchResultsView =
    searchQuery || searchResults.length > 0 || isLoadingSearch || searchError;

  // Determine if we should show products from a selected retailer
  const showRetailerProductsView =
    selectedRetailerProducts.length > 0 && !showSearchResultsView;

  const getLogoPath = (retailerName: string) => {
    // Normalize retailer name to match logo file names (e.g., "Food 4 Less" -> "food4less.png")
    const imageName =
      retailerName.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and") +
      ".png"; // or .svg, .jpg etc.
    try {
      // This uses Vite's public directory feature or dynamic imports if configured.
      // For simple cases, ensure logos are in `public/assets/logos/`
      // The path should be relative to the public directory.
      return `/assets/logos/${imageName}`;
    } catch (error) {
      console.warn(
        `Logo not found for ${retailerName} (expected ${imageName})`
      );
      return "/assets/logos/default.png"; // Fallback logo
    }
  };

  return (
    <main style={mainContentStyle}>
      {(isLoadingRetailers || isLoadingRetailerProducts) && (
        <FullOverlay isTransparent={false}>
          <LoadingSpinner />
        </FullOverlay>
      )}

      {showSearchResultsView ? (
        <SearchResultsList
          searchQuery={searchQuery}
          items={searchResults}
          totalResults={totalResults}
          isLoading={isLoadingSearch}
          error={searchError}
          hasMore={hasMoreResults}
          loadMore={loadMoreResults}
        />
      ) : showRetailerProductsView ? (
        <SearchResultsList
          searchQuery={
            retailers.find(
              (r) => r.id === selectedRetailerProducts[0]?.retailer_id
            )?.name || "Retailer Products"
          } // Display retailer name as query
          items={selectedRetailerProducts} // Products from selected retailer
          totalResults={selectedRetailerProducts.length}
          isLoading={isLoadingRetailerProducts} // Use retailer product loading state
          error={retailerError} // Use retailer error state
          // Pagination for retailer products not implemented in this step, can be added
          hasMore={false}
          loadMore={() => {}}
        />
      ) : (
        <>
          <NavTabs />
          {/* <SponsoredAd /> */}
          {/* Placeholder for Flash Deals Section */}
          <div style={flashDealsPlaceholderStyle}>
            Front Page Section (Coming Soon)
          </div>

          {isLoadingRetailers && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Loading retailers...
            </p>
          )}
          {retailerError && !isLoadingRetailers && (
            <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
              {retailerError}
            </p>
          )}

          {!isLoadingRetailers && !retailerError && retailers.length > 0 && (
            <div style={retailerLogosContainerStyle}>
              {retailers.map((retailer) => (
                <button
                  key={retailer.id}
                  onClick={() => handleRetailerClick(retailer.id)}
                  style={retailerButtonStyle}
                  title={`View products from ${retailer.name}`}
                >
                  <img
                    src={getLogoPath(retailer.name)}
                    alt={`${retailer.name} logo`}
                    style={retailerLogoStyle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/logos/default.png"; // Fallback if logo fails to load
                      (
                        e.target as HTMLImageElement
                      ).alt = `${retailer.name} (logo not found)`;
                    }}
                  />
                  <span>{retailer.name}</span>
                </button>
              ))}
            </div>
          )}
          {!isLoadingRetailers && !retailerError && retailers.length === 0 && (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#777" }}
            >
              No retailers found or front page content coming soon.
            </div>
          )}

          {/* Keep the existing children prop for the test backend button */}
          {children}
        </>
      )}
    </main>
  );
};

export default MainContent;
