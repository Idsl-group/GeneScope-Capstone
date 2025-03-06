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
        const result = await list({
          path: `public/${userEmail}/my_files/`,
          options: { listAll: true },
        });

        setFileNames(result.items.map((item) => item.path.split("/").pop()));
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [userEmail]);

  // Get file URL from S3
  const handleGetFileUrl = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      const fileKey = `public/${userEmail}/my_files/${selectedFile}`;
      const { url } = await getUrl({ path: fileKey });
      console.log(url);
    } catch (error) {
      alert("An error occurred while retrieving the file URL.");
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
        <img src={GeneScopeLogo} alt="Genescope Logo" className="logo-image" />
        <h2 className="page-title">My Files</h2>

        {/* View Buttons */}
        <div className="view-buttons">
          <button onClick={() => setView("all")}>All Files</button>
          <button onClick={() => setView("waiting")}>Files Waiting to be Processed</button>
          <button onClick={() => setView("processed")}>Processed Files</button>
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
                    className={`file-item ${selectedFile === file ? "selected" : ""}`}
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
                    onClick={handleGetFileUrl}
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