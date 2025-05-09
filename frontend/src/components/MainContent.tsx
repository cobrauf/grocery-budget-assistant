import React from "react";
import NavTabs from "./main/NavTabs";
// import SponsoredAd from "./main/SponsoredAd";
// import FlashDealsSection from './main/FlashDealsSection'; // To be added later

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const mainContentStyle: React.CSSProperties = {
    padding: "0", // Remove padding if sub-components handle it
    flexGrow: 1,
    backgroundColor: "#fff", // Main content background
  };

  const flashDealsPlaceholderStyle: React.CSSProperties = {
    padding: "1rem",
    margin: "1rem",
    border: "1px dashed #ccc",
    textAlign: "center",
    color: "#777",
  };

  return (
    <main style={mainContentStyle}>
      <NavTabs />
      {/* <SponsoredAd /> */}
      {/* Placeholder for Flash Deals Section */}
      <div style={flashDealsPlaceholderStyle}>
        Front Page Section (Coming Soon)
      </div>
      {/* Keep the existing children prop for the test backend button */}
      {children}
    </main>
  );
};

export default MainContent;
