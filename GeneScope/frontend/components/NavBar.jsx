import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <-- Import useLocation
import { signOut } from "aws-amplify/auth";
import "./NavBar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // <-- Get the current location

  // Sign-out functionality
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Toggles the side menu on/off
  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <div className="floating-navbar">
      {/* Logo / Brand */}
      <span className="nav-logo" onClick={() => navigate("/")}>
        Genescope
      </span>

      {/* Hamburger icon (only visible on smaller screens) */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div
        className={`nav-overlay ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>

      {/* Nav links - slide-out drawer on mobile */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        {/* Home button */}
        <button
          className={`nav-button ${
            location.pathname === "/" ? "active-tab" : ""
          }`}
          onClick={() => navigate("/")}
        >
          Home
        </button>

        {isLoggedIn && (
          <>
            <button
              className={`nav-button ${
                location.pathname === "/fileupload" ? "active-tab" : ""
              }`}
              onClick={() => navigate("/fileupload")}
            >
              File Upload
            </button>

            <button
              className={`nav-button ${
                location.pathname === "/myfiles" ? "active-tab" : ""
              }`}
              onClick={() => navigate("/myfiles")}
            >
              My Files
            </button>

            <button
              className={`nav-button ${
                location.pathname === "/account" ? "active-tab" : ""
              }`}
              onClick={() => navigate("/account")}
            >
              Account
            </button>
          </>
        )}

        {/* Log In / Log Out button - no active class logic */}
        <button
          className="nav-button"
          onClick={() =>
            isLoggedIn ? handleSignOut() : navigate("/authentication")
          }
        >
          {isLoggedIn ? "Log Out" : "Log In"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;





