import React, { useState, useEffect } from "react";
import { FileUploader } from "@aws-amplify/ui-react-storage";
import { getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import "./FileUploadPage.css";

const FileUploadPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userEmail, setUserEmail] = useState("");

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

  if (!isLoggedIn) {
    return (
      <div>
        <h2>Please log in to upload files.</h2>
      </div>
    );
  }

  return (
    <div className="content">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="fileUploadPage">
        <img src={GeneScopeLogo} alt="Genescope Logo" className="logo-image" />
        <h2>Upload DNA/RNA Files</h2>
        <div className="file-uploader-container">
          <FileUploader
            acceptedFileTypes={["*/*"]}
            accessLevel="public"
            path={`${userEmail}/my_files/`}
            maxFileCount={5}
            isResumable
            onSuccess={(result) => {
              console.log("File uploaded successfully:", result);
              alert("File uploaded successfully!");
            }}
            onError={(error) => {
              console.error("Error uploading file:", error);
              alert("File upload failed.");
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default FileUploadPage;