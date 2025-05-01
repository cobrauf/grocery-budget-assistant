import { useState } from "react";
import "./App.css";
import { api } from "./services/api";
import { PdfUpload } from "./components/pdf-upload";

function App() {
  const [count, setCount] = useState(0);
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const fetchBackendMessage = async () => {
    try {
      const response = await api.get("/");
      const data = response.data;
      setBackendMessage(data.message);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000); // Fade message after 2 seconds
    } catch (error) {
      setBackendMessage("Error connecting to backend, error: " + error);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      console.error("Error fetching backend message:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="counter-card">
        <h1>Smart Grocery Budget Assistant</h1>
        <p>Test Counter: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={fetchBackendMessage}>Test Backend</button>
        {showMessage && <p className="backend-message">{backendMessage}</p>}
      </div>

      <PdfUpload />
    </div>
  );
}

export default App;
