import { useEffect } from 'react';
/**
 * Automatically logs out the user after 1 minute of inactivity.
 * @param {Function} logoutCallback - Function to call when logging out.
 */
  //  const API_URL = process.env.REACT_APP_API_URL;
const useAutoLogout = (logoutCallback) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logoutCallback(); // Auto logout after inactivity
      }, 600000); // 1 minute
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer initially

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [logoutCallback]);
};

export default useAutoLogout;
