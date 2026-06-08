import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children, requiredPermission, adminOnly = false }) => {
  const [authorized, setAuthorized] = useState(null); // null = loading
  const location = useLocation();
   const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const checkAuthorization = async () => {
      const token = sessionStorage.getItem("token");
      const roleId = Number(sessionStorage.getItem("roleId"));

      if (!token) {
        setAuthorized(false);
        return;
      }

      if (adminOnly && roleId !== 1) {
        setAuthorized(false);
        return;
      }

      // Admins always have access
      if (roleId === 1) {
        setAuthorized(true);
        return;
      }

      if (!requiredPermission) {
        console.warn("No requiredPermission set for this route.");
        setAuthorized(false);
        return;
      }

      try {
        const { data: permissions } = await axios.get(
          `${API_URL}/api/UserRoles/permissions-for-user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("User permissions:", permissions);
        console.log("Required permission:", requiredPermission);
if (!requiredPermission) {
  console.warn("No requiredPermission set for this route.");
  setAuthorized(false);
  return;
}

        if (Array.isArray(permissions) && permissions.includes(requiredPermission)) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error("Permission check failed:", error);
        setAuthorized(false);
      }
    };

    checkAuthorization();
  }, [requiredPermission]);

  if (authorized === null) return null; // or show loading spinner

  if (!authorized) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
