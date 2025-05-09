import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { api } from "./services/api";
// import { PdfUpload } from "./components/pdf-upload"; // Commenting out for now
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import BottomNav from "./components/BottomNav";
import SideBar from "./components/sidebar/SideBar";
import SearchOverlay from "./components/common/SearchOverlay";
import { themes, Theme, DEFAULT_THEME_NAME } from "./styles/themes"; // Import themes

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

function App() {
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    return localStorage.getItem("appTheme") || DEFAULT_THEME_NAME;
  });

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

  return (
    <ThemeContext.Provider
      value={{ themeName: currentThemeName, setThemeName: setCurrentThemeName }}
    >
      <div className="app-container">
        <Header onMenuClick={toggleSidebar} />
        <MainContent>
          {/* Content will go here, for now, let's keep the test backend button */}
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
          {/* <PdfUpload /> */} {/* Commenting out PdfUpload for now */}
        </MainContent>
        <BottomNav />
        <SideBar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          currentThemeName={currentThemeName}
          onSelectTheme={setCurrentThemeName}
        />
        {isSidebarOpen && <SearchOverlay onClick={toggleSidebar} />}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
