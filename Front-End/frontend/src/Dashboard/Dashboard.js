import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Chart from "react-apexcharts";
import useNotifications from "../hooks/useNotifications"; // import your custom hook
import { useNavigate } from "react-router-dom";

function Dashboard({ darkMode, toggleDarkMode }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    users: 0,
    roles: 0,
    dsps: 0,
    clients: 0,
  });

  const [username, setUsername] = useState("");
  const [ticketCounts, setTicketCounts] = useState({
    OPEN: 0,
    "IN PROGRESS": 0,
    CLOSED: 0,
    PENDING: 0,
  });
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Notifications
  // ------------------------------
 const { notifications, unreadCount, markAllAsRead, handleView } = useNotifications();

  // ------------------------------
  // Handle ticket click
  // ------------------------------




  // ------------------------------
  // Helper functions
  // ------------------------------
  const getStoredReadIds = () => {
    const stored = localStorage.getItem("readNotificationIds");
    return stored ? JSON.parse(stored) : [];
  };
  

// ------------------------------
// Handle ticket click
// ------------------------------
const handleNotificationClick = (ticketId) => {
  if (!ticketId) return;
  handleView(ticketId, navigate); // marks as read and navigates
};
 const renderNotifications = (status) => {
  const filtered = notifications.filter(
    (n) => n.status.toUpperCase() === status.toUpperCase()
  );
  if (!filtered.length)
    return <p className="empty-msg">No {status} notifications</p>;

return filtered.map((n) => {
  const isUnread = !getStoredReadIds().includes(n.id);
  return (
    <div
      key={n.id}
      className={`notification-card ${isUnread ? `unread ${status.toLowerCase()}` : ""}`}
      style={{ cursor: n.ticket_id ? "pointer" : "default" }}
      onClick={() => n.ticket_id && handleNotificationClick(n.ticket_id)}
    >
      <div className="notification-content">
        <p className="notification-message">{n.message}</p>
        <small className="notification-time">
          {new Date(n.time).toLocaleString()}
        </small>
      </div>
      {isUnread && <span className="unread-dot"></span>}
    </div>
  );
});

};


  // ------------------------------
  // Fetch user permissions
  // ------------------------------
  useEffect(() => {
    const fetchUserPermissions = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const { data: user } = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(user.username);
        setRoleId(user.role_id);
        sessionStorage.setItem("userLogged", user.username);

        const { data: userPermissions } = await axios.get(
          `${API_URL}/api/UserRoles/permissions-for-user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPermissions(Array.isArray(userPermissions) ? userPermissions : []);
      } catch (error) {
        console.error("Error fetching user or permissions:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  // ------------------------------
  // Fetch dashboard counts
  // ------------------------------
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAll = async () => {
      try {
        const [users, roles, dsps, clients, tickets] = await Promise.all([
          axios.get(`${API_URL}/api/users`, config),
          axios.get(`${API_URL}/api/UserRoles`, config),
          axios.get(`${API_URL}/api/Dsps`, config),
          axios.get(`${API_URL}/api/Clients`, config),
          axios.get(`${API_URL}/api/Tickets`, config),
        ]);

        setCounts({
          users: users.data.length,
          roles: roles.data.length,
          dsps: dsps.data.length,
          clients: clients.data.length,
        });

        const statusCounts = tickets.data.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});

        setTicketCounts(statusCounts);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="dashboard-wrapper">
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="dashboard-container">
        <div className="notifications-section">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              <span className="unread-count">{unreadCount} unread</span>
             
            </div>
          </div>

          <div className="notifications-status-container">
            <div className="status-box open-box">
              <h4>OPEN</h4>
              {renderNotifications("OPEN")}
            </div>

            <div className="status-box inprogress-box">
              <h4>IN PROGRESS</h4>
              {renderNotifications("IN PROGRESS")}
            </div>

            <div className="status-box pending-box">
              <h4>PENDING</h4>
              {renderNotifications("PENDING")}
            </div>

            <div className="status-box closed-box">
              <h4>CLOSED</h4>
              {renderNotifications("CLOSED")}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
