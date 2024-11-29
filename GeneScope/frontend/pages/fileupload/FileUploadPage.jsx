import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "./FileUploadPage.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
//import { Auth } from "aws-amplify";
import Navbar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";

const FileUploadPage = ({ isLoggedIn }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  
  const onDrop = (acceptedFiles) => {
    setSelectedFiles([...selectedFiles, ...acceptedFiles]);
  };

  const handleDelete = (fileToDelete) => {
    setSelectedFiles(selectedFiles.filter((file) => file !== fileToDelete));
  };

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate('/authentication');
  //   }
  // }, [isLoggedIn, navigate]);

  // useEffect(() => {
  //   Auth.currentAuthenticatedUser()
  //     .then(() => setIsLoggedIn(true))
  //     .catch(() => setIsLoggedIn(false)); // Not signed in
  // }, []);

  // if (!isLoggedIn) {
  //   return navigate('/authentication');
  // }

  const handleSubmission = () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("Files", file);
    });

    fetch("YOUR_API_ENDPOINT", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    
    <div className="content">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="fileUploadPage">
        <img src={GeneScopeLogo} alt="Genescope Logo" className="logo" />
        <div className="dropzone-container">
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <div className="dropzone-icon">⬆️</div>
            <p>Drag & drop files here, or click to select files</p>
          </div>
          <div className="file-list-container">
            <div className="file-list">
              {selectedFiles.map((file, index) => (
                <div className="file-item" key={index}>
                  <div className="file-item-icon">📄</div>
                  <span>{file.name}</span>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(file)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <button className="upload-button" onClick={handleSubmission}>
              Upload
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileUploadPage;
