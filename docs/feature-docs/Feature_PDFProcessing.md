# PDF Processing Architecture Plan

## Overview

This document outlines the architecture for processing PDF files containing grocery advertisements using the Google Gemini API for direct data extraction, with backend processing and storage in Supabase (PostgreSQL).

## Technology Stack

- **Google Gemini API**: For direct PDF content extraction
- **Supabase**: Database storage (PostgreSQL)
- **FastAPI**: API endpoints for upload and processing logic
- **LangChain**: Potentially used for interacting with Gemini API and managing prompts/output parsing (Optional)
- **LangSmith**: Monitoring and debugging (Optional)

## Architecture Components

### 1. Core Processing Components

```mermaid
graph TD
    A[PDF Upload] --> B[Backend API (FastAPI)]
    B --> C[Gemini API Call (with PDF)]
    C --> D[Backend Processing (Parse Response)]
    D --> E[Data Validator]
    E --> F[Database Upload (Supabase)]
```

#### Gemini API Interaction

- The backend receives the PDF file.
- The entire PDF file is sent to the Google Gemini API (likely a multimodal model capable of handling PDFs).
- A specific prompt instructs Gemini to extract relevant information based on a defined schema.
- Example Schema (conceptual):
  ```python
  # Schema definition to guide Gemini's extraction
  schema = {
      "properties": {
          "retailer": {"type": "string", "description": "Name of the grocery retailer"},
          "weekly_ad": {
              "type": "object",
              "properties": {
                  "start_date": {"type": "string", "format": "date"},
                  "end_date": {"type": "string", "format": "date"}
              }
          },
          "products": {
              "type": "array",
              "items": {
                  "type": "object",
                  "properties": {
                      "name": {"type": "string"},
                      "price": {"type": "number"},
                      "description": {"type": "string", "description": "Optional details or unit size"}
                  },
                  "required": ["name", "price"]
              }
          }
      },
      "required": ["retailer", "weekly_ad", "products"]
  }
  # Note: Actual interaction might involve LangChain's Gemini integration or direct API calls.
  ```

### 2. Data Processing Pipeline

```python
# Conceptual representation
class GroceryAdProcessor:
    def __init__(self):
        # Initialize Gemini client (or LangChain equivalent)
        self.gemini_client = initialize_gemini_client()
        self.output_parser = OutputParser() # Assuming a parser for Gemini's response

    async def process_pdf(self, pdf_file_path: str):
        # 1. Send PDF to Gemini API
        # This might involve reading the file content first
        try:
            # Placeholder for the actual API call
            raw_results = await self.gemini_client.process_document(
                file_path=pdf_file_path,

                prompt="Extract grocery ad data according to the provided schema."
                # Potentially pass schema definition here
            )
        except Exception as e:
            # Handle API errors (network, authentication, rate limits, etc.)
            print(f"Error calling Gemini API: {e}")
            # Implement retry logic or failure handling
            return

        # 2. Parse and validate results from Gemini
        try:
            structured_data = self.output_parser.parse(raw_results)
            # Add validation logic here against the expected schema
        except Exception as e:
            # Handle parsing/validation errors
            print(f"Error parsing/validating Gemini response: {e}")
            return

        # 3. Upload to database
        await self.upload_to_supabase(structured_data)

    async def upload_to_supabase(self, data):
        # Implementation for database insertion
        pass

# Helper function for initializing Gemini client (replace with actual implementation)
def initialize_gemini_client():
    # Load API keys, set up client object
    pass

# Placeholder for an output parser class
class OutputParser:
    def parse(self, raw_data):
        # Logic to convert raw Gemini response (e.g., JSON) into application data structure
        pass
```

### 3. Monitoring with LangSmith

LangSmith integration can still provide value:

- Trace visualization of the backend processing flow, including the call to Gemini.
- Performance metrics for the Gemini API call and subsequent processing.
- Debug capabilities for parsing and validation steps.
- Cost tracking for Gemini API usage.

```python
# Configuration remains the same if LangSmith is used
import os
from langsmith import Client

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
# Ensure LANGCHAIN_PROJECT is set if needed
# os.environ["LANGCHAIN_PROJECT"] = "your-project-name"
```

### 4. FastAPI Integration

The FastAPI endpoint remains similar, handling the upload and triggering the background task.

```python
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
import shutil # For saving the uploaded file

app = FastAPI()

@app.post("/process-pdf/")
async def upload_and_process_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Save the uploaded PDF temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    processor = GroceryAdProcessor()

    # Add processing to background tasks
    # Pass the path to the saved file
    background_tasks.add_task(processor.process_pdf, temp_file_path)
    # Consider adding a cleanup task for the temp file

    return {"status": "Processing started", "filename": file.filename}

# Define GroceryAdProcessor and other necessary components elsewhere
# Ensure proper error handling for file operations
```

## Data Flow

1.  **PDF Upload & Preparation**

    - PDF uploaded via FastAPI endpoint.
    - The backend saves the uploaded PDF file to a temporary location on the server (e.g., DigitalOcean droplet).
    - A background task is created for processing.

2.  **Gemini API Processing**

    - The background task initiates the `GroceryAdProcessor`.
    - The processor sends the entire PDF file (or its content) to the Google Gemini API with instructions (prompt) for data extraction.

3.  **Response Handling & Validation**

    - Gemini API processes the PDF and returns the extracted data (likely in JSON format).
    - The backend receives the response.
    - The response is parsed and validated against the expected data schema.

4.  **Data Storage**
    - Validated data is structured and stored in the Supabase (PostgreSQL) database in the correct order:
      1.  Retailer
      2.  Weekly Ad
      3.  Products (batch insert likely)

## Error Handling & Monitoring

1.  **LangSmith Monitoring** (If used)

    - Track overall processing time per PDF.
    - Monitor Gemini API call latency and token usage.
    - Debug issues in API interaction, response parsing, or validation.

2.  **Error Recovery**
    - Implement retries for transient Gemini API errors (e.g., network issues, rate limits).
    - Handle errors from Gemini (e.g., inability to process the PDF, malformed responses).
    - Validate the structure and content of the data returned by Gemini before database insertion.
    - Implement robust error logging.
    - Consider strategies for handling PDFs that consistently fail processing (e.g., moving to a failed queue).
    - Database transaction management for reliable data insertion.

## Implementation Phases

### Phase 1: Basic Integration

1. Set up FastAPI endpoint for PDF upload.
2. Implement the core logic to send PDF to Gemini API.
3. Implement basic parsing of the Gemini response.
4. Set up Supabase tables and implement data insertion.

### Phase 2: Robustness & Monitoring

1. Implement comprehensive error handling for API calls and data parsing/validation.
2. Add retry logic for API calls.
3. Integrate LangSmith (optional) for monitoring and debugging.
4. Implement database transaction management.

### Phase 3: Optimization & Production Readiness

1. Optimize Gemini API prompts for accuracy and cost.
2. Add performance monitoring and logging.
3. Implement security best practices (API key management, input validation).
4. Consider adding user feedback mechanisms or progress updates.

## Configuration Needs

1.  **Gemini API Setup**

    - API Key management and security.
    - Selection of the appropriate Gemini model (considering capabilities and cost).
    - Prompt engineering and refinement.

2.  **LangSmith Setup** (Optional)

    - API key configuration.
    - Project setup for monitoring.
    - Alert configuration based on metrics or errors.

3.  **Supabase Configuration**

    - Connection details (URL, key).
    - Table schemas definition.
    - Access controls and database user setup.

4.  **FastAPI/Backend**
    - Server resource allocation (memory, disk for temporary files).
    - Configuration for background task processing.

## Questions to Consider

1.  Which specific Gemini model offers the best balance of PDF understanding, structured data extraction accuracy, and cost for this task?
2.  What are the Gemini API rate limits, and how should we handle them?
3.  How reliable is Gemini's data extraction for varied PDF layouts? What fallback or validation is needed?
4.  Should we implement streaming responses from Gemini if available and beneficial?
5.  What monitoring metrics (e.g., API latency, success rate, cost per PDF) are most critical?
6.  Do we need real-time progress updates for the user during background processing?
7.  How should temporary PDF files be managed and cleaned up securely?
