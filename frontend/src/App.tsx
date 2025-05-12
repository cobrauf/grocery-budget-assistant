import React, { useState, useEffect, createContext, useContext } from "react";
import "./styles/App.css";
import { api } from "./services/api";
// import { PdfUpload } from "./components/pdf-upload"; // Commenting out for now
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import BottomNav from "./components/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import FullOverlay from "./components/common/FullOverlay";
// import { themes, Theme, DEFAULT_THEME_NAME } from "./styles/themes"; // Removed, handled by hook
// import { availableFonts } from "./styles/fonts"; // Removed, handled by hook
import { Product, SearchResponse } from "./types/product"; // Import product types
import { useThemeManager } from "./hooks/useThemeManager"; // Import theme hook
import { useSearch } from "./hooks/useSearch"; // Import search hook

// Theme Context
interface ThemeContextType {
  themeName: string;
  setThemeName: (themeName: string) => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Search Context (Optional - for now pass as props, can refactor later if needed)
// interface SearchContextType {
//   searchQuery: string;
//   searchResults: Product[];
//   isLoadingSearch: boolean;
//   searchError: string | null;
//   performSearch: (query: string, page?: number) => Promise<void>;
// }

function App() {
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [currentThemeName, setCurrentThemeName] = useState<string>(() => { // Moved to hook
  //   return localStorage.getItem("appTheme") || DEFAULT_THEME_NAME;
  // });
  // const [currentFont, setCurrentFont] = useState(() => { // Moved to hook
  //   const savedFont = localStorage.getItem("appFont");
  //   return savedFont ? JSON.parse(savedFont) : availableFonts[0];
  // });

  // Use custom hooks
  const { currentThemeName, setCurrentThemeName, currentFont, setCurrentFont } =
    useThemeManager();
  const {
    searchQuery,
    setSearchQuery, // Use this to clear search if needed
    searchResults,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    // currentPage, // Not directly used in App component render
  } = useSearch();

  // New state for search // Moved to useSearch hook
  // const [searchQuery, setSearchQuery] = useState<string>("");
  // const [searchResults, setSearchResults] = useState<Product[]>([]);
  // const [totalResults, setTotalResults] = useState<number>(0);
  // const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  // const [searchError, setSearchError] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);

  // Update font in localStorage and CSS when it changes // Moved to useThemeManager hook
  // useEffect(() => {
  //   localStorage.setItem("appFont", JSON.stringify(currentFont));
  //   document.documentElement.style.setProperty(
  //     "--current-font-family",
  //     currentFont.family
  //   );
  // }, [currentFont]);

  // Apply theme colors as CSS variables to body // Moved to useThemeManager hook
  // useEffect(() => {
  //   const selectedTheme =
  //     themes.find((t) => t.name === currentThemeName) ||
  //     themes.find((t) => t.name === DEFAULT_THEME_NAME);
  //   if (selectedTheme) {
  //     localStorage.setItem("appTheme", selectedTheme.name);
  //     const root = document.documentElement; // Or document.body
  //     // Example: root.style.setProperty('--theme-background', selectedTheme.colors.background);
  //     // More robust: Iterate over theme colors
  //     for (const [key, value] of Object.entries(selectedTheme.colors)) {
  //       const cssVarName = `--theme-${key
  //         .replace(/([A-Z])/g, "-$1")
  //         .toLowerCase()}`;
  //       root.style.setProperty(cssVarName, value);
  //     }
  //   }
  // }, [currentThemeName]);

  const fetchBackendMessage = async () => {
    try {
      const response = await api.get("/");
      const data = response.data;
      setBackendMessage(data.message);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000); // Keep message for 3 seconds
    } catch (error) {
      setBackendMessage("Error connecting to backend: " + String(error));
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      console.error("Error fetching backend message:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add/remove class to body to prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll"); // Cleanup on unmount
    };
  }, [isSidebarOpen]);

  // Function to handle initiating a new search (e.g., from Header)
  const handleNewSearch = (query: string) => {
    performSearch(query, 1); // Always start from page 1 for a new search term
  };

  // Function to clear search results and query
  const clearSearch = () => {
    setSearchQuery("");
    // The useSearch hook handles clearing results internally when query is empty or performSearch(query, 1) is called
    // Optionally, explicitly clear results if needed:
    // setSearchResults([]);
    // setTotalResults(0);
    // setHasMoreResults(false);
    // setCurrentPage(1);
  };

  return (
    <ThemeContext.Provider
      value={{ themeName: currentThemeName, setThemeName: setCurrentThemeName }}
    >
      <div className="app-container">
        <Header
          onMenuClick={toggleSidebar}
          onSearch={handleNewSearch} // Use the new handler
          isLoadingSearch={isLoadingSearch} // Pass loading state from useSearch hook
          onClearSearch={clearSearch} // Pass function to clear search
          initialSearchQuery={searchQuery} // Pass current query to potentially prefill
        />
        <MainContent
          searchQuery={searchQuery}
          searchResults={searchResults}
          totalResults={totalResults}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          hasMoreResults={hasMoreResults}
          loadMoreResults={loadMoreResults} // Pass loadMore from useSearch hook
        >
          {/* Test backend button - this will be conditionally hidden when search results are shown */}
          {!searchQuery && !searchResults.length && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button onClick={fetchBackendMessage}>
                Test Backend Connection
              </button>
              {showMessage && (
                <p
                  className={`backend-message ${
                    backendMessage.startsWith("Error") ? "error" : "success"
                  }`}
                >
                  {backendMessage}
                </p>
              )}
            </div>
          )}
          {/* <PdfUpload /> */} {/* Commenting out PdfUpload for now */}
        </MainContent>
        {/* <BottomNav /> */}
        <SideBar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          currentThemeName={currentThemeName}
          onSelectTheme={setCurrentThemeName}
          currentFont={currentFont}
          onSelectFont={setCurrentFont}
        />
        <FullOverlay isOpen={isSidebarOpen} onClick={toggleSidebar} />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
