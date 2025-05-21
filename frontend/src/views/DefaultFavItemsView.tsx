import React from "react";
import "../styles/DefaultFavItemsView.css";

const DefaultFavItemsView: React.FC = () => {
  return (
    <div className="default-fav-items-container">
      <div className="default-fav-items-content">
        <div className="default-fav-items-icon">❤️</div>
        <h2 className="default-fav-items-title">Favorites</h2>
        <p>Click the heart icon in other tabs to view them here.</p>
      </div>
    </div>
  );
};

export default DefaultFavItemsView;
