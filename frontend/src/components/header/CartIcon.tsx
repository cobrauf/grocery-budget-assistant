import React from "react";

const CartIcon = () => {
  const itemCount = 1; // Example item count
  const cartTotal = 9.99; // Example cart total

  const cartStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    position: "relative", // For badge positioning
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "1.5rem", // Placeholder for actual icon
    marginRight: "0.5rem",
  };

  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: "-0.5rem",
    right: "0.2rem",
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    padding: "0.1rem 0.4rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
    border: "1px solid white",
  };

  const priceStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    fontWeight: "bold",
  };

  return (
    <div style={cartStyle}>
      {/* Using a text placeholder for the cart icon */}
      <span style={iconStyle}>🛒</span>
      {/* {itemCount > 0 && <span style={badgeStyle}>{itemCount}</span>}
      <span style={priceStyle}>${cartTotal.toFixed(2)}</span> */}
    </div>
  );
};

export default CartIcon;
