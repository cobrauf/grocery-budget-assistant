import React from "react";

interface SearchOverlayProps {
  onClick: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClick }) => {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0, // Assuming header height is handled or it starts below header
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
    zIndex: 999, // Below history dropdown, but above other page content
  };

  return <div style={overlayStyle} onClick={onClick}></div>;
};

export default SearchOverlay;
