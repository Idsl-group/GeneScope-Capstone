// Popup.js
import React from "react";
import "./Popup.css";

const Popup = ({ feedback, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h1>Generated Feedback</h1>
        <pre className="popup-text">{feedback}</pre>
        <div class="close-button-container">
            <button class="close-button"onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;