import React from "react";
import SearchResultsView from "../views/SearchResultsView";
import DefaultBrowseView from "../views/DefaultBrowseView";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { AppView } from "../hooks/useAppView";

interface MainContentProps {
  children?: React.ReactNode;
  currentViewType: AppView;
  searchQuery: string;
  searchResults: Product[];
  totalResults: number;
  isLoadingSearch: boolean;
  searchError: string | null;
  hasMoreResults: boolean;
  loadMoreResults: () => void;
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  onRetailerClick: (retailerId: number) => void;
  getLogoPath: (name: string) => string;
  retailerProducts: Product[];
  isLoadingRetailerProducts: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  children,
  currentViewType,
  searchQuery,
  searchResults,
  totalResults,
  isLoadingSearch,
  searchError,
  hasMoreResults,
  loadMoreResults,
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  onRetailerClick,
  getLogoPath,
  retailerProducts,
  isLoadingRetailerProducts,
}) => {
  const mainContentStyle: React.CSSProperties = {
    padding: "0",
    flexGrow: 1,
    backgroundColor: "var(--theme-background, #fff)",
    position: "relative",
  };

  const renderContent = () => {
    switch (currentViewType) {
      case "searchResults":
        return (
          <SearchResultsView
            searchQuery={searchQuery}
            items={searchResults}
            totalResults={totalResults}
            isLoading={isLoadingSearch}
            error={searchError}
            hasMore={hasMoreResults}
            loadMore={loadMoreResults}
          />
        );
      case "retailerProducts":
        const retailerNameForProductsView =
          verifiedRetailers.find(
            (r) => r.id === retailerProducts[0]?.retailer_id
          )?.name || "Products";
        return (
          <SearchResultsView
            searchQuery={retailerNameForProductsView}
            items={retailerProducts}
            totalResults={retailerProducts.length}
            isLoading={isLoadingRetailerProducts}
            error={retailerApiError}
            hasMore={false}
            loadMore={() => {}}
          />
        );
      case "defaultBrowse":
      default:
        return (
          <DefaultBrowseView
            rawRetailers={rawRetailers}
            verifiedRetailers={verifiedRetailers}
            isLoadingApiRetailers={isLoadingApiRetailers}
            isLoadingLogoVerification={isLoadingLogoVerification}
            retailerApiError={retailerApiError}
            handleRetailerClick={onRetailerClick}
            getLogoPath={getLogoPath}
          >
            {children}
          </DefaultBrowseView>
        );
    }
  };

  return <main style={mainContentStyle}>{renderContent()}</main>;
};

export default MainContent;
