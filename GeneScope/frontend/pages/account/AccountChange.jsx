import React from "react";
import "./AccountChange.css";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";

const AccountChange = ({ isLoggedIn, setIsLoggedIn }) => {

  return (
    <div className="account-page">
    <div className="account-change-page">
    <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
    <div className="update-password-container">
      {/* Top-right Logout Button */}
      {/* <div className="logout-button-container">
        <button className="logout-button">Logout</button>
      </div> */}

      <h1 className="update-password-title">Update Password</h1>
      {/* Logo and Title */}
      <img src={GeneScopeLogo} alt="Genescope Logo" className="logo-image"/>
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
  </div>
  );
};

export default AccountChange;
