import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import HomePage from "../frontend/pages/homepage/HomePage";
import Authentication from "../frontend/pages/authentication/authentication";
import FileUploadPage from "../frontend/pages/fileupload/FileUploadPage";
import MyFiles from "../frontend/pages/myfiles/MyFiles";
import AccountChange from "../frontend/pages/account/AccountChange";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      setIsLoggedIn(!!tokens?.accessToken); // Set login state based on token existence
    } catch (err) {
      console.log("Error fetching session:", err);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/authentication" element={<Authentication setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/fileupload" element={isLoggedIn ? <FileUploadPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/> : <Navigate to="/authentication" />} />
        <Route path="/myfiles" element={isLoggedIn ? <MyFiles isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/> : <Navigate to="/authentication" />} />
        <Route path="/account" element={isLoggedIn ? <AccountChange isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/> : <Navigate to="/authentication" />} />
      </Routes>
    </Router>
  );
}

export default App;