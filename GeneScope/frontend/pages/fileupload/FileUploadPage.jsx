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
    <div className="file-upload-content">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="fileUploadPage">
        <div className="file-upload-logo-container">
          <img src={GeneScopeLogo} alt="Genescope Logo" className="file-upload-logo-image" />
        </div>
        <h2>Upload DNA/RNA Files</h2>
        <div className="file-uploader-container glass">
          <FileUploader
            acceptedFileTypes={["*/*"]}
            accessLevel="public"
            path={`${userEmail}/my_files/`}
            maxFileCount={5}
            isResumable
            variation="drop"
            hasDragOverlay
            onSuccess={(result) => {
              console.log("File uploaded successfully:", result);
              alert("File uploaded successfully!");
            }}
            onError={(error) => {
              console.error("Error uploading file:", error);
              alert("File upload failed.");
            }}
            // onSelect={(event) => {
            //   // Wait a moment so Amplify adds the items.
            //   setTimeout(() => {
            //     const nameElems = document.querySelectorAll('.amplify-fileuploader__file__main p'); 
            //     nameElems.forEach((el) => {
            //       // Remove extension with a regex: everything after the last dot
            //       el.textContent = el.textContent.replace(/\.[^/.]+$/, "");
            //     });
            //   }, 0);
            // }}
          />
        </div>
      </main>
    </div>
  );
};

export default FileUploadPage;