import React from "react";

const SponsoredAd = () => {
  const adStyle: React.CSSProperties = {
    margin: "1rem",
    textAlign: "center",
    position: "relative", // For text overlay if needed, or button positioning
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: "200px", // Adjust as needed
    objectFit: "cover",
    borderRadius: "8px",
  };

  const adContentStyle: React.CSSProperties = {
    // If text is overlaid on image, this would be styled further
    // For simplicity, placing text below for now or assuming it's part of the image
    padding: "1rem",
    backgroundColor: "#e9f5fe", // Light blue background, similar to mockup
    borderRadius: "0 0 8px 8px", // If image and text are grouped
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0.5rem 0",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "1rem",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#ffc107", // Yellow, similar to mockup button on ad
    color: "black",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <div style={adStyle}>
      {/* Placeholder for the ad image */}
      <img
        src="https://via.placeholder.com/600x200?text=Sponsored+Ad+Image"
        alt="Sponsored Ad"
        style={imageStyle}
      />
      {/* The mockup shows text overlaid. For now, I'll put a container below. */}
      {/* A more complex overlay would require absolute positioning for text elements. */}
      <div style={adContentStyle}>
        <h2 style={titleStyle}>Holy grail for hair</h2>
        <p style={subtitleStyle}>Sleek & glassy finish</p>
        <button style={buttonStyle}>Shop now</button>
      </div>
    </div>
  );
};

export default SponsoredAd;
