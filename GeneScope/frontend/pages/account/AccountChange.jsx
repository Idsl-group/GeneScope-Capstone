import React from "react";
import "./AccountChange.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";

const AccountChange = ({ isLoggedIn, setIsLoggedIn }) => {

  return (
    <div className="account-change-page">
    <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
    <div className="update-password-container">
      {/* Top-right Logout Button */}
      {/* <div className="logout-button-container">
        <button className="logout-button">Logout</button>
      </div> */}

      {/* Logo and Title */}
      <div className="logo-container">
        <img
          src={GeneScopeLogo}
          alt="Genescope Logo"
          className="logo"
        />
      </div>
      <h1 className="update-password-title">Update Password</h1>

      {/* Form */}
      <form className="update-password-form">
        <input
          type="password"
          placeholder="Old Password"
          className="password-input"
        />
        <input
          type="password"
          placeholder="New Password"
          className="password-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="password-input"
        />
        <button type="submit" className="confirm-button">
          Confirm
        </button>
      </form>
    </div>
  </div>
  );
};

export default AccountChange;
