import React, { useState, useEffect, createContext, useContext } from "react";
import "./styles/App.css";
import { api } from "./services/api";
// import { PdfUpload } from "./components/pdf-upload"; // Commenting out for now
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import BottomNav from "./components/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import SearchOverlay from "./components/common/SearchOverlay";
import { themes, Theme, DEFAULT_THEME_NAME } from "./styles/themes"; // Import themes
import { availableFonts } from "./styles/fonts"; // Import fonts
import { Product, SearchResponse } from "./types/product"; // Import product types

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
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem("appTheme") || DEFAULT_THEME_NAME;
  });

  const [currentFont, setCurrentFont] = useState(() => {
    const savedFont = localStorage.getItem("appFont");
    return savedFont ? JSON.parse(savedFont) : availableFonts[0];
  });

  // New state for search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);

  // Update font in localStorage and CSS when it changes
  useEffect(() => {
    localStorage.setItem("appFont", JSON.stringify(currentFont));
    document.documentElement.style.setProperty(
      "--current-font-family",
      currentFont.family
    );
  }, [currentFont]);

  // Apply theme colors as CSS variables to body
  useEffect(() => {
    const selectedTheme =
      themes.find((t) => t.name === currentThemeName) ||
      themes.find((t) => t.name === DEFAULT_THEME_NAME);
    if (selectedTheme) {
      localStorage.setItem("appTheme", selectedTheme.name);
      const root = document.documentElement; // Or document.body
      // Example: root.style.setProperty('--theme-background', selectedTheme.colors.background);
      // More robust: Iterate over theme colors
      for (const [key, value] of Object.entries(selectedTheme.colors)) {
        const cssVarName = `--theme-${key
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      }
    }
  }, [currentThemeName]);

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

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;
    setIsLoadingSearch(true);
    setSearchError(null);
    if (page === 1) {
      setSearchResults([]);
      setSearchQuery(query);
    }
    setCurrentPage(page);

    try {
      const response = await api.get<Product[]>(
        `/data/products/search?q=${encodeURIComponent(query)}`
      );
      const products = response.data;

      setSearchResults((prevResults) =>
        page === 1 ? products : [...prevResults, ...products]
      );
      setTotalResults(products.length);
      setHasMoreResults(false); // Since backend doesn't support pagination yet
      setSearchQuery(query);
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      setSearchError(error.message || "Failed to fetch search results.");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ themeName: currentThemeName, setThemeName: setCurrentThemeName }}
    >
      <div className="app-container">
        <Header
          onMenuClick={toggleSidebar}
          onSearch={performSearch} // Pass performSearch to Header
          isLoadingSearch={isLoadingSearch} // Pass loading state
        />
        <MainContent
          searchQuery={searchQuery}
          searchResults={searchResults}
          totalResults={totalResults}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          hasMoreResults={hasMoreResults}
          loadMoreResults={() => {
            if (!isLoadingSearch && hasMoreResults) {
              performSearch(searchQuery, currentPage + 1);
            }
          }}
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
        <BottomNav />
        <SideBar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          currentThemeName={currentThemeName}
          onSelectTheme={setCurrentThemeName}
          currentFont={currentFont}
          onSelectFont={setCurrentFont}
        />
        {isSidebarOpen && <SearchOverlay onClick={toggleSidebar} />}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
