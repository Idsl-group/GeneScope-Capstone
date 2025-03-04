import React, { useState, useEffect } from "react";
import { list, remove } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import "./MyFiles.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";

const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [view, setView] = useState("all"); // State to manage the current view

  // Fetch the user's email when the component loads and set the user as logged in
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { signInDetails } = await getCurrentUser();
        console.log("User Email:", signInDetails.loginId);
        setUserEmail(signInDetails.loginId);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error fetching user email:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUserEmail();
  }, [setIsLoggedIn]);

  // Fetch file names from S3 for the logged-in user
  useEffect(() => {
    const fetchFiles = async () => {
      if (!userEmail) return;

      try {
        const result = await list({
          path: `public/${userEmail}/`, // S3 directory for the user's files
          options: { listAll: true },
        });

        // Extract only file names from the full path
        const allFiles = result.items.map((item) => item.path.split("/").pop());
        setFileNames(allFiles);
        console.log("Fetched Files:", allFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [userEmail]);

  // Handle file deletion
  const handleDelete = async (fileName) => {
    try {
      await remove({
        path: `public/${userEmail}/${fileName}`, // Full path to the file
        bucket: "genescopefilesec991-dev", // Replace with your bucket name
      });

      // Update the file list after deletion
      setFileNames((prevFileNames) =>
        prevFileNames.filter((name) => name !== fileName)
      );

      console.log(`File "${fileName}" removed successfully.`);
      alert(`File "${fileName}" has been deleted.`);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while deleting the file.");
    }
  };

  // Render message if the user is not logged in
  if (!isLoggedIn) {
    return (
      <div>
        <h2>Please log in to view your files.</h2>
      </div>
    );
  }

  // Filter files based on the current view
  const filteredFiles = fileNames.filter((file) => {
    if (view === "all") return true;
    if (view === "waiting") return file.includes("waiting"); // Adjust this condition based on your file naming convention
    if (view === "processed") return file.includes("processed"); // Adjust this condition based on your file naming convention
    return false;
  });

  return (
    <div className="file-section">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="myFilesPage">
      {/* Logo */}
      <img src={GeneScopeLogo} alt="Genescope Logo" className="logo-image" />
      <h2 className="page-title">My Files</h2>

      {/* View Buttons */}
      <div className="view-buttons">
        <button onClick={() => setView("all")}>All Files</button>
        <button onClick={() => setView("waiting")}>Files Waiting to be Processed</button>
        <button onClick={() => setView("processed")}>Processed Files</button>
      </div>

      {/* Files List */}
      <div className="file-grid-container">
        <div className="file-grid">
          <h2>{view === "all" ? "All Files" : view === "waiting" ? "Files Waiting to be Processed" : "Processed Files"}</h2>
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <div className="file-item" key={index}>
                <div className="file-icon">📄</div>
                <span>{file}</span>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(file)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <h3>No files available.</h3>
          )}
        </div>
      </div>
    </main>
    </div>
  );
};

export default MyFiles;