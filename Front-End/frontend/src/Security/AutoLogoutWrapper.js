import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAutoLogout from '../hooks/useAutoLogout';

const AutoLogoutWrapper = ({ children }) => {
  const navigate = useNavigate();

  useAutoLogout(() => {
    sessionStorage.clear();
    alert("Session expired due to inactivity.");
    navigate('/');
  });

  return <>{children}</>;
};

export default AutoLogoutWrapper;
