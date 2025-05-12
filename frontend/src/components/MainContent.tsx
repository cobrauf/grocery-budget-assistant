import React, { useState, useEffect } from "react";
import NavTabs from "./main/NavTabs";
// import SponsoredAd from "./main/SponsoredAd";
import SearchResultsList from "./search/SearchResultsList";
import { Product } from "../types/product";
import FullOverlay from "./common/FullOverlay";
import LoadingSpinner from "./common/LoadingSpinner";
import { useRetailers } from "../hooks/useRetailers";

// Updated props: Rely on props passed from App (which uses useSearch)
interface MainContentProps {
  children?: React.ReactNode; // Made optional as it's only for the test button now
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  children, // Keep children for potential flexibility or the test button
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
}) => {
  // State related to retailers moved to useRetailers hook
  // const [rawRetailers, setRawRetailers] = useState<Retailer[]>([]);
  // const [verifiedRetailers, setVerifiedRetailers] = useState<Retailer[]>([]);
  // const [selectedRetailerProducts, setSelectedRetailerProducts] = useState<Product[]>([]);
  // const [isLoadingApiRetailers, setIsLoadingApiRetailers] = useState<boolean>(false);
  // const [isLoadingLogoVerification, setIsLoadingLogoVerification] = useState<boolean>(false);
  // const [retailerApiError, setRetailerApiError] = useState<string | null>(null);
  // const [isLoadingRetailerProducts, setIsLoadingRetailerProducts] = useState<boolean>(false);

  // Determine if a search is active (query exists or results are present)
  const isSearchActive =
    !!searchQuery ||
    searchResults.length > 0 ||
    isLoadingSearch ||
    !!searchError;

  // Use the retailers hook
  const {
    rawRetailers,
    verifiedRetailers,
    selectedRetailerProducts,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    isLoadingRetailerProducts,
    retailerApiError,
    handleRetailerClick,
    getLogoPath,
    clearSelectedRetailer, // Get the clear function
  } = useRetailers(isSearchActive); // Pass search status to the hook

  // Effect to clear retailer selection when a new search starts
  useEffect(() => {
    if (isSearchActive) {
      clearSelectedRetailer();
    }
  }, [isSearchActive, clearSelectedRetailer]);

  // Logic for getting logo path moved to useRetailers hook
  // const getLogoPath = (retailerName: string) => {
  //   const imageName =
  //     retailerName.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and") +
  //     ".png";
  //   return `public/assets/logos/${imageName}`;
  // };

  // Effects for fetching retailers and verifying logos moved to useRetailers hook
  // useEffect(() => { ... loadInitialRetailers ... }, [searchQuery, selectedRetailerProducts.length]);
  // useEffect(() => { ... verifyLogosAndSetRetailers ... }, [rawRetailers]);

  // Function to handle retailer click moved to useRetailers hook
  // const handleRetailerClick = async (retailerId: number) => {
  //   setIsLoadingRetailerProducts(true);
  //   setRetailerApiError(null);
  //   setSelectedRetailerProducts([]);
  //   try {
  //     const products = await fetchProductsByRetailer(retailerId, "current");
  //     setSelectedRetailerProducts(products);
  //   } catch (error) {
  //     console.error("Error fetching products for retailer:", error);
  //     setRetailerApiError("Failed to load products for this retailer.");
  //   }
  //   setIsLoadingRetailerProducts(false);
  // };

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

  const showLoadingState = isLoadingApiRetailers || isLoadingLogoVerification;
  const showSearchResultsView =
    searchQuery || searchResults.length > 0 || isLoadingSearch || searchError;

  // Determine if we should show products from a selected retailer
  // Ensure search results view takes precedence
  const showRetailerProductsView =
    selectedRetailerProducts.length > 0 && !showSearchResultsView;

  return (
    <main style={mainContentStyle}>
      {showLoadingState && (
        <FullOverlay isOpen={true} isTransparent={false}>
          <LoadingSpinner />
        </FullOverlay>
      )}

      {isLoadingRetailerProducts && !showLoadingState && (
        <FullOverlay isOpen={true} isTransparent={false}>
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
            verifiedRetailers.find(
              (r) => r.id === selectedRetailerProducts[0]?.retailer_id
            )?.name || `Products`
          }
          items={selectedRetailerProducts}
          totalResults={selectedRetailerProducts.length}
          isLoading={isLoadingRetailerProducts}
          error={retailerApiError}
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

          {retailerApiError && (
            <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
              {retailerApiError}
            </p>
          )}

          {!retailerApiError && verifiedRetailers.length > 0 && (
            <div style={retailerLogosContainerStyle}>
              {verifiedRetailers.map((retailer) => (
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
                  />
                  <span>{retailer.name}</span>
                </button>
              ))}
            </div>
          )}
          {!retailerApiError &&
            rawRetailers.length > 0 &&
            verifiedRetailers.length === 0 &&
            !isLoadingApiRetailers &&
            !isLoadingLogoVerification && (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#777" }}
              >
                No retailers with available logos found.
              </div>
            )}
          {!retailerApiError &&
            rawRetailers.length === 0 &&
            !isLoadingApiRetailers &&
            !isLoadingLogoVerification && (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#777" }}
              >
                No retailers currently available.
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
