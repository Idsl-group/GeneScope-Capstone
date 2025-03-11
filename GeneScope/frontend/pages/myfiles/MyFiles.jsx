import React, { useState, useEffect } from "react";
import { list, remove, getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import "./MyFiles.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";
import fileLogo from "../../assets/google-docs.png";
import Popup from "../../pages/popup/Popup"; // Import your Popup component

const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [inProgressFiles, setInProgressFiles] = useState([]);
  const [view, setView] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeButton, setActiveButton] = useState("all");
  const [feedback, setFeedback] = useState(""); // Holds generated feedback
  const [showPopup, setShowPopup] = useState(false); // Controls popup visibility
  const [isLoading, setIsLoading] = useState(false); // Controls loading animation

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
    fetchInProgressFiles();
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

  // Fetch "In Progress" files from MongoDB
  useEffect(() => {
    if (!userEmail) return;

    const fetchInProgressFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/jobs?email=${userEmail}&status=In Progress`
        );
        if (!response.ok) throw new Error("Failed to fetch in-progress files");

        const jobs = await response.json();
        setInProgressFiles(jobs.map((job) => job.fileName)); // Extract file names
      } catch (error) {
        console.error("Error fetching in-progress files:", error);
      }
    };

    fetchInProgressFiles();
  }, [userEmail]);

  // Handle Start Job: Get file URL and send it to MongoDB server
  const handleStartJob = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      const fileKey = `public/${userEmail}/my_files/${selectedFile}`;
      const returnLocationUrl = `https://tepnbg3j40.execute-api.us-east-1.amazonaws.com/dev/public/${userEmail}/processed_files/${selectedFile}`;

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

      setFileNames((prevFileNames) =>
        prevFileNames.map((name) =>
          name === selectedFile ? `${name}-waiting` : name
        )
      );

      // Refresh in-progress files after job submission
      fetchInProgressFiles();

      alert("Job added to queue successfully!");
    } catch (error) {
      alert("An error occurred while starting the job.");
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
      setInProgressFiles(jobs.map((job) => job.fileName)); // Extract file names
    } catch (error) {
      console.error("Error fetching in-progress files:", error);
    }
  };

  // Delete a file from S3 (for my_files)
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

  // Delete a file from processed_files
  const handleDeleteProcessed = async (fileName) => {
    try {
      await remove({ path: `public/${userEmail}/processed_files/${fileName}` });
      setProcessedFiles((prevFiles) =>
        prevFiles.filter((name) => name !== fileName)
      );
    } catch (error) {
      alert("An error occurred while deleting the file.");
    }
  };

  // Download a processed file from S3
  const handleDownload = async (fileName) => {
    try {
      const fileKey = `public/${userEmail}/processed_files/${fileName}`;
      const { url } = await getUrl({ path: fileKey });
      window.open(url, "_blank");
    } catch (error) {
      alert("An error occurred while downloading the file.");
    }
  };

  // When a processed file is selected, fetch its content as a text file,
  // grab the first row, parse the comma-separated scores, and call the Python backend.
  const handleProcessedFileSelection = async (file) => {
    setSelectedFile(file);
    setIsLoading(true); // Show loading animation
    try {
      const fileKey = `public/${userEmail}/processed_files/${file}`;
      const { url } = await getUrl({ path: fileKey });

      // Fetch the file as text
      const response = await fetch(url);
      const fileText = await response.text();
      // Grab the first row and split by comma
      const firstRow = fileText.split("\n")[0];
      const parts = firstRow.split(",");
      if (parts.length < 3) {
        throw new Error("File does not contain the expected three values.");
      }
      const popularity = parseFloat(parts[0].trim());
      const stability = parseFloat(parts[1].trim());
      const structure = parseFloat(parts[2].trim());

      // Call your Python backend endpoint to run the GPT-2 code
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
      // Instead of using alert, set the feedback and show the popup
      console.log("Generated Feedback:\n", result.feedback);
      setFeedback(result.feedback);
      setShowPopup(true);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file.");
    } finally {
      setIsLoading(false); // Hide loading animation
    }
  };

  if (!isLoggedIn) {
    return <h2>Please log in to view your files.</h2>;
  }

  // Update the file list based on the selected view
  let filteredFiles = [];
  if (view === "processed") {
    filteredFiles = processedFiles;
  } else if (view === "waiting") {
    filteredFiles = inProgressFiles; // Use MongoDB files for "Processing Files"
  } else {
    filteredFiles = fileNames; // Default to My Files
  }

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

          {/* View Selection Buttons */}
          <div className="view-buttons glass">
            <button
              className={`file-button ${
                activeButton === "all" ? "active" : ""
              }`}
              onClick={() => {
                setView("all");
                setActiveButton("all");
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
              }}
            >
              Processing Files
            </button>
            <button
              className={`file-button ${
                activeButton === "processed" ? "active" : ""
              }`}
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
                      className={`file-item ${
                        selectedFile === file ? "selected" : ""
                      }`}
                      key={index}
                      // onClick={() => {
                      //   setSelectedFile(file);
                      //   if (view === "processed") {
                      //     handleProcessedFileSelection(file);
                      //   }
                      // }}
                      onClick={() => setSelectedFile(file)}
                    >
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
                      <img
                        className="file-icon"
                        src={fileLogo}
                        alt="file icon"
                      />
                      <span className="file-name">
                        {getFileNameWithoutExtension(file)}
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

          {/* Action Buttons */}
          <div className="action-buttons">
            {view === "processed" ? (
              <button
                className="start-job-button glass"
                onClick={() => handleProcessedFileSelection(selectedFile)}
                disabled={!selectedFile}
              >
                Generate Feedback
              </button>
            ) : (
              <button
                className="start-job-button glass"
                onClick={handleStartJob}
                disabled={!selectedFile}
              >
                Start Job
              </button>
            )}
          </div>
        </main>
      </div>
      {/* Render Popup when feedback is available */}
      {showPopup && (
        <Popup feedback={feedback} onClose={() => setShowPopup(false)} />
      )}
      {/* Render loading animation when isLoading is true */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
