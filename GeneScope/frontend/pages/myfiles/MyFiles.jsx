import React, { useState, useEffect } from "react";
import { list, remove, getUrl } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import "./MyFiles.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";

const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [view, setView] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);

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

  return (
    <div className="content">
      <div className="file-section">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="myFilesPage">
          <img
            src={GeneScopeLogo}
            alt="Genescope Logo"
            className="logo-image"
          />
          <h2 className="page-title">My Files</h2>

          {/* View Buttons */}
          <div className="view-buttons">
            <button onClick={() => setView("all")}>All Files</button>
            <button onClick={() => setView("waiting")}>
              Files Waiting to be Processed
            </button>
            <button onClick={() => setView("processed")}>
              Processed Files
            </button>
          </div>

          {/* File List */}
          <div className="file-grid-container">
            <div className="file-grid">
              <h2>
                {view === "all"
                  ? "All Files"
                  : view === "waiting"
                  ? "Files Waiting to be Processed"
                  : "Processed Files"}
              </h2>
              {filteredFiles.length > 0 ? (
                <>
                  {filteredFiles.map((file, index) => (
                    <div
                      className={`file-item ${
                        selectedFile === file ? "selected" : ""
                      }`}
                      key={index}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="file-icon">📄</div>
                      <span>{file}</span>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="action-buttons">
                    <button
                      className="start-job-button"
                      onClick={handleStartJob}
                      disabled={!selectedFile}
                    >
                      Start Job
                    </button>
                  </div>
                </>
              ) : (
                <h3>No files available.</h3>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyFiles;
