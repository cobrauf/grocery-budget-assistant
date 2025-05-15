import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api"; // Import the api service

const LOCAL_STORAGE_KEY = "searchHistory";
const PLACEHOLDER_TEXTS = [
  "Search for weekly ad items",
  // "What's on sale in bread?",
  // "Chicken breast offers...",
  // "Search for your groceries...",
];

interface SearchBarProps {
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
  onClear?: () => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isFocused,
  setIsFocused,
  onSearch,
  isLoading,
  onClear,
  initialValue,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue || "");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect for placeholder
  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;
    let textArrayIndex = 0;
    let typingInterval: NodeJS.Timeout;

    const type = () => {
      if (textArrayIndex >= PLACEHOLDER_TEXTS.length) {
        // Optional: Loop back or stop after all texts are shown
        // For now, it stops at the last full placeholder or could default to a fixed one
        setCurrentPlaceholder(PLACEHOLDER_TEXTS[PLACEHOLDER_TEXTS.length - 1]);
        return;
      }

      const fullText = PLACEHOLDER_TEXTS[textArrayIndex];
      if (currentIndex < fullText.length) {
        currentText += fullText.charAt(currentIndex);
        setCurrentPlaceholder(currentText);
        currentIndex++;
        typingInterval = setTimeout(type, 50); // Adjust typing speed
      } else {
        // Finished typing current text, pause then move to next or erase
        setTimeout(() => {
          currentText = ""; // Erase effect (optional)
          currentIndex = 0;
          setCurrentPlaceholder(""); // Show blank before next one
          textArrayIndex++;
          if (textArrayIndex < PLACEHOLDER_TEXTS.length) {
            setTimeout(type, 500); // Pause before starting next text
          } else {
            setCurrentPlaceholder(
              PLACEHOLDER_TEXTS[PLACEHOLDER_TEXTS.length - 1]
            ); // Set a default final placeholder
          }
        }, 1500); // Pause after typing a full placeholder
      }
    };

    // Start typing only if input is not focused and has no search term
    if (!isFocused && !searchTerm) {
      type();
    }

    return () => clearTimeout(typingInterval);
  }, []); // Runs once on mount

  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Effect to blur input when isFocused prop becomes false (e.g. overlay click)
  useEffect(() => {
    if (!isFocused && document.activeElement === inputRef.current) {
      inputRef.current?.blur();
    }
  }, [isFocused]);

  const updateHistory = (newHistory: string[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const saveSearchTerm = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm === "") return;

    const newHistory = [
      trimmedTerm,
      ...searchHistory.filter((t) => t !== trimmedTerm),
    ].slice(0, 10); // Keep latest 10, unique
    updateHistory(newHistory);
  };

  const handleDeleteHistoryItem = (termToDelete: string) => {
    const newHistory = searchHistory.filter((term) => term !== termToDelete);
    updateHistory(newHistory);
  };

  const handleSearchInternal = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm === "" || isLoading) return;

    saveSearchTerm(trimmedSearchTerm);
    await onSearch(trimmedSearchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPlaceholder(""); // Reset placeholder for typewriter if input is cleared
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus(); // Keep focus to allow new typing or see history
    setIsFocused(true); // Ensure history/overlay stays if it was cleared while focused
  };

  const handleHistoryItemClick = (term: string) => {
    setSearchTerm(term);
    setIsFocused(true); // Keep focus
    inputRef.current?.focus();
    // Optionally, trigger search immediately: handleSearchInternal();
    // but need to handle async nature if setSearchTerm isn't instant for handleSearch
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value !== "") {
      // If user starts typing, use a static placeholder or clear dynamic one
      setCurrentPlaceholder("Search for weekly ad items");
    } else if (!isFocused) {
      // Potentially restart typewriter if cleared and not focused, or set a default
      // For simplicity, let it be, or set a static default
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if it's in a form
      handleSearchInternal();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setCurrentPlaceholder("Search for weekly ad items"); // Static placeholder on focus
  };

  const effectivePlaceholder = searchTerm
    ? "Search for weekly ad items"
    : currentPlaceholder || "Search your groceries...";

  const searchBarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column", // To stack input and history
    padding: "0.5rem 2rem",
    position: "relative", // For potential history dropdown later
  };

  const inputRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  const inputContainerStyle: React.CSSProperties = {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--theme-search-input-background, white)",
    borderRadius: "20px",
    padding: "0 0.5rem",
    height: "40px", // Fixed height for the input area
    transition: "background-color 0.3s ease",
  };

  const inputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "0.5rem 0.5rem",
    border: "none",
    borderRadius: "20px",
    outline: "none",
    fontSize: "0.9rem",
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--theme-search-input-text, #495057)",
    transition: "color 0.3s ease",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    color: "var(--theme-search-input-placeholder, #555)",
    cursor: "pointer",
    padding: "0 0.5rem",
    display: "flex",
    alignItems: "center",
    transition: "color 0.3s ease",
  };

  const historyStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 5px)", // Position below the search bar area
    left: "0", // Align with parent (searchBarStyle padding will handle offset)
    right: "0",
    backgroundColor: "var(--theme-background, white)",
    color: "var(--theme-text, #212529)",
    border: "1px solid var(--theme-sidebar-divider, #ddd)",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 1000, // Ensure it's above other content within header
    maxHeight: "200px",
    overflowY: "auto",
    transition:
      "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
  };

  const historyItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid var(--theme-sidebar-divider, #eee)",
    fontSize: "0.9rem",
    transition: "border-color 0.3s ease",
  };

  const deleteIconStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#aaa",
    cursor: "pointer",
    paddingLeft: "0.5rem",
  };

  return (
    <div style={searchBarStyle}>
      <div style={inputRowStyle}>
        {" "}
        {/* Wrapper for input and icons only */}
        <div style={inputContainerStyle}>
          {isLoading ? (
            <span
              style={{ ...iconStyle, cursor: "default" }}
              title="Searching..."
            >
              🔄
            </span>
          ) : (
            searchTerm && (
              <span
                onClick={handleSearchInternal}
                style={{ ...iconStyle, color: "var(--theme-primary, #0071dc)" }}
                title="Search"
              >
                🔍
              </span>
            )
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={effectivePlaceholder}
            style={inputStyle}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            disabled={isLoading}
          />
          {searchTerm && !isLoading && (
            <span
              onClick={handleClearSearch}
              style={iconStyle}
              title="Clear search"
            >
              ✕
            </span>
          )}
        </div>
      </div>
      {isFocused && searchHistory.length > 0 && !isLoading && (
        <div style={historyStyle}>
          {searchHistory.map((item, index) => (
            <div key={index} style={historyItemStyle}>
              <span
                style={{ flexGrow: 1 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleHistoryItemClick(item);
                }}
              >
                {item}
              </span>
              <span
                style={deleteIconStyle}
                title="Remove from history"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent click on item itself
                  e.stopPropagation(); // Prevent click on item itself
                  handleDeleteHistoryItem(item);
                }}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Blurred overlay will be handled potentially outside this component */}
    </div>
  );
};

export default SearchBar;
