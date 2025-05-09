import { useState } from "react";
import "./App.css";
import { api } from "./services/api";
// import { PdfUpload } from "./components/pdf-upload"; // Commenting out for now
import Header from "./components/Header";
import MainContent from "./components/MainContent";
// import BottomNav from "./components/BottomNav";

function App() {
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

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

  return (
    <div className="app-container">
      <Header />
      <MainContent>
        {/* Content will go here, for now, let's keep the test backend button */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={fetchBackendMessage}>Test Backend Connection</button>
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
      {/* <BottomNav /> */}
    </div>
  );
}

export default App;
