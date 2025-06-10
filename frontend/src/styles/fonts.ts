// Available font families for the application
export const availableFonts = [
  {
    name: "System Default",
    family: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif`,
    style: "Modern & Clean",
  },
  // {
  //   name: "Georgia Serif",
  //   family: "Georgia, 'Times New Roman', Times, serif",
  //   style: "Classic Serif",
  // },
  // {
  //   name: "Palatino",
  //   family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  //   style: "Elegant Serif",
  // },
  {
    name: "Garamond",
    family: "Garamond, serif",
    style: "Traditional Serif",
  },
  // {
  //   name: "Modern Sans",
  //   family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //   style: "Modern Sans-Serif",
  // },
  // {
  //   name: "Arial",
  //   family: "Arial, Helvetica, sans-serif",
  //   style: "Clean Sans-Serif",
  // },
  // {
  //   name: "Trebuchet",
  //   family:
  //     "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
  //   style: "Friendly Sans-Serif",
  // },
  // {
  //   name: "Impact",
  //   family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  //   style: "Bold Display",
  // },
  {
    name: "Monospace",
    family: "'Courier New', Courier, monospace",
    style: "Technical",
  },
  // {
  //   name: "Comic",
  //   family: "'Comic Sans MS', 'Comic Sans', cursive",
  //   style: "Casual & Fun",
  // },
];

// Current font in use - Change this variable to switch fonts
export const currentFont = availableFonts[0];
