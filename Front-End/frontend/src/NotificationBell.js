import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import useNotifications from "./hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, statusCounts, handleView } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleModal = () => setIsOpen(!isOpen);
  const handleMarkAllRead = () => markAllAsRead();

  return (
    <div className="notification-container">
      {/* Bell Icon */}
      <div className="bell-wrapper" onClick={toggleModal}>
        <FaBell size={24} onClick={handleMarkAllRead} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {/* Notifications Modal */}
      {isOpen && (
        <div className="modal">
          {/* Modal Header */}
          <div className="modal-header">
            <h4>Notifications</h4>
            <div className="header-actions">
              <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const statusClass = n.status.toLowerCase().replace(" ", "-");
                return (
                  <div
                    key={n.id}
                    className={`notification-item ${statusClass}`}
                    style={{ cursor: n.ticket_id ? "pointer" : "default" }}
                    onClick={() => n.ticket_id && handleView(n.ticket_id, navigate)}
                  >
                    <p className="notification-message">{n.message}</p>
                    <small className="notification-time">{new Date(n.time).toLocaleString()}</small>
                  </div>
                );
              })
            ) : (
              <p className="no-notifications">No notifications</p>
            )}
          </div>

          {/* Ticket Status Summary */}
          <div className="ticket-summary-box">
            <div className="summary-item pending">🟡 {statusCounts.PENDING} Pending</div>
            <div className="summary-item progress">🔵 {statusCounts["IN PROGRESS"]} In Progress</div>
            <div className="summary-item closed">✅ {statusCounts.CLOSED} Closed</div>
          </div>
        </div>
      )}
    </div>
  );
}
