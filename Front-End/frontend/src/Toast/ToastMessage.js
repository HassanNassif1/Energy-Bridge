import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function useToastMessages() {
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState("");
  const prevCountRef = useRef(0); // store previous tickets count
   const API_URL = process.env.REACT_APP_API_URL;
 const showToasts = (ticketsList) => {
  if (!ticketsList || ticketsList.length === 0) return;

  if (ticketsList.length === prevCountRef.current + 1) {
    const newTicket = ticketsList[ticketsList.length - 1];
    const status = newTicket.status?.toUpperCase();
    const options = {
      position: "top-right",
      autoClose: 30000, // <-- Toast will stay visible for 30 seconds
    };

    if (status === "IN PROGRESS") {
      toast.info(`🔄 New ticket #${newTicket.id} is IN PROGRESS`, options);
    } else if (status === "OPEN") {
      toast.warning(`📂 New ticket #${newTicket.id} is OPEN`, options);
    } else if (status === "PENDING") {
      toast.error(`⏳ New ticket #${newTicket.id} is PENDING`, options);
    }
  }

  prevCountRef.current = ticketsList.length;
};


  const fetchTickets = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMsg("❌ Not authenticated. Please log in.");
      setTickets([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/Tickets/GetTicketsByUserRole`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
      setMsg("");
      showToasts(data);
    } catch (e) {
      console.error("Failed to fetch tickets:", e.message);
      setTickets([]);
      setMsg("❌ Failed to load tickets.");
    }
  };

  useEffect(() => {
    fetchTickets(); // initial fetch
   
  }, [tickets]);

  return { tickets, msg, fetchTickets };
}

export default function ToastMessage() {
  useToastMessages();
  return <ToastContainer />;
}
