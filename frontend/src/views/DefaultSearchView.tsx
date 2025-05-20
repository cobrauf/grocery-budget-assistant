import React from "react";
import "../styles/DefaultSearchView.css";

interface DefaultSearchViewProps {
  searchHistory?: string[];
  onSearch: (query: string) => void;
}

const DefaultSearchView: React.FC<DefaultSearchViewProps> = ({
  searchHistory = [],
  onSearch,
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
  const defaultSuggestions = ["Avocados", "Mangos", "Chicken"];
  const allSearchTerms = [
    ...defaultSuggestions,
    ...searchHistory.filter((term) => !defaultSuggestions.includes(term)),
  ];

  // Limit to a reasonable number of buttons
  const displayedTerms = allSearchTerms.slice(0, 12);

  const handleSearchClick = (term: string) => {
    onSearch(term);
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefaultSearchView;
