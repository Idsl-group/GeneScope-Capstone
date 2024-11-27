import React, { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import "./Navbar.css";
import AccountLogo from "../assets/AccountLogo.svg";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to retrieve the current session
  const currentSession = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      if (tokens && tokens.accessToken) {
        setIsLoggedIn(true); // User is signed in
      } else {
        setIsLoggedIn(false); // User is not signed in
      }
    } catch (err) {
      console.log("Error fetching session:", err);
      setIsLoggedIn(false); // Default to not signed in
    }
  };

  // Check session when the component mounts
  useEffect(() => {
    currentSession();
  }, []);

  return (
    <div className="navbar">
      <div className="logo">
        Genescope
        {isLoggedIn && (
          <div className="user-info">
            <img
              src={AccountLogo}
              alt="Account Logo"
              className="account-logo"
            />
            <span>Welcome, User</span>
          </div>
        )}
      </div>

      <button className="nav-button">Home</button>
      {isLoggedIn ? (
        <>
          <button className="nav-button">File Upload</button>
          <button className="nav-button">My Files</button>
          <button className="nav-button">Account</button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Navbar;