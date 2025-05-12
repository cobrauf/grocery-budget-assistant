import { useState, useEffect, createContext, useContext } from "react";
import "./styles/app.css";
import { api } from "./services/api";
// import { PdfUpload } from "./components/pdf-upload"; // Commenting out for now
import Header from "./components/Header";
import MainContent from "./components/MainContent";
// import BottomNav from "./components/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import FullOverlay from "./components/common/FullOverlay";
// import { Product, SearchResponse } from "./types/product"; // Import product types
import { useTheme as useAppTheme } from "./hooks/useTheme"; // Renamed import to avoid conflict
import { useSearch } from "./hooks/useSearch"; // Import search hook

// Theme Context
interface ThemeContextType {
  themeName: string;
  setThemeName: (themeName: string) => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

function App() {
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use custom hooks
  const { currentThemeName, setCurrentThemeName, currentFont, setCurrentFont } =
    useAppTheme();
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
  const handleNewSearch = async (query: string) => {
    await performSearch(query, 1); // Always start from page 1 for a new search term
  };

  // Function to clear search results and query
  const clearSearch = () => {
    setSearchQuery("");
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
