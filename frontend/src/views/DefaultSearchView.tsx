import React, { useState, useEffect } from "react";
import "../styles/DefaultSearchView.css";

interface DefaultSearchViewProps {
  searchHistory?: string[];
  onSearch: (query: string) => void;
  onRemoveSearchItem?: (query: string) => void;
  onSetSearchInput?: (query: string) => void;
}

const DefaultSearchView: React.FC<DefaultSearchViewProps> = ({
  searchHistory = [],
  onSearch,
  onRemoveSearchItem,
  onSetSearchInput,
}) => {
  // Internal state to manage terms for display, allowing animation before actual removal from parent state
  const [displayedInternalTerms, setDisplayedInternalTerms] = useState<
    string[]
  >([]);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const defaultSuggestions = [
    "🥚 Eggs",
    "🍗 Chicken",
    // "🐖 Pork",
    "🐟 Fish",
    "🥩 Beef",
    "🥑 Avocados",
    // "🥛 Milk",
    // "🍌 Bananas",
    "🍎 Fruits",
    "🧀 Cheese",
    "☕ Coffee",
    // "🍪 Cookies",
    "🍦 Ice Cream",
    "🍫 Snacks",
    // "🍋 Lemons",
    "🍺 Beer",
    // "🥔 Chips",
    // "🧈 Butter",
    // "🥓 Bacon",
    "🍕 Pizza",
    // "🍫 Chocolate",
    // "🌶️ Hot Sauce",
  ];

  // Effect to synchronize internal state with the searchHistory prop
  useEffect(() => {
    // We only want to display non-default suggestions from the searchHistory prop
    // as default suggestions are added separately and are not "removable" in the same way.
    const nonDefaultHistory = searchHistory.filter(
      (term) => !defaultSuggestions.includes(term)
    );
    setDisplayedInternalTerms(nonDefaultHistory);
  }, [searchHistory]); // Note: defaultSuggestions is stable, no need to include if defined outside useEffect

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

  // Combine unique internal terms with default suggestions for rendering
  const termsToRender = [
    ...displayedInternalTerms,
    // Add default suggestions that are not already in displayedInternalTerms (if any case this happens)
    ...defaultSuggestions.filter(
      (term) => !displayedInternalTerms.includes(term)
    ),
  ].slice(0, 50); // Limit total buttons

  const handleSearchClick = (term: string) => {
    // Fill the search input with the term
    if (onSetSearchInput) {
      onSetSearchInput(term);
    }
    // Then perform the search
    onSearch(term);
  };

  const handleRemoveClick = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    // Prevent removal if it's a default suggestion or already being removed
    if (defaultSuggestions.includes(term) || removingItems.has(term)) {
      return;
    }

    setRemovingItems((prev) => new Set(prev).add(term));

    setTimeout(() => {
      // Call the parent handler to remove from the actual search history (e.g., in useSearch hook)
      if (onRemoveSearchItem) {
        onRemoveSearchItem(term);
      }
      // Remove from internal display list *after* animation duration
      // This ensures the item is still in the DOM for the animation to play
      setDisplayedInternalTerms((prevTerms) =>
        prevTerms.filter((t) => t !== term)
      );
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(term);
        return next;
      });
    }, 500);
  };

  return (
    <div style={viewStyle}>
      <p>🔍 Search for items above.</p>

      <div className="search-history-section">
        <h3>Quick Searches</h3>
        <div className="search-history-grid">
          {termsToRender.map((term) => (
            <button
              key={term} // Assuming terms are unique for keys here; add index if not guaranteed
              className={`search-history-button ${
                removingItems.has(term) ? "removing" : ""
              }`}
              onClick={() => handleSearchClick(term)}
            >
              {term}
              {!defaultSuggestions.includes(term) && (
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
