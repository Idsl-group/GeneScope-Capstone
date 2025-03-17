import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { signOut } from "aws-amplify/auth";
import "./NavBar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <div className="floating-navbar">
      <span className="nav-logo" onClick={() => navigate("/")}>
        Genescope
      </span>
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

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
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

            
          </>
        )}

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





