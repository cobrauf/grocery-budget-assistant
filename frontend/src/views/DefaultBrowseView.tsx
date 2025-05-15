import React from "react";
import { Retailer } from "../types/retailer";
import "../styles/DefaultBrowseView.css";

interface DefaultBrowseViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  handleRetailerClick: (id: number) => void;
  getLogoPath: (name: string) => string;
  children?: React.ReactNode;
}

const DefaultBrowseView: React.FC<DefaultBrowseViewProps> = ({
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  handleRetailerClick,
  getLogoPath,
  children,
}) => {
  const isLoading = isLoadingApiRetailers || isLoadingLogoVerification;

  return (
    <>
      {/* Placeholder for Flash Deals Section */}
      {/* <div className="flash-deals-placeholder">
        Front Page Section (Coming Soon)
      </div> */}

      {retailerApiError && (
        <p className="retailer-error-message">{retailerApiError}</p>
      )}

      {!retailerApiError && verifiedRetailers.length > 0 && (
        <div className="retailer-logos-container">
          {verifiedRetailers.map((retailer) => (
            <button
              key={retailer.id}
              onClick={() => handleRetailerClick(retailer.id)}
              className="retailer-button"
              title={`View products from ${retailer.name}`}
            >
              <img
                src={getLogoPath(retailer.name)}
                alt={`${retailer.name} logo`}
                className="retailer-logo-img"
              />
              <span className="retailer-name-text">{retailer.name}</span>
            </button>
          ))}
        </div>
      )}
      {!retailerApiError &&
        rawRetailers.length > 0 &&
        verifiedRetailers.length === 0 &&
        !isLoading && (
          <div className="retailer-info-message">
            No retailers with available logos found.
          </div>
        )}
      {!retailerApiError && rawRetailers.length === 0 && !isLoading && (
        <div className="retailer-info-message">
          No retailers currently available.
        </div>
      )}

      {/* Render children passed from MainContent (e.g., the test button) */}
      {children}
    </>
  );
};

export default DefaultBrowseView;
