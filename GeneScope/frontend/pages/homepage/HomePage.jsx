import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import GeneScopeLogo from "../../assets/GenescopeLogo.png";
import Navbar from "../../components/NavBar";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is signed in
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

  // Sign-out functionality
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Run session check on component mount
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="homepage">
      {/* Conditionally render Navbar */}
      {isLoggedIn && <Navbar />}
      <main className="content">
      <header className="header">
          <button
            className="login-signup-button"
            onClick={() => (isLoggedIn ? handleSignOut() : navigate("/authentication"))}
          >
            {isLoggedIn ? "Log Out" : "Log In"}
          </button>
        </header>

        <section className="about-section">
          <img
            src={GeneScopeLogo} // Replace with actual logo if available
            alt="Genescope Logo"
            className="logo-image"
          />
          <h2>About Us</h2>
          <div class="info-box">
            <p>
              The rapid advancement in genomics and bioinformatics has led to an
              unprecedented accumulation of DNA sequence data. While the
              availability of this data presents opportunities for
              groundbreaking discoveries, it also creates significant challenges
              in data processing, analysis, and interpretation. The traditional
              methods of manually analyzing DNA sequences are both
              time-consuming and resource-intensive, often requiring specialized
              tools and significant expertise. As more researchers and
              laboratories generate large datasets, the demand for automated,
              scalable, and user-friendly platforms has grown significantly.
            </p>
            <p>
              Despite the existing technological advancements, there remains a
              gap in providing a seamless and accessible platform for
              non-experts to analyze DNA sequences efficiently. Researchers and
              scientists often face difficulties in uploading, managing, and
              processing their DNA sequence files, with many platforms requiring
              specialized knowledge to use effectively. Additionally, the
              analysis of DNA sequences typically involves multiple steps, such
              as file handling, chunking, clustering, and scoring—each requiring
              significant computational power and time. Users need a platform
              that not only automates these processes but also delivers
              accurate, actionable insights in a user-friendly manner.
            </p>
            <p>
              Moreover, the current platforms often lack AI-driven insights to
              help users interpret complex results from clustering and scoring
              algorithms. The ability to provide meaningful, human-readable
              summaries or visualizations based on AI analysis would enhance the
              user experience and bridge the gap between raw data and actionable
              conclusions.
            </p>
            <p>
              Our proposed solution, GeneScope, addresses these challenges by
              building an integrated, AI-powered DNA analysis platform. It
              offers users the ability to upload DNA sequence files, track their
              processing, receive AI-driven analysis, and download the results.
              This system will leverage AI models to generate insights,
              providing users with detailed and interpretable feedback based on
              the clustering and scoring results, all within a simple and
              intuitive web interface.
            </p>
          </div>
        </section>
        <button type="button" onClick={handleSignOut}>
          Log Out
        </button>
      </main>
    </div>
  );
}

export default HomePage;
