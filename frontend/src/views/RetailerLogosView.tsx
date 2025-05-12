import React from "react";
import { Retailer } from "../types/retailer"; // Assuming Retailer type is defined here

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

  const isLoading = isLoadingApiRetailers || isLoadingLogoVerification;

  return (
    <>
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
        !isLoading && (
          <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
            No retailers with available logos found.
          </div>
        )}
      {!retailerApiError && rawRetailers.length === 0 && !isLoading && (
        <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
          No retailers currently available.
        </div>
      )}

      {/* Render children passed from MainContent (e.g., the test button) */}
      {children}
    </>
  );
};

export default RetailerLogosView;
