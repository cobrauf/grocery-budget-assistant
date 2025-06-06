export interface Theme {
  name: string;
  colors: {
    // Global
    background: string; // App background
    text: string; // Default text color
    primary: string; // Primary action color (buttons, highlights)
    secondary: string; // Secondary action/info color
    marginBlockBackgroundGradientStart: string; // Renamed for desktop margin blocks gradient
    marginBlockBackgroundGradientEnd: string; // Added for desktop margin blocks gradient end color

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
    bottomNavItemActiveBackground: string; // Added for active tab background

    // Sort Pills
    sortPillBackground: string;
    sortPillText: string;
    sortPillBackgroundActive: string;
    sortPillTextActive: string;
    // sortPillArrowColor: string;
    // sortPillArrowColorActive: string; // Added for active arrow if different

    // Notification Colors
    warningBg: string;
    warningText: string;
    infoBg: string;
    infoText: string;

    // Add more specific component colors as needed
    // e.g., buttonBackground, cardBackground, etc.
  };
}

export const themes: Theme[] = [
  {
    name: "Light",
    colors: {
      background: "#F5EFFF", // Very light lavender
      text: "#212529", // Dark charcoal gray
      primary: "#7b2cbf", // Deep purple
      secondary: "#6c757d", // Medium gray
      headerBackground: "#7b2cbf", // Deep purple
      headerText: "#ffffff", // Pure white
      sidebarBackground: "#f8f9fa", // Very light gray
      sidebarText: "#212529", // Dark charcoal gray
      sidebarHighlight: "#7b2cbf", // Deep purple
      sidebarDivider: "#e0e0e0", // Light gray
      searchInputBackground: "#ffffff", // Pure white
      searchInputText: "#495057", // Dark gray
      searchInputPlaceholder: "#6c757d", // Medium gray
      bottomNavBackground: "#5a2a82", // Dark purple
      bottomNavTextInactive: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
      bottomNavTextActive: "#ffffff", // Pure white
      bottomNavIndicatorActive: "#ffffff", // Pure white
      bottomNavItemActiveBackground: "#7b2cbf", // Matches headerBackground
      // Light Theme Sort Pill Colors
      sortPillBackground: "#7d7d7d", // Light grey, distinct from page bg
      sortPillText: "#ffffff", // Darker grey text
      sortPillBackgroundActive: "#7b2cbf", // Primary color
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#495057", // Same as pill text
      // sortPillArrowColorActive: "#ffffff", // Same as active pill text e0e0e0
      marginBlockBackgroundGradientStart: "#7b2cbf", // Light gray for margin blocks
      marginBlockBackgroundGradientEnd: "#7A73D1", // Slightly darker for gradient 7b2cbf
      warningBg: "#fff3cd",
      warningText: "#856404",
      infoBg: "#d1ecf1",
      infoText: "#0c5460",
    },
  },
  {
    name: "Dark",
    colors: {
      background: "#1a1a1a", // Very dark gray
      text: "#e0e0e0", // Light gray
      primary: "#00aaff", // Bright blue
      secondary: "#8c959d", // Medium gray
      headerBackground: "#005bb5", // Dark blue
      headerText: "#ffffff", // Pure white
      sidebarBackground: "#2c3e50", // Dark blue-grey
      sidebarText: "#ecf0f1", // Very light gray
      sidebarHighlight: "#3498db", // Light blue
      sidebarDivider: "#34495e", // Dark gray-blue
      searchInputBackground: "#252525", // Dark gray
      searchInputText: "#e0e0e0", // Light gray
      searchInputPlaceholder: "#777777", // Medium gray
      bottomNavBackground: "#003f7f", // Very dark blue
      bottomNavTextInactive: "rgba(220, 220, 220, 0.7)", // Semi-transparent light gray
      bottomNavTextActive: "#ffffff", // Pure white
      bottomNavIndicatorActive: "#00aaff", // Bright blue
      bottomNavItemActiveBackground: "#005bb5", // Matches headerBackground
      // Dark Theme Sort Pill Colors
      sortPillBackground: "#7d7d7d", // Dark grey
      sortPillText: "#ffffff", // Light text
      sortPillBackgroundActive: "#00aaff", // Primary color (blue)
      sortPillTextActive: "#ffffff", // Dark text on active
      // sortPillArrowColor: "#f8f9fa", // Same as pill text
      // sortPillArrowColorActive: "#1a1a1a", // Same as active pill text
      marginBlockBackgroundGradientStart: "#333446", // Very dark gray for margin blocks
      marginBlockBackgroundGradientEnd: "#1f1f1f", // Subtly lighter for gradient
      warningBg: "#332701",
      warningText: "#ffc107",
      infoBg: "#032a33",
      infoText: "#17a2b8",
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
      headerText: "#ffffff", // Pure white
      sidebarBackground: "#f0e2d2", // Light beige sidebar
      sidebarText: "#5d5d5d", // Medium gray
      sidebarHighlight: "#f2a2a0", // Soft pink
      sidebarDivider: "#d3c1b1", // Light brown-beige
      searchInputBackground: "#ffffff", // Pure white
      searchInputText: "#5d5d5d", // Medium gray
      searchInputPlaceholder: "#a0a0a0", // Light gray
      bottomNavBackground: "#e0a9a0", // Muted peachy pink
      bottomNavTextInactive: "rgba(255, 255, 255, 0.75)", // Semi-transparent white
      bottomNavTextActive: "#ffffff", // Pure white
      bottomNavIndicatorActive: "#ffffff", // Pure white
      bottomNavItemActiveBackground: "#f2bfa0", // Matches headerBackground
      // Pastel Theme Sort Pill Colors
      sortPillBackground: "#7d7d7d", // Light beige, same as sidebar
      sortPillText: "#ffffff", // Dark grey text
      sortPillBackgroundActive: "#f2a2a0", // Soft pink primary
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#5d5d5d", // Same as pill text
      // sortPillArrowColorActive: "#ffffff", // Same as active pill text
      marginBlockBackgroundGradientStart: "#E6B2BA", // Light desaturated warm color for margin blocks
      marginBlockBackgroundGradientEnd: "#FBE4D6", // Subtly darker/desaturated for gradient
      warningBg: "#fef5e2",
      warningText: "#c58c00",
      infoBg: "#e2f5fe",
      infoText: "#007a99",
    },
  },
  {
    name: "Retro",
    colors: {
      background: "#d3d3d3", // Light Grey (Console body)
      text: "#212121", // Dark Grey/Black (Controller, D-pad)
      primary: "#D91656", // Red (A/B Buttons, highlights)
      secondary: "#424242", // Dark Grey (Controller accents)

      headerBackground: "#424242", // Dark Grey (Controller body color)
      headerText: "#d3d3d3", // Light Grey (Console body color)

      sidebarBackground: "#c0c0c0", // Medium Grey (Slightly darker console body)
      sidebarText: "#212121", // Dark Grey/Black
      sidebarHighlight: "#D91656", // Red
      sidebarDivider: "#616161", // A darker dividing line

      searchInputBackground: "#ffffff", // White/Off-white (Button text color)
      searchInputText: "#212121", // Dark Grey/Black
      searchInputPlaceholder: "#757575", // Medium Grey placeholder text
      bottomNavBackground: "#2a2a2a", // Very dark gray
      bottomNavTextInactive: "rgba(200, 200, 200, 0.7)", // Semi-transparent light gray
      bottomNavTextActive: "#e0e0e0", // Light gray
      bottomNavIndicatorActive: "#D91656", // Bright red
      bottomNavItemActiveBackground: "#424242", // Matches headerBackground
      // Retro Theme Sort Pill Colors
      sortPillBackground: "#7d7d7d", // Medium-light grey
      sortPillText: "#ffffff", // Dark text
      sortPillBackgroundActive: "#D91656", // Red (primary accent)
      sortPillTextActive: "#ffffff", // White text on active
      // sortPillArrowColor: "#212121", // Dark arrow
      // sortPillArrowColorActive: "#ffffff", // White arrow on active
      marginBlockBackgroundGradientStart: "#D4C9BE", // Medium gray for margin blocks
      marginBlockBackgroundGradientEnd: "#909090", // Slightly darker for gradient
      warningBg: "#3e1c00",
      warningText: "#ff8a65",
      infoBg: "#1a3a3a",
      infoText: "#4db6ac",
    },
  },
];

export const DEFAULT_THEME_NAME = "Light";
