import React, { useState } from 'react';
import axios from 'axios';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from 'react-bootstrap';
import {API_ENDPOINTS} from "../../api/apiConfig.ts";

function FileHandler() {
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
    <div style={{ height: '70px' }} >
      <input className='m-3 mt-3 custom-file-input-lg' type="file" onChange={handleFileChange} />
      <Button variant="primary" onClick={handleUpload}>
          Upload
      </Button>
      <div>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
      />
      </div>
    </div>
  );
}

export default FileHandler;

