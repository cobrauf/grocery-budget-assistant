import React from "react";
import "../styles/DefaultSearchView.css";

interface DefaultSearchViewProps {
  searchHistory?: string[];
  onSearch: (query: string) => void;
  onRemoveSearchItem?: (query: string) => void;
}

const DefaultSearchView: React.FC<DefaultSearchViewProps> = ({
  searchHistory = [],
  onSearch,
  onRemoveSearchItem,
}) => {
  const viewStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
    padding: "20px",
    color: "var(--theme-text, #333)",
  };

  // Combine search history with default suggestions
  // Add default suggestions at the beginning, filter out duplicates
  const defaultSuggestions = [
    "🥚 Eggs",
    "🥑 Avocados",
    "🥭 Mangos",
    "🍗 Chicken",
  ];
  const allSearchTerms = [
    ...searchHistory.filter((term) => !defaultSuggestions.includes(term)),
    ...defaultSuggestions,
  ];

  // Limit to a reasonable number of buttons
  const displayedTerms = allSearchTerms.slice(0, 50);

  const handleSearchClick = (term: string) => {
    onSearch(term);
  };

  const handleRemoveClick = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // Prevent triggering the search when clicking the X
    if (onRemoveSearchItem && !defaultSuggestions.includes(term)) {
      onRemoveSearchItem(term);
    }
  };

  return (
    <div style={viewStyle}>
      {/* <h2>Search</h2> */}
      <p>Search for items using the search bar above.</p>

      <div className="search-history-section">
        <h3>Quick Searches</h3>
        <div className="search-history-grid">
          {displayedTerms.map((term, index) => (
            <button
              key={index}
              className="search-history-button"
              onClick={() => handleSearchClick(term)}
            >
              {term}
              {!defaultSuggestions.includes(term) && onRemoveSearchItem && (
                <span
                  className="search-history-remove"
                  onClick={(e) => handleRemoveClick(e, term)}
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefaultSearchView;
