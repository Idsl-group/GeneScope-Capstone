import React, { useState } from "react";
import "./MyFiles.css";
import GeneScopeLogo from '../../assets/GenescopeLogo.png';
import Navbar from "../../components/NavBar";

const MyFiles = ({ isLoggedIn, setIsLoggedIn }) => {
  const [activeTab, setActiveTab] = useState("All Files");

  const filesData = {
    "All Files": Array.from({ length: 10 }, (_, index) => `File ${index + 1}`),
    "In Progress": ["File 2", "File 4", "File 6"],
    Completed: ["File 1", "File 3", "File 5", "File 7"],
  };

  return (
    <div className="file-section">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      {/* Logo */}
      <div className="logo-container">
      <img
            src={GeneScopeLogo} // Replace with actual logo if available
            alt="Genescope Logo"
            className="logo"
          />
      </div>

      {/* Tabs with background */}
      <div className="tabs-wrapper">
        <div className="tabs-background"></div>
        <div className="tabs">
          {Object.keys(filesData).map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Files */}
      <div className="file-grid">
        {filesData[activeTab].map((file, index) => (
          <div className="file-item" key={index}>
            <div className="file-icon">📄</div>
            {file}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="logout">
        <button
          className="logout-button"
          onClick={() => alert("Logout functionality here")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MyFiles;
