import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../frontend/pages/homepage/HomePage'; // Corrected HomePage import
import Authentication from '../frontend/components/authentication'; // Corrected Authentication import

import { Amplify } from 'aws-amplify';

import config from './amplifyconfiguration.json';

Amplify.configure(config);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track user login state

  const handleAuthSuccess = () => {
    setIsAuthenticated(true); // Set user as authenticated
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/authentication" element={<Authentication />} />
        {/* Default route for the homepage */}
        {/* Protected route for authenticated users */}
        {/* <Route
          path="/protected"
          element={
            isAuthenticated ? (
              <p>Protected content for authenticated users</p>
            ) : (
              <Navigate to="/login" />
            )
          }
        /> *}

        {/* Route for custom authentication
          <Route path="/login" element={<Authentication onAuthSuccess={handleAuthSuccess} />} />
         */}
        
      </Routes>
    </Router>
  );
}