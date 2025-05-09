import React from "react";

const DeliveryOptions = () => {
  const deliveryOptionsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#f0f0f0", // Lighter background
    borderBottom: "1px solid #e0e0e0",
    fontSize: "0.9rem",
  };

  const textStyle: React.CSSProperties = {
    color: "#333",
  };

  const zipStyle: React.CSSProperties = {
    fontWeight: "bold",
    marginLeft: "0.5rem",
    color: "#0071dc", // Walmart blue for emphasis
  };

  const arrowStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    color: "#0071dc",
  };

  return (
    <div style={deliveryOptionsStyle}>
      <div>
        <span style={textStyle}>How do you want your items?</span>
        <span style={zipStyle}>| 90248</span>
      </div>
      {/* Using a text placeholder for the dropdown arrow */}
      <span style={arrowStyle}>▼</span>
    </div>
  );
};

export default DeliveryOptions;
