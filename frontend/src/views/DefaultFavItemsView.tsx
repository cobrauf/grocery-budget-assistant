import React from "react";
import "../styles/DefaultFavItemsView.css";

const DefaultFavItemsView: React.FC = () => {
  return (
    <div className="default-fav-items-container">
      <div className="default-fav-items-content">
        <div className="default-fav-items-icon">❤️</div>
        <h2 className="default-fav-items-title">Favorite Items</h2>
        <p className="default-fav-items-description">
          You haven't added any items to your favorites yet. Click the heart
          icon on any product card to add it to your favorites.
        </p>
      </div>
    </div>
  );
};

export default DefaultFavItemsView;
