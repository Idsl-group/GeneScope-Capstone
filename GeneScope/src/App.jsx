import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../frontend/pages/homepage/HomePage'; // Corrected HomePage import
import Authentication from '../frontend/pages/authentication/authentication'; // Corrected Authentication import
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';

Amplify.configure(config);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/authentication" element={<Authentication />} />
      </Routes>
    </Router>
  );
}

