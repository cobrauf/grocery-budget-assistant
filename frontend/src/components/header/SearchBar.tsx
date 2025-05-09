import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api"; // Import the api service

const LOCAL_STORAGE_KEY = "searchHistory";

interface SearchBarProps {
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isFocused, setIsFocused }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const saveSearchTerm = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm === "") return;

    const newHistory = [
      trimmedTerm,
      ...searchHistory.filter((t) => t !== trimmedTerm),
    ].slice(0, 10); // Keep latest 10, unique
    setSearchHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const handleSearch = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm === "") return;

    console.log(`Searching for: ${trimmedSearchTerm}`);
    try {
      // Replace with your actual backend search endpoint and params
      const response = await api.get(
        `/search?query=${encodeURIComponent(trimmedSearchTerm)}`
      );
      console.log("Search results:", response.data);
      // TODO: Display search results (user explicitly said no need for now)
    } catch (error) {
      console.error("Error fetching search results:", error);
      // TODO: Handle search error display to user
    }

    saveSearchTerm(trimmedSearchTerm);
    inputRef.current?.blur(); // Minimize keyboard
    setIsFocused(false); // This will hide history and overlay
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    inputRef.current?.focus(); // Keep focus to allow new typing or see history
    setIsFocused(true); // Ensure history/overlay stays if it was cleared while focused
  };

  const handleHistoryItemClick = (term: string) => {
    setSearchTerm(term);
    setIsFocused(true); // Keep focus
    inputRef.current?.focus();
    // Optionally, trigger search immediately: handleSearch();
    // but need to handle async nature if setSearchTerm isn't instant for handleSearch
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if it's in a form
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const searchBarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column", // To stack input and history
    padding: "0.5rem 1rem",
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
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "0 0.5rem",
    height: "40px", // Fixed height for the input area
  };

  const inputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "0.5rem 0.5rem",
    border: "none",
    borderRadius: "20px",
    outline: "none",
    fontSize: "0.9rem",
    height: "100%",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    color: "#555",
    cursor: "pointer",
    padding: "0 0.5rem",
    display: "flex",
    alignItems: "center",
  };

  const historyStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 5px)", // Position below the search bar area
    left: "0", // Align with parent (searchBarStyle padding will handle offset)
    right: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 1000, // Ensure it's above other content within header
    maxHeight: "200px",
    overflowY: "auto",
  };

  const historyItemStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    fontSize: "0.9rem",
  };

  return (
    <div style={searchBarStyle}>
      <div style={inputRowStyle}>
        {" "}
        {/* Wrapper for input and icons only */}
        <div style={inputContainerStyle}>
          {searchTerm && (
            <span
              onClick={handleSearch}
              style={{ ...iconStyle, color: "#0071dc" }}
              title="Search"
            >
              🔍
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for weekly sale items"
            style={inputStyle}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            // onBlur is implicitly handled by setIsFocused(false) from overlay or search action
          />
          {searchTerm && (
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
      {isFocused && searchHistory.length > 0 && (
        <div style={historyStyle}>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              style={historyItemStyle}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur before click registers
                handleHistoryItemClick(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
      {/* Blurred overlay will be handled potentially outside this component */}
    </div>
  );
};

export default SearchBar;
