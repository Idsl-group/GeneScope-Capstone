import React from 'react';
import './HomePage.css';
import NavBar from '../../components/NavBar'; // Corrected NavBar import
import { useNavigate } from 'react-router-dom';
import GeneScopeLogo from '../../assets/GenescopeLogo.png';

//onClick={() => navigate('/login')}


function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {<NavBar />}
      <main className="content">
        <header className="header">
          <button
            className="login-signup-button"
            onClick={() => navigate('/authentication')}
          >
            Login/Sign Up
          </button>
        </header>
        <section className="about-section">
          <img
            src={GeneScopeLogo} // Replace with actual logo if available
            alt="Genescope Logo"
            className="logo-image"
          />
          <h2>About Us</h2>
          <div className="info-box">
            <p>The rapid advancement in genomics and bioinformatics has led to an unprecedented accumulation of DNA sequence data. While the availability of this data presents opportunities for groundbreaking discoveries, it also creates significant challenges in data processing, analysis, and interpretation. The traditional methods of manually analyzing DNA sequences are both time-consuming and resource-intensive, often requiring specialized tools and significant expertise. As more researchers and laboratories generate large datasets, the demand for automated, scalable, and user-friendly platforms has grown significantly.
              <br></br> <br></br>
              Despite the existing technological advancements, there remains a gap in providing a seamless and accessible platform for non-experts to analyze DNA sequences efficiently. Researchers and scientists often face difficulties in uploading, managing, and processing their DNA sequence files, with many platforms requiring specialized knowledge to use effectively. Additionally, the analysis of DNA sequences typically involves multiple steps, such as file handling, chunking, clustering, and scoring—each requiring significant computational power and time. Users need a platform that not only automates these processes but also delivers accurate, actionable insights in a user-friendly manner.
              <br></br> <br></br>
              Moreover, the current platforms often lack AI-driven insights to help users interpret complex results from clustering and scoring algorithms. The ability to provide meaningful, human-readable summaries or visualizations based on AI analysis would enhance the user experience and bridge the gap between raw data and actionable conclusions.
              <br></br> <br></br>
              Our proposed solution, GeneScope, addresses these challenges by building an integrated, AI-powered DNA analysis platform. It offers users the ability to upload DNA sequence files, track their processing, receive AI-driven analysis, and download the results. This system will leverage AI models to generate insights, providing users with detailed and interpretable feedback based on the clustering and scoring results, all within a simple and intuitive web interface.

            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
