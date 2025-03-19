import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";
import ResearchPaper from "../../assets/Learn More Research Paper.pdf";
import "./HomePage.css";

function HomePage({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      if (tokens && tokens.accessToken) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.log("Error checking session:", err);
      setIsLoggedIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="homepage">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="content">
        <section className="about-container">
          <div className="logo-container">
            <img src={GeneScopeLogo} alt="Genescope Logo" className="homepage-logo-image" />
          </div>

          <div className="about-content">
            <h2>About Us</h2>
            <div className="info-box glass">
              <p> The rapid expansion of genomics and bioinformatics has produced vast amounts of DNA sequence data. While this surge promises breakthroughs, it also poses challenges in data processing, analysis, and interpretation. Manual methods are time-consuming, resource-intensive, and require specialized expertise. As large datasets become commonplace, the demand for automated, scalable, and user-friendly platforms has never been greater. </p> 
              <p> Despite technological advancements, a seamless and accessible platform for non-experts to analyze DNA sequences remains elusive. Researchers face hurdles in uploading, managing, and processing files; most systems require multiple steps—such as file handling, chunking, clustering, and scoring—demanding substantial computational resources and time. A user-friendly system that automates these tasks and provides accurate, actionable insights is urgently needed. </p> 
              <p> Existing platforms often lack AI-driven insights to help interpret complex clustering and scoring outputs. The ability to generate human-readable summaries or visualizations from AI analysis would bridge the gap between raw data and actionable conclusions, significantly enhancing user experience. </p> 
              <p> Our proposed solution, GeneScope, meets these needs by offering an integrated, AI-powered DNA analysis platform. Users can upload sequence files, track processing, receive AI-driven analysis, and download results—all through a simple web interface. By leveraging advanced AI models, GeneScope delivers detailed, interpretable feedback drawn from clustering and scoring algorithms, making DNA data analysis both accessible and efficient. </p>
            </div>
            <button
              className="cta-button"
              onClick={() =>
                window.open(ResearchPaper, "_blank")
              }
            >
              Learn More About GeneScope 🧬
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;

