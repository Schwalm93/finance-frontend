import React, { useState } from 'react';
import axios from 'axios';

import { toast } from "react-toastify";
import { Button } from 'react-bootstrap';
import {API_ENDPOINTS} from "../../api/apiConfig.ts";
import './FileHandler.css';

type FileHandlerProps = {
  onUploadSuccess?: () => void;
};

function FileHandler({ onUploadSuccess }: FileHandlerProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(API_ENDPOINTS.addTransactions, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("File upload completed!")
        onUploadSuccess?.();
      } catch (error) {
        toast.error("File could not be uploaded!")
        console.error('File upload failed:', error);
      }
    } else {
      toast.warn("No files selected")
      console.error('No file selected for upload.');
    }
  };

  return (
    <div className="file-handler">
      <div className="file-handler__copy">
        <h3>Datei auswählen</h3>
        <p>CSV oder Export-Datei wählen und anschließend direkt importieren.</p>
      </div>
      <div className="file-handler__controls">
        <input
          className="file-handler__input"
          type="file"
          onChange={handleFileChange}
        />
        <Button variant="dark" className="app-modal__button" onClick={handleUpload}>
          Upload starten
        </Button>
      </div>
    </div>
  );
}

export default FileHandler;
