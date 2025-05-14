import React from "react";
import { Retailer } from "../types/retailer"; // Assuming Retailer type is defined here
import "../styles/RetailerLogosView.css"; // Import the CSS file

interface RetailerLogosViewProps {
  rawRetailers: Retailer[];
  verifiedRetailers: Retailer[];
  isLoadingApiRetailers: boolean;
  isLoadingLogoVerification: boolean;
  retailerApiError: string | null;
  handleRetailerClick: (id: number) => void;
  getLogoPath: (name: string) => string;
  children?: React.ReactNode; // For potential future use or placeholders like the "test backend button"
}

const RetailerLogosView: React.FC<RetailerLogosViewProps> = ({
  rawRetailers,
  verifiedRetailers,
  isLoadingApiRetailers,
  isLoadingLogoVerification,
  retailerApiError,
  handleRetailerClick,
  getLogoPath,
  children, // Receive children
}) => {
  const isLoading = isLoadingApiRetailers || isLoadingLogoVerification;

  return (
    <>
      {/* Placeholder for Flash Deals Section */}
      <div className="flash-deals-placeholder">
        Front Page Section (Coming Soon)
      </div>

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

export default RetailerLogosView;
