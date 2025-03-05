// import React, { useState } from "react";
// import "./Navbar.css";
// import AccountLogo from "../assets/AccountLogo.svg";
// import { useNavigate } from "react-router-dom";
// import { signOut } from "aws-amplify/auth";

// function Navbar({ isLoggedIn, setIsLoggedIn}) {
//   const navigate = useNavigate();

//   // Sign-out functionality
//   const handleSignOut = async () => {
//     try {
//       await signOut();
//       setIsLoggedIn(false);
//       navigate('/');
//     } catch (err) {
//       console.error("Error signing out:", err);
//     }
//   };

//   return (
//     <div className="navbar">
//       <div className="logo">
//         Genescope
//         {isLoggedIn && (
//           <div className="user-info">
//             <img
//               src={AccountLogo}
//               alt="Account Logo"
//               className="account-logo"
//             />
//             <span>Welcome, User</span>
//           </div>
//         )}
//       </div>

//       <button className="nav-button" onClick={() => navigate('/')}>Home</button>
//       {isLoggedIn ? (
//         <>
//           <button className="nav-button" onClick={() => navigate('/fileupload')}>File Upload</button>
//           <button className="nav-button" onClick={() => navigate('/myfiles')}>My Files</button>
//           <button className="nav-button" onClick={() => navigate('/account')}>Account</button>
//         </>
//       ) : (
//         <></>
//       )}
//       <button className="nav-button" onClick={() => (isLoggedIn ? handleSignOut() : navigate("/authentication"))}>{isLoggedIn ? "Log Out" : "Log In"}</button>
//     </div>
//   );
// }

// export default Navbar;

import React, { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      <div className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Nav links - slide-out drawer on mobile */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <button className="nav-button" onClick={() => navigate("/")}>
          Home
        </button>
        {isLoggedIn && (
          <>
            <button
              className="nav-button"
              onClick={() => navigate("/fileupload")}
            >
              File Upload
            </button>
            <button className="nav-button" onClick={() => navigate("/myfiles")}>
              My Files
            </button>
            <button className="nav-button" onClick={() => navigate("/account")}>
              Account
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



