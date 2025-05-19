export interface Theme {
  name: string;
  colors: {
    // Global
    background: string; // App background
    text: string; // Default text color
    primary: string; // Primary action color (buttons, highlights)
    secondary: string; // Secondary action/info color

    // Header
    headerBackground: string;
    headerText: string;

    // Sidebar
    sidebarBackground: string;
    sidebarText: string;
    sidebarHighlight: string; // e.g., active menu item
    sidebarDivider: string;

    // Search Bar (within header)
    searchInputBackground: string;
    searchInputText: string;
    searchInputPlaceholder: string;

    // Bottom Navigation
    bottomNavBackground: string;
    bottomNavTextInactive: string;
    bottomNavTextActive: string;
    bottomNavIndicatorActive: string;

    // Sort Pills
    sortPillBackground: string;
    sortPillText: string;
    sortPillBackgroundActive: string;
    sortPillTextActive: string;
    // sortPillArrowColor: string;
    // sortPillArrowColorActive: string; // Added for active arrow if different

    // Add more specific component colors as needed
    // e.g., buttonBackground, cardBackground, etc.
  };
}

export const themes: Theme[] = [
  {
    name: "Light",
    colors: {
      background: "#F5EFFF",
      text: "#212529",
      primary: "#7b2cbf",
      secondary: "#6c757d",
      headerBackground: "#7b2cbf",
      headerText: "#ffffff",
      sidebarBackground: "#f8f9fa",
      sidebarText: "#212529",
      sidebarHighlight: "#7b2cbf",
      sidebarDivider: "#e0e0e0",
      searchInputBackground: "#ffffff",
      searchInputText: "#495057",
      searchInputPlaceholder: "#6c757d",
      bottomNavBackground: "#5a2a82",
      bottomNavTextInactive: "rgba(255, 255, 255, 0.7)",
      bottomNavTextActive: "#ffffff",
      bottomNavIndicatorActive: "#ffffff",
      // Light Theme Sort Pill Colors
      sortPillBackground: "#aeadad", // Light grey, distinct from page bg
      sortPillText: "#ffffff", // Darker grey text
      sortPillBackgroundActive: "#7b2cbf", // Primary color
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#495057", // Same as pill text
      // sortPillArrowColorActive: "#ffffff", // Same as active pill text
    },
  },
  {
    name: "Dark",
    colors: {
      background: "#1a1a1a",
      text: "#e0e0e0",
      primary: "#00aaff",
      secondary: "#8c959d",
      headerBackground: "#005bb5",
      headerText: "#ffffff",
      sidebarBackground: "#2c3e50", // Dark blue-grey
      sidebarText: "#ecf0f1",
      sidebarHighlight: "#3498db",
      sidebarDivider: "#34495e",
      searchInputBackground: "#252525",
      searchInputText: "#e0e0e0",
      searchInputPlaceholder: "#777777",
      bottomNavBackground: "#003f7f",
      bottomNavTextInactive: "rgba(220, 220, 220, 0.7)",
      bottomNavTextActive: "#ffffff",
      bottomNavIndicatorActive: "#00aaff",
      // Dark Theme Sort Pill Colors
      sortPillBackground: "#aeadad", // Dark grey
      sortPillText: "#ffffff", // Light text
      sortPillBackgroundActive: "#00aaff", // Primary color (blue)
      sortPillTextActive: "#ffffff", // Dark text on active
      // sortPillArrowColor: "#f8f9fa", // Same as pill text
      // sortPillArrowColorActive: "#1a1a1a", // Same as active pill text
    },
  },
  {
    name: "Pastel",
    colors: {
      background: "#fdf6f0", // Creamy background
      text: "#5d5d5d", // Dark grey text
      primary: "#f2a2a0", // Soft pink primary
      secondary: "#a0d2f2", // Soft blue secondary
      headerBackground: "#f2bfa0", // Peachy header
      headerText: "#ffffff",
      sidebarBackground: "#f0e2d2", // Light beige sidebar
      sidebarText: "#5d5d5d",
      sidebarHighlight: "#f2a2a0",
      sidebarDivider: "#d3c1b1",
      searchInputBackground: "#ffffff",
      searchInputText: "#5d5d5d",
      searchInputPlaceholder: "#a0a0a0",
      bottomNavBackground: "#e0a9a0",
      bottomNavTextInactive: "rgba(255, 255, 255, 0.75)",
      bottomNavTextActive: "#ffffff",
      bottomNavIndicatorActive: "#ffffff",
      // Pastel Theme Sort Pill Colors
      sortPillBackground: "#aeadad", // Light beige, same as sidebar
      sortPillText: "#ffffff", // Dark grey text
      sortPillBackgroundActive: "#f2a2a0", // Soft pink primary
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#5d5d5d", // Same as pill text
      // sortPillArrowColorActive: "#ffffff", // Same as active pill text
    },
  },
  {
    name: "Retro",
    colors: {
      background: "#d3d3d3", // Light Grey (Console body)
      text: "#212121", // Dark Grey/Black (Controller, D-pad)
      primary: "#cc0000", // Red (A/B Buttons, highlights)
      secondary: "#424242", // Dark Grey (Controller accents)

      headerBackground: "#424242", // Dark Grey (Controller body color)
      headerText: "#d3d3d3", // Light Grey (Console body color)

      sidebarBackground: "#c0c0c0", // Medium Grey (Slightly darker console body)
      sidebarText: "#212121", // Dark Grey/Black
      sidebarHighlight: "#cc0000", // Red
      sidebarDivider: "#616161", // A darker dividing line

      searchInputBackground: "#ffffff", // White/Off-white (Button text color)
      searchInputText: "#212121", // Dark Grey/Black
      searchInputPlaceholder: "#757575", // Medium Grey placeholder text
      bottomNavBackground: "#2a2a2a",
      bottomNavTextInactive: "rgba(200, 200, 200, 0.7)",
      bottomNavTextActive: "#e0e0e0",
      bottomNavIndicatorActive: "#cc0000",
      // Retro Theme Sort Pill Colors
      sortPillBackground: "#aeadad", // Medium-light grey
      sortPillText: "#ffffff", // Dark text
      sortPillBackgroundActive: "#cc0000", // Red (primary accent)
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#212121", // Dark arrow
      // sortPillArrowColorActive: "#ffffff", // White arrow on active
    },
  },
];

export const DEFAULT_THEME_NAME = "Light";
