import React from "react";
import "./Navbar.css";
import AccountLogo from "../assets/AccountLogo.svg";
import { useNavigate } from "react-router-dom";

function Navbar({ isLoggedIn }) {
  const navigate = useNavigate();

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

      <button className="nav-button" onClick={() => navigate('/')}>Home</button>
      {isLoggedIn ? (
        <>
          <button className="nav-button" onClick={() => navigate('/fileupload')}>File Upload</button>
          <button className="nav-button" onClick={() => navigate('/myfiles')}>My Files</button>
          <button className="nav-button" onClick={() => navigate('/account')}>Account</button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Navbar;