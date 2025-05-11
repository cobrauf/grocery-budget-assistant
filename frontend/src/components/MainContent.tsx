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
  const [rawRetailers, setRawRetailers] = useState<Retailer[]>([]);
  const [verifiedRetailers, setVerifiedRetailers] = useState<Retailer[]>([]);
  const [selectedRetailerProducts, setSelectedRetailerProducts] = useState<
    Product[]
  >([]);

  const [isLoadingApiRetailers, setIsLoadingApiRetailers] =
    useState<boolean>(false);
  const [isLoadingLogoVerification, setIsLoadingLogoVerification] =
    useState<boolean>(false);
  const [retailerApiError, setRetailerApiError] = useState<string | null>(null);

  const getLogoPath = (retailerName: string) => {
    const imageName =
      retailerName.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and") +
      ".png";
    return `public/assets/logos/${imageName}`;
  };

  useEffect(() => {
    const loadInitialRetailers = async () => {
      setIsLoadingApiRetailers(true);
      setRetailerApiError(null);
      try {
        const fetchedRetailers = await fetchRetailers();
        setRawRetailers(fetchedRetailers);
      } catch (error) {
        console.error("Error fetching retailers from API:", error);
        setRetailerApiError("Failed to load retailers list.");
        setRawRetailers([]); // Clear raw retailers on error
      }
      setIsLoadingApiRetailers(false);
    };

    if (!searchQuery && selectedRetailerProducts.length === 0) {
      loadInitialRetailers();
    }
  }, [searchQuery, selectedRetailerProducts.length]);

  useEffect(() => {
    if (rawRetailers.length === 0) {
      setVerifiedRetailers([]);
      setIsLoadingLogoVerification(false);
      return;
    }

    setIsLoadingLogoVerification(true);
    const verifyLogosAndSetRetailers = async () => {
      const promises = rawRetailers.map((retailer) => {
        return new Promise<Retailer | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(retailer);
          img.onerror = () => {
            console.warn(
              `Logo verification failed for: ${
                retailer.name
              }, path: ${getLogoPath(retailer.name)}`
            );
            resolve(null); // Indicates logo not found or failed to load
          };
          console.log("^^^^^^^^^retailer name:", retailer.name);
          img.src = getLogoPath(retailer.name);
          console.log("^^^^^^^^^^^Logo path:", img.src);
        });
      });

      try {
        const results = await Promise.all(promises);
        setVerifiedRetailers(results.filter((r) => r !== null) as Retailer[]);
      } catch (error) {
        console.error("Error during bulk logo verification:", error);
        setVerifiedRetailers([]); // Clear on error
      } finally {
        setIsLoadingLogoVerification(false);
      }
    };

    verifyLogosAndSetRetailers();
  }, [rawRetailers]); // Dependency is the list of retailers from the API

  const handleRetailerClick = async (retailerId: number) => {
    setIsLoadingRetailerProducts(true); // This is a different loading state, for products
    setRetailerApiError(null);
    setSelectedRetailerProducts([]);
    try {
      const products = await fetchProductsByRetailer(retailerId, "current");
      setSelectedRetailerProducts(products);
    } catch (error) {
      console.error("Error fetching products for retailer:", error);
      setRetailerApiError("Failed to load products for this retailer.");
    }
    setIsLoadingRetailerProducts(false); // Corresponds to isLoadingRetailerProducts
  };

  // States used for retailer products, not for initial retailers list or logo check
  const [isLoadingRetailerProducts, setIsLoadingRetailerProducts] =
    useState<boolean>(false);

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
            rawRetailers.find(
              (r) => r.id === selectedRetailerProducts[0]?.retailer_id
            )?.name || "Retailer Products"
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
            verifiedRetailers.length === 0 && (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#777" }}
              >
                No retailers with available logos found.
              </div>
            )}
          {!retailerApiError &&
            rawRetailers.length === 0 &&
            !isLoadingApiRetailers && (
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
