import React from "react";
import "../../styles/LoadingSpinner.css"; // We'll create this CSS file next

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
