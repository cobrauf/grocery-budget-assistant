import { useState, ChangeEvent, useEffect } from "react";
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
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);

  useEffect(() => {
    // Fetch PDF files on component mount
    fetchPdfFiles();
  }, []);

  const fetchPdfFiles = async () => {
    try {
      const response = await api.get("/list-pdfs");
      setPdfFiles(response.data.pdf_files);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  };

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
        setUploadMessage(
          `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
        );
        setSelectedPdfName(null); // Clear any previously selected PDF from dropdown
      } else {
        setSelectedFile(null);
        setUploadStatus("error");
        setUploadMessage("Error: Only PDF files are allowed.");
        // Clear the file input
        event.target.value = "";
      }
    }
  };

  const handleSelectPdf = (fileName: string) => {
    setSelectedPdfName(fileName);
    setSelectedFile(null); // Clear any file selected via input
    setShowDropdown(false);
    setUploadStatus("idle");
    setUploadMessage(`Selected existing file: ${fileName}`);
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
      
      // Refresh the PDF file list after successful upload
      fetchPdfFiles();
      
      // Optionally clear the message after a delay
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadMessage("");
      }, 3000);
    } catch (error: any) {
      setUploadStatus("error");
      if (error.response) {
        setUploadMessage(
          `Upload failed: ${error.response.data.detail || error.message}`
        );
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
          style={{ display: "none" }} // Hide default input
        />
        <div className="file-selection">
          <div className="pdf-selector">
            <label htmlFor="pdf-upload" className="upload-button">
              Choose PDF
            </label>
            <div className="pdf-dropdown-container">
              <button 
                className="dropdown-toggle" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                ▼
              </button>
              {showDropdown && (
                <div className="pdf-dropdown">
                  {pdfFiles.length > 0 ? (
                    pdfFiles.map((file) => (
                      <div 
                        key={file} 
                        className="pdf-dropdown-item"
                        onClick={() => handleSelectPdf(file)}
                      >
                        {file}
                      </div>
                    ))
                  ) : (
                    <div className="pdf-dropdown-item">No PDFs found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === "uploading"}
            className="upload-button"
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
        {uploadMessage && (
          <p className={`upload-message ${uploadStatus}`}>{uploadMessage}</p>
        )}
        {selectedPdfName && (
          <p className="selected-pdf">Using existing file: {selectedPdfName}</p>
        )}
      </div>
    </div>
  );
}

export default App;
