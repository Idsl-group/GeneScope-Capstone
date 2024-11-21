// src/Navbar.js

import React from 'react';
import './Navbar.css';
import AccountLogo from '../assets/AccountLogo.svg';

function Navbar({ isLoggedIn }) {
  console.log("isLoggedIn:test", isLoggedIn); // Debugging

  return (
    <div className="navbar">
      <div className="logo">
        Genescope
        {isLoggedIn && (
          <div className="user-info">
            <img src={AccountLogo} alt="Account Logo" className="account-logo" />
            Apurva Narayan
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