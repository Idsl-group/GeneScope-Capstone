import React, { useState, useEffect } from "react";
import { list, remove, getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import "./MyFiles.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";
import fileLogo from "../../assets/google-docs.png";

const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [view, setView] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeButton, setActiveButton] = useState("all");

  // Fetch user email when component loads
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { signInDetails } = await getCurrentUser();
        setUserEmail(signInDetails.loginId);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    fetchUserEmail();
  }, [setIsLoggedIn]);

  // Fetch file names from S3
  useEffect(() => {
    if (!userEmail) return;

    const fetchFiles = async () => {
      try {
        const myFilesResult = await list({
          path: `public/${userEmail}/my_files/`,
          options: { listAll: true },
        });
        const processedFilesResult = await list({
          path: `public/${userEmail}/processed_files/`,
          options: { listAll: true },
        });

        setFileNames(myFilesResult.items.map((item) => item.path.split("/").pop()));
        setProcessedFiles(processedFilesResult.items.map((item) => item.path.split("/").pop()));
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [userEmail]);

  // Handle Start Job: Get file URL and send it to MongoDB server
  const handleStartJob = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      const fileKey = `public/${userEmail}/my_files/${selectedFile}`;
      const returnLocationUrl = `public/${userEmail}/completed_files/`;

      // Fetch file URL from AWS S3
      const { url } = await getUrl({ path: fileKey });

      // Send job to MongoDB server
      const response = await fetch("http://localhost:3000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          fileName: selectedFile,
          fileUrl: url,
          returnLocationUrl: returnLocationUrl,
          status: "In Progress",
        }),
      });

      if (!response.ok) throw new Error("Failed to add job to queue");

      alert("Job added to queue successfully!");
    } catch (error) {
      alert("An error occurred while starting the job.");
    }
  };

  // Delete a file from S3
  const handleDelete = async (fileName) => {
    try {
      await remove({ path: `public/${userEmail}/my_files/${fileName}` });
      setFileNames((prevFileNames) =>
        prevFileNames.filter((name) => name !== fileName)
      );
      alert(`File "${fileName}" has been deleted.`);
    } catch (error) {
      alert("An error occurred while deleting the file.");
    }
  };

  // Download a file from S3
  const handleDownload = async (fileName) => {
    try {
      const fileKey = `public/${userEmail}/processed_files/${fileName}`;
      const { url } = await getUrl({ path: fileKey });
      window.open(url, "_blank");
    } catch (error) {
      alert("An error occurred while downloading the file.");
    }
  };

  if (!isLoggedIn) {
    return <h2>Please log in to view your files.</h2>;
  }

  const filteredFiles = fileNames.filter((file) => {
    if (view === "all") return true;
    if (view === "waiting") return file.includes("waiting");
    if (view === "processed") return file.includes("processed");
    return false;
  });

  const getFileNameWithoutExtension = (fileName) => {
    return fileName.replace(/\.[^/.]+$/, "");
  };

  return (
    <div className="my-files-content">
      <div className="file-section">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="myFilesPage">
          <div className="logo-container">
            
          <img
            src={GeneScopeLogo}
            alt="Genescope Logo"
            className="logo-image"
          />
          </div>
          <h2 className="page-title">My Files</h2>

          {/* View Buttons */}

          {/* View Buttons */}
          <div className="view-buttons glass">
            <button
              className={`file-button ${activeButton === "all" ? "active" : ""}`}
              onClick={() => {
                setView("all");
                setActiveButton("all");
              }}
            >
              All Files
            </button>
            <button
              className={`file-button ${activeButton === "waiting" ? "active" : ""}`}
              onClick={() => {
                setView("waiting");
                setActiveButton("waiting");
              }}
            >
              Processing Files
            </button>
            <button
              className={`file-button ${activeButton === "processed" ? "active" : ""}`}
              onClick={() => {
                setView("processed");
                setActiveButton("processed");
              }}
            >
              Processed Files
            </button>
          </div>

          {/* File List */}
          <div className="file-grid-container">
            <div className="file-grid glass">
              
              {filteredFiles.length > 0 ? (
                <>
                  {filteredFiles.map((file, index) => (
                    <div
                      className={`file-item  ${
                        selectedFile === file ? "selected" : ""
                      }`}
                      key={index}
                      onClick={() => setSelectedFile(file)}
                    >
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                      >
                        X
                      </button>
                      <img className="file-icon" src={fileLogo}></img>
                      
                      <span className="file-name">{getFileNameWithoutExtension(file)}</span>
                    </div>
                  ))}
                  
                </>
              ) : (
                <div className="no-files">
                <h3>No files available.</h3>
                </div>
              )}
            </div>
          </div>
          <div className="action-buttons">
                    <button
                      className="start-job-button glass"
                      onClick={handleStartJob}
                      disabled={!selectedFile}
                    >
                      Start Job
                    </button>
                  </div>
                
        </main>
      </div>
    </div>
  );
};

export default MyFiles;
