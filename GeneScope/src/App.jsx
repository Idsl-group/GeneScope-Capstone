import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        <Route path="/" element={<HomePage />} />
        <Route path="/authentication" element={<Authentication />} />
        {isLoggedIn && (
          <>
            <Route path="/fileupload" element={<FileUploadPage isLoggedIn={isLoggedIn} />} />
            <Route path="/myfiles" element={<MyFiles isLoggedIn={isLoggedIn} />} />
            <Route path="/account" element={<AccountChange isLoggedIn={isLoggedIn} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;