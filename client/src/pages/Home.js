import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Build Meaningful Connections</h1>
          <p className="hero-subtitle">
            A modern platform that disrupts traditional networking.
            Book meetings with professionals, experts, and thought leaders.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
                <Link to="/search" className="btn btn-secondary btn-large">
                  Explore People
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/search" className="btn btn-secondary btn-large">
                  Explore People
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🎯 Direct Connections</h3>
              <p>Skip the endless scrolling. Book meetings directly with people who matter.</p>
            </div>
            <div className="feature-card">
              <h3>💰 Flexible Compensation</h3>
              <p>Offer monetary tips or in-kind services to increase your chances.</p>
            </div>
            <div className="feature-card">
              <h3>📊 Full Control</h3>
              <p>Set your availability, pricing, and meeting preferences your way.</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security.</p>
            </div>
            <div className="feature-card">
              <h3>🌐 Online or In-Person</h3>
              <p>Choose your meeting format with automatic Zoom integration.</p>
            </div>
            <div className="feature-card">
              <h3>📈 Track Your Success</h3>
              <p>View your acceptance rates and meeting statistics.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Building Connections?</h2>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-large">
              Create Your Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
