import React, { useState } from 'react';
import login from './Login'; // Handles API call
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo.jpg';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [welcomeUser, setWelcomeUser] = useState(null); // New state
  const navigate = useNavigate();
   const API_URL = process.env.REACT_APP_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedUser = await login(username, password); // Modified login returns user
      setWelcomeUser(loggedUser.username); // Set welcome message

      // Show welcome screen for 10 seconds
      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000); // 10000ms = 10 seconds
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  // Show welcome message if user just logged in
if (welcomeUser) {
  return (
    <div
      className="welcome-screen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
          padding: "3rem 4rem",
          textAlign: "center",
          maxWidth: "600px",
          width: "95%",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        <h1 style={{ color: "#c60000", fontSize: "36px", marginBottom: "1.5rem" }}>
          Welcome, {welcomeUser}!
        </h1>
        <p style={{ fontSize: "18px", color: "#374151", marginBottom: "3rem" }}>
          Redirecting to your dashboard...
        </p>

        <div className="clip-loader"></div>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .clip-loader {
              margin: 0 auto;
              width: 70px;
              height: 70px;
              border: 8px solid #f3f3f3;
              border-top: 8px solid #c60000;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}



  return (
    <>
      <div className="header">
        <img src={logo} alt="EnergyBridge Logo" />
      </div>

      <div className="login-box">
        <h1 className="Login-Title" align="center">Login</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />

          <label htmlFor="password">Password*</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <input type="submit" value="Submit" />
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="footer">
        © {new Date().getFullYear()} EnergyBridge. All rights reserved.
      </div>
    </>
  );
}

export default LoginForm;
