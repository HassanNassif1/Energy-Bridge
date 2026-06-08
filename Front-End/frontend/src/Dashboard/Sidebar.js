import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import UseLogoutWrapper from '../Security/AutoLogoutWrapper';
import Logo from '../img/logo.jpg';

import { 
  FaTachometerAlt,
  FaTools,
  FaTicketAlt,
  FaHistory,
  FaUsers,
  FaUserShield,
  FaBox,
  FaBoxes,
  FaTags,
  FaUserPlus,
  FaUserFriends,
  FaSignOutAlt,
  FaWarehouse,
  FaBuilding,
  FaLayerGroup,
  FaBusinessTime,
  FaWhatsapp
} from "react-icons/fa";

import './Sidebar.css';

function Sidebar({ darkMode, toggleDarkMode })  {

  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
const [openDropdown, setOpenDropdown] = useState(null);

const toggleDropdown = (menuName) => {
  setOpenDropdown((prev) => (prev === menuName ? null : menuName));
};

  const [username, setUsername] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUserPermissions = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      try {
        const { data: user } = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsername(user.username);
        setRoleId(user.role_id);
        sessionStorage.setItem('user', user.username);

        const { data: userPermissions } = await axios.get(`${API_URL}/api/UserRoles/permissions-for-user`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPermissions(Array.isArray(userPermissions) ? userPermissions : []);

      } catch (error) {
        console.error("Error fetching user or permissions:", error);
      }
    };

    fetchUserPermissions();
  }, [username]);

  const hasPermission = (perm) => roleId === 1 || permissions.includes(perm);

  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');
    const currentUser = sessionStorage.getItem('userLogged');

    try {
      await axios.post(`${API_URL}/api/users/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.warn("Logout failed:", error);
    }

    if (currentUser) {
      sessionStorage.removeItem(`read_notifications_${currentUser}`);
    }

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userLogged');

    navigate('/');
    window.location.reload();
  };

  UseLogoutWrapper(handleLogout, 600000);

  return (
    <div className="SideBar ">

      <img src={Logo} alt="Logo" className="sidebar-logo" />

      <div className="sidebar-profile-box">
        <div className="profile-icon">
          <FaUserShield size={40} />
        </div>
        <div className="profile-info">
          <span className="welcome-text">Welcome</span>
          <span className="username-text">{username || "Loading..."}</span>
        </div>
      </div>

      <div className="sidebar-links">

        {/* Dashboard */}
        {hasPermission("ViewDashboard") && (
          <a href="/Dashboard" className={`main-link ${isActive('/Dashboard') ? 'active' : ''}`}>
            <div className="main-item">
              <FaTachometerAlt size={24} />
              <span>Dashboard</span>
            </div>
          </a>
        )}

           {hasPermission("BusinessTypes") && (
          <a href="/BusinessTypes" className={`main-link ${isActive('/BusinessTypes') ? 'active' : ''}`}>
            <div className="main-item">
              <FaBusinessTime size={24} />
              <span>Business Types</span>
            </div>
          </a>
        )}

        {/* Dsps */}
        {hasPermission("ViewDsps") && (
          <a href="/ViewDsps" className={`main-link ${isActive('/ViewDsps') ? 'active' : ''}`}>
            <div className="main-item">
              <FaTools size={24} />
              <span>Dsps</span>
            </div>
          </a>
        )}

        {/* Tickets Dropdown */}
        {hasPermission("ViewTickets") && (
          <div className="dropdown">
  <a 
    className="main-link dropdown-toggle"
    onClick={() => toggleDropdown("tickets")}
  >
    <div className="main-item">
      <FaTicketAlt size={24} />
      <span>Tickets</span>
      <span className={`arrow ${openDropdown === "tickets" ? "open" : ""}`}>▼</span>
    </div>
  </a>

  <div className={`dropdown-content ${openDropdown === "tickets" ? "show" : ""}`}>
    {hasPermission("ViewTickets") && (
      <a href="/ViewTickets"><FaTicketAlt size={22}/> View Tickets</a>
    )}
    {hasPermission("ViewTicketsHistory") && (
      <a href="/ViewTicketsHistory"><FaHistory size={22}/> Tickets History</a>
    )}
    {hasPermission("ViewClientTicket") && (
      <a href="/ViewClientTicket"><FaUserFriends size={22}/> Client Tickets</a>
    )}
  </div>
</div>

        )}

        {/* Packages */}
        {hasPermission("ViewPackages") && (
          <a href="/ViewPackages" className={`main-link ${isActive('/ViewPackages') ? 'active' : ''}`}>
            <div className="main-item">
              <FaBox size={24} />
              <span>Packages</span>
            </div>
          </a>
        )}

        {/* Clients Dropdown */}
        {(hasPermission("AddClient") || hasPermission("ViewClients")) && (
          <div className="dropdown">
            <a className="main-link dropdown-toggle">
              <div className="main-item">
                <FaUserPlus size={24} />
                <span>Clients</span>
                <span className="arrow">▼</span>
              </div>
            </a>

            <div className="dropdown-content">
              {hasPermission("AddClient") && (
                <a href="/AddClient"><FaUserPlus size={22}/> Create Client</a>
              )}
              {hasPermission("ViewClients") && (
                <a href="/ViewClients"><FaUserFriends size={22}/> View Clients</a>
              )}
            </div>
          </div>
        )}

        {/* Inventory Dropdown */}
        {(hasPermission("ViewStock") || hasPermission("ViewCategory") ||
          hasPermission("ViewSuppliers") || hasPermission("ViewBrand")) && (
          <div className="dropdown">
            <a className="main-link dropdown-toggle">
              <div className="main-item">
                <FaWarehouse size={24} />
                <span>Inventory</span>
                <span className="arrow">▼</span>
              </div>
            </a>

            <div className="dropdown-content">
              {hasPermission("ViewStock") && (
                <a href="/Stock"><FaBoxes size={22}/> Stock</a>
              )}
              {hasPermission("ViewCategory") && (
                <a href="/Types"><FaLayerGroup size={22}/> Category</a>
              )}
              {hasPermission("ViewSuppliers") && (
                <a href="/Suppliers"><FaBuilding size={22}/> Suppliers</a>
              )}
              {hasPermission("ViewBrand") && (
                <a href="/Brands"><FaTags size={22}/> Brands</a>
              )}
            </div>
          </div>
        )}

        {/* Staff Dropdown */}
        {hasPermission("Users") && (
          <div className="dropdown staff-management">
            <a className="main-link dropdown-toggle">
              <div className="main-item">
                <FaUsers size={24} />
                <span>Staff</span>
                <span className="arrow">▼</span>
              </div>
            </a>

            <div className="dropdown-content">
              <a href="/Users"><FaUsers size={22}/> Staff List</a>
              <a href="/UserHistory"><FaHistory size={22}/> User History Logs</a>
              <a href="/UsersLogged"><FaUserShield size={22}/> Users Status</a>
              <a href="/Permissions"><FaUserShield size={22}/> Permissions</a>
            </div>
          </div>
        )}
  {hasPermission("WhatsApp") && (
          <a href="/WhatsApp" className={`main-link ${isActive('/WhatsApp') ? 'active' : ''}`}>
            <div className="main-item">
              <FaWhatsapp size={24} />
              <span>WhatsApp</span>
            </div>
          </a>
        )}
        <hr className="sidebar-divider" />

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt size={28} />
        </button>

      </div>
    </div>
  );
}

export default Sidebar;
