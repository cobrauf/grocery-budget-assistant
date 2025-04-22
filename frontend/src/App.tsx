import { useState, ChangeEvent } from "react";
import "./App.css";
import { api } from "./services/api";

function App() {
  const [count, setCount] = useState(0);
  const [backendMessage, setBackendMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadStatus("idle");
        setUploadMessage(`Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      } else {
        setSelectedFile(null);
        setUploadStatus("error");
        setUploadMessage("Error: Only PDF files are allowed.");
        // Clear the file input
        event.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a PDF file first.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Uploading...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus("success");
      setUploadMessage(response.data.message);
      setSelectedFile(null); // Clear selection after successful upload
      // Optionally clear the message after a delay
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadMessage("");
      }, 3000);
    } catch (error: any) {
      setUploadStatus("error");
      if (error.response) {
        setUploadMessage(`Upload failed: ${error.response.data.detail || error.message}`);
      } else {
        setUploadMessage(`Upload failed: ${error.message}`);
      }
      console.error("Error uploading file:", error);
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

      <div className="upload-section">
        <h2>Upload PDF Receipt</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          id="pdf-upload"
          style={{ display: 'none' }} // Hide default input
        />
        <label htmlFor="pdf-upload" className="upload-button">
          Choose PDF
        </label>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === "uploading"}
          className="upload-button"
        >
          {uploadStatus === "uploading" ? "Uploading..." : "Upload PDF"}
        </button>
        {uploadMessage && (
          <p className={`upload-message ${uploadStatus}`}>{uploadMessage}</p>
        )}
      </div>
    </div>
  );
}

export default App;
