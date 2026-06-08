import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function useNotifications() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    PENDING: 0,
    "IN PROGRESS": 0,
    CLOSED: 0,
  });

  const getStoredReadIds = () => {
    const username = sessionStorage.getItem("userLogged") || "guest";
    const stored = localStorage.getItem(`read_notifications_${username}`);
    return stored ? JSON.parse(stored) : [];
  };

  const storeReadIds = (ids) => {
    const username = sessionStorage.getItem("userLogged") || "guest";
    localStorage.setItem(`read_notifications_${username}`, JSON.stringify(ids));
  };

const fetchTickets = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/api/Tickets/GetTicketsByUserRole`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch tickets");

    const data = await res.json();

    // Sort by created_at desc (newest first)
    const sortedTickets = data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    // Filter only desired statuses
    const filteredTickets = sortedTickets.filter((t) =>
      ["OPEN", "IN PROGRESS", "PENDING", "CLOSED"].includes(t.status?.toUpperCase())
    );

    // Take only last 5 tickets
    const lastFiveTickets = filteredTickets.slice(0, 5);

    const newNotifications = lastFiveTickets.map((t) => ({
      id: t.id,
      ticket_id: t.id,
      message: `Ticket #${t.id} is ${t.status}`,
      time: t.created_at,
      status: t.status.toUpperCase(),
    }));

    setNotifications(newNotifications);

    const readIds = getStoredReadIds();
    setUnreadCount(newNotifications.filter((n) => !readIds.includes(n.id)).length);

    setStatusCounts({
      PENDING: lastFiveTickets.filter((t) => t.status.toUpperCase() === "PENDING").length,
      "IN PROGRESS": lastFiveTickets.filter((t) => t.status.toUpperCase() === "IN PROGRESS").length,
      CLOSED: lastFiveTickets.filter((t) => t.status.toUpperCase() === "CLOSED").length,
    });

  } catch (err) {
    console.error("Notification fetch error:", err.message);
    setNotifications([]);
    setUnreadCount(0);
    setStatusCounts({ PENDING: 0, "IN PROGRESS": 0, CLOSED: 0 });
  }
};


  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    storeReadIds(allIds);
    setUnreadCount(0);
  };

  // ✅ Pass navigate from component
  const handleView = useCallback(
    async (ticketId, navigate) => {
      try {
        await axios.put(
          `${API_URL}/api/Tickets/MarkAsViewed/${ticketId}`,
          { viewedBy: sessionStorage.getItem("userId") },
          {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }
        );

        // mark as read locally
        const readIds = getStoredReadIds();
        if (!readIds.includes(ticketId)) readIds.push(ticketId);
        storeReadIds(readIds);

        setUnreadCount((prev) => Math.max(prev - 1, 0));

        // navigate to ticket
        if (navigate) navigate(`/ticket/${ticketId}`);
      } catch (err) {
        console.error("Error marking ticket as viewed:", err);
      }
    },
    [API_URL]
  );

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, markAllAsRead, statusCounts, handleView };
}

export default useNotifications;
