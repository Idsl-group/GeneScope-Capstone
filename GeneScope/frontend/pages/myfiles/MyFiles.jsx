import React, { useState, useEffect } from "react";
import { list, remove, getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import "./MyFiles.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";
import fileLogo from "../../assets/google-docs.png";
import Popup from "../../pages/popup/Popup"; 
import Swal from "sweetalert2";


const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [inProgressFiles, setInProgressFiles] = useState([]);
  const [view, setView] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeButton, setActiveButton] = useState("all");
  const [feedback, setFeedback] = useState(""); 
  const [fileText, setFileText] = useState("");
  const [showPopup, setShowPopup] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 

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
    fetchInProgressFiles();
    fetchUserEmail();
  }, [setIsLoggedIn]);

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

        setFileNames(
          myFilesResult.items.map((item) => item.path.split("/").pop())
        );
        setProcessedFiles(
          processedFilesResult.items.map((item) => item.path.split("/").pop())
        );
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchInProgressFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/jobs?email=${userEmail}&status=In Progress`
        );
        if (!response.ok) throw new Error("Failed to fetch in-progress files");

        const jobs = await response.json();
        setInProgressFiles(jobs.map((job) => job.fileName)); 
      } catch (error) {
        console.error("Error fetching in-progress files:", error);
      }
    };

    fetchInProgressFiles();
  }, [userEmail]);

  const handleStartJob = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "question",
        text: `Please select a file first`,
        icon: "success",
        heightAuto: false
      });

      return;
    }

    try {
      const fileKey = `public/${userEmail}/my_files/${selectedFile}`;
      const returnLocationUrl = `https://tepnbg3j40.execute-api.us-east-1.amazonaws.com/dev/public/${userEmail}/processed_files/${selectedFile}`;

      const { url } = await getUrl({ path: fileKey });

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



      fetchInProgressFiles();

      Swal.fire({
        title: "Job Added",
        text: `Job added to queue successfully!`,
        icon: "success",
        heightAuto: false
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `An error occurred while starting the job.`,
        icon: "error",
        heightAuto: false
      });
    }
  };

  const fetchInProgressFiles = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/jobs?email=${userEmail}&status=In Progress`
      );
      if (!response.ok) throw new Error("Failed to fetch in-progress files");

      const jobs = await response.json();
      setInProgressFiles(jobs.map((job) => job.fileName)); 
    } catch (error) {
      console.error("Error fetching in-progress files:", error);
    }
  };

  const handleDelete = async (fileName) => {
    try {
      await remove({ path: `public/${userEmail}/my_files/${fileName}` });
      setFileNames((prevFileNames) =>
        prevFileNames.filter((name) => name !== fileName)
      );
      Swal.fire({
        title: "File Deleted",
        text: `File "${fileName}" has been deleted.`,
        icon: "success", 
        heightAuto: false
      });

    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `An error occurred while deleting the file.`,
        icon: "error", 
        heightAuto: false
      });
    }
  };

  const handleDeleteProcessed = async (fileName) => {
    try {
      await remove({ path: `public/${userEmail}/processed_files/${fileName}` });
      setProcessedFiles((prevFiles) =>
        prevFiles.filter((name) => name !== fileName)
      );
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `An error occurred while deleting the file.`,
        icon: "error", 
        heightAuto: false
      });
    }
  };

  const handleDownloadProcessedFiles = async (fileName) => {
    if (!fileName) {
      Swal.fire({
        title: "Error",
        text: "No file selected for download.",
        icon: "error",
        heightAuto: false
      });
      return;
    }
  
    try {
      const fileKey = `public/${userEmail}/processed_files/${fileName}`;
      const { url } = await getUrl({ path: fileKey });
      if (!url) {
        throw new Error("File URL not found");
      }
      window.open(url, "_blank");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `An error occurred while downloading the file: ${error.message}`,
        icon: "error",
        heightAuto: false
      });
    }
  };

  const handleDownloadAllFiles = async (fileName) => {
    if (!fileName) {
      Swal.fire({
        title: "Error",
        text: "No file selected for download.",
        icon: "error",
        heightAuto: false
      });
      return;
    }
  
    try {
      const fileKey = `public/${userEmail}/my_files/${fileName}`;
      const { url } = await getUrl({ path: fileKey });
      if (!url) {
        throw new Error("File URL not found");
      }
      window.open(url, "_blank");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `An error occurred while downloading the file: ${error.message}`,
        icon: "error",
        heightAuto: false
      });
    }
  };

  const handleProcessedFileSelection = async (file) => {
    setSelectedFile(file);
    setIsLoading(true); 

    if(!file) {
      Swal.fire({
        title: "Error",
        text: `Please select a file first`,
        icon: "error"
      });
      return;
    }

    try {
      const fileKey = `public/${userEmail}/processed_files/${file}`;
      const { url } = await getUrl({ path: fileKey });

      const response = await fetch(url);
      const fileText = await response.text();
      const firstRow = fileText.split("\n")[0];
      const parts = firstRow.split(",");
      if (parts.length < 3) {
        throw new Error("File does not contain the expected three values.");
      }
      const popularity = parseFloat(parts[0].trim());
      const stability = parseFloat(parts[1].trim());
      const structure = parseFloat(parts[2].trim());
  
      const pythonResponse = await fetch(
        "http://localhost:5000/generate-feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ popularity, stability, structure }),
        }
      );
      if (!pythonResponse.ok) {
        throw new Error("Python endpoint error");
      }
      const result = await pythonResponse.json();
      setFeedback(result.feedback);
      setFileText(fileText); 
      setShowPopup(true);
    } catch (error) {
      console.error("Error processing file:", error);
      Swal.fire({
        title: "Error",
        text: `An error occurred while processing the file.`,
        icon: "error", 
        heightAuto: false
      });

    } finally {
      setIsLoading(false); 
    }
  };

  if (!isLoggedIn) {
    return <h2>Please log in to view your files.</h2>;
  }

  let filteredFiles = [];
  if (view === "processed") {
    filteredFiles = processedFiles;
  } else if (view === "waiting") {
    filteredFiles = inProgressFiles; 
  } else {
    filteredFiles = fileNames; 
  }

  const getFileNameWithoutExtension = (fileName) => {
    return fileName.replace(/\.[^/.]+$/, "");
  };

  const truncateFileName = (fileName, maxLength = 10) => {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + "...";
    }
    return fileName;
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

          <div className="view-buttons glass">
            <button
              className={`file-button ${
                activeButton === "all" ? "active" : ""
              }`}
              onClick={() => {
                setView("all");
                setActiveButton("all");
                setSelectedFile(null);
              }}
            >
              All Files
            </button>
            <button
              className={`file-button ${
                activeButton === "waiting" ? "active" : ""
              }`}
              onClick={() => {
                setView("waiting");
                setActiveButton("waiting");
                setSelectedFile(null);
              }}
            >
              Files In Progress
            </button>
            <button
              className={`file-button ${
                activeButton === "processed" ? "active" : ""
              }`}
              onClick={() => {
                setView("processed");
                setActiveButton("processed");
                setSelectedFile(null);
              }}
            >
              Processed Files
            </button>
          </div>

          <div className="file-grid-container">
            <div className="file-grid glass">
              {filteredFiles.length > 0 ? (
                <>
                  {filteredFiles.map((file, index) => (
                    <div
                      className={`file-item ${
                        selectedFile === file ? "selected" : ""
                      }`}
                      key={index}
                      onClick={() => setSelectedFile(selectedFile === file ? null : file)}
                    >
                      {selectedFile === file && view !== "waiting" && (
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file);
                            handleDeleteProcessed(file);
                          }}
                        >
                          X
                        </button>
                      )}
                      <img
                        className="file-icon"
                        src={fileLogo}
                        alt="file icon"
                      />
                      <span
                        className={`file-name ${
                          selectedFile === file && getFileNameWithoutExtension(file).length > 15
                            ? "small-font"
                            : ""
                        }`}
                      >
                        {selectedFile === file
                          ? getFileNameWithoutExtension(file)
                          : truncateFileName(getFileNameWithoutExtension(file))}
                      </span>
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
            {view !== "waiting" && (
              <>
                {view === "processed" ? (
                  <>
                    <button
                      className="start-job-button glass"
                      onClick={() => handleProcessedFileSelection(selectedFile)}
                      disabled={!selectedFile}
                    >
                      Generate Feedback
                    </button>
                    <button
                      className="download-button glass"
                      onClick={() => handleDownloadProcessedFiles(selectedFile)}
                      disabled={!selectedFile}
                    >
                      Download Processed File
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="start-job-button glass"
                      onClick={handleStartJob}
                      disabled={!selectedFile}
                    >
                      Start Job
                    </button>
                    <button
                      className="download-button glass"
                      onClick={() => handleDownloadAllFiles(selectedFile)}
                      disabled={!selectedFile}
                    >
                      Download File
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {showPopup && (
        <Popup
          feedback={feedback}
          fileText={fileText} 
          onClose={() => setShowPopup(false)}
        />
      )}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
