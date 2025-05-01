# Feature: PDF Upload with Success Notification

## Overview

This feature allows users to upload a PDF file to backedn and receive a confirmation message indicating that the upload was successful.

---

## Requirements

### Functional Requirements

1. **Upload to frontend**:

   - A button labeled "Upload PDF" should be present on the UI.
   - Clicking the button should open a file picker dialog to select a PDF file.
   - if the file format is pdf, allow upload to backend.
   - display a thumbnail of it after.

2. **upload to backend**:
   - during upload, show a "..." animation.
   - After a successful/failed upload, a text message should appear on the screen to inform the user that the upload was successful.
   - The message should disappear after a few seconds or when the user performs another action.

---

### Non-Functional Requirements

1. **File Validation**:

   - Only PDF files should be allowed for upload.
   - If a non-PDF file is selected, an error message should be displayed.

2. **Responsiveness**:

   - The feature should work seamlessly on both desktop and mobile devices.

---

## User Flow

1. The user clicks the "Upload PDF" button.
2. A file picker dialog appears.
3. The user selects a PDF file and confirms.
4. The system uploads the file to backend and shows thumb and file size.
5. If the upload fails, an error message is displayed instead.

---

## Technical Details

### Frontend

- **UI Components**:

  - A button for uploading the PDF.
  - A text area or toast notification for displaying the success message.

- **Validation**:
  - Ensure the selected file is a PDF before uploading.

### Backend

- **Endpoint**:

  - A POST endpoint to handle the file upload.
  - Validate the file type and size on the server.

- **Response**:
  - Return a success or error response to the frontend.

---

---

## Future Enhancements

1. Allow users to upload multiple PDFs at once.
2. Provide a preview of the uploaded PDF.
3. Add drag-and-drop functionality for file uploads.
