import React from "react";
import CartIcon from "./CartIcon";

const TopBar = () => {
  const topBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#0071dc", // Walmart blue
    color: "white",
  };

  const logoStyle: React.CSSProperties = {
    height: "30px", // Placeholder for logo, adjust as needed
    width: "auto",
  };

  const greetingStyle: React.CSSProperties = {
    fontSize: "0.9rem",
  };

  return (
    <div style={topBarStyle}>
      <span style={greetingStyle}>Hello!</span>
      {/* Using a text placeholder for the logo for now */}
      {/* <img src="https://via.placeholder.com/100x30?text=Walmart" alt="Walmart Logo" style={logoStyle} /> */}
      <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Grocery-Assistant
      </span>
      <CartIcon />
    </div>
  );
};

export default TopBar;
