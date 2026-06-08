import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const TicketHistoryDetails = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [tickets, setTickets] = useState([]);
  const [roles, setRoles] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [histories, setHistories] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { assignedToName } = useParams();
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const styles = {
    backButton: {
      padding: "8px 14px",
      marginTop: "1%",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#c60000",
      color: "#fff",
      cursor: "pointer",
    },
  };

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/Clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        response.data.forEach(
          (client) =>
            (map[client.reference_id] = `${client.first_name} ${client.last_name}`)
        );
        setClientsMap(map);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, [token]);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);
        const response = await axios.get(
          `${API_URL}/api/Tickets/TicketHistories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const uniqueTickets = Array.from(
          new Map(response.data.map((t) => [t.ticket_id, t])).values()
        );
        setTickets(uniqueTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err.response || err);
        setError("Failed to load tickets.");
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, [token]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/Users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        res.data.forEach((u) => (map[u.id] = u.username));
        setUsersMap(map);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/UserRoles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, [token]);

  // Fetch histories
  useEffect(() => {
    if (!selectedTicketId) return;

    const fetchHistories = async () => {
      try {
        setLoadingHistories(true);
        const response = await axios.get(
          `${API_URL}/api/Tickets/TicketHistories/${selectedTicketId}/User`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistories(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("You do not have access to view this ticket history.");
        } else {
          setError("Failed to load ticket history.");
        }
      } finally {
        setLoadingHistories(false);
      }
    };
    fetchHistories();
  }, [selectedTicketId, token]);

  // Helpers
  const normalizeId = (id) => (id ? Number(id) : null);
  const getRoleName = (roleId) => {
    const sessionRoleName = sessionStorage.getItem("roleName")?.toLowerCase();
    const id = normalizeId(roleId);
    if (!id) return "Unassigned";
    const role = roles.find((r) => Number(r.id) === id);
    if (role) return role.role_name;
    if (sessionRoleName === "support") return "Unassigned";
    return `Role ${id}`;
  };
  const getUsername = (userId) => {
    const id = normalizeId(userId);
    return usersMap[id] || "Unassigned";
  };

  // Filter tickets for search
  const filteredTickets = tickets.filter((ticket) => {
    const clientName = clientsMap[ticket.client_id] || "";
    const subject = ticket.subject || "";
    return (
      ticket.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <button
        style={styles.backButton}
        onClick={() => navigate("/ViewTickets")}
      >
        ⬅ Back to Tickets
      </button>

      <h1 className="text-3xl font-bold text-gray-800">Ticket History</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loadingTickets ? (
        <div className="text-gray-500">Loading tickets...</div>
      ) : (
        <>
         <input
  type="text"
  placeholder="Search tickets..."
  value={searchTerm}
  onChange={(e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === "") {
      setSelectedTicketId(null); // clear selection
      setDropdownOpen(false);    // close dropdown
      setHistories([]);          // clear histories
    } else {
      setDropdownOpen(true);
    }
  }}
  onClick={() => setDropdownOpen(!dropdownOpen)}
  style={{
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>


          {dropdownOpen && filteredTickets.length > 0 && (
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#fff",
                marginTop: "4px",
              }}
            >
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.ticket_id}
                  onClick={() => {
                    setSelectedTicketId(ticket.ticket_id);
                    setSearchTerm(
                      `${clientsMap[ticket.client_id] || "Unknown Client"} - ${
                        ticket.subject
                      }`
                    );
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {ticket.client_id} - {clientsMap[ticket.client_id] || "Unknown Client"} -{" "}
                  {ticket.subject || "No Subject"} (Status: {ticket.status})
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedTicketId ? (
        <div className="bg-white shadow-lg rounded-xl p-6 ticket-table-container">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Ticket #{selectedTicketId} History
          </h2>

          {loadingHistories ? (
            <div className="text-gray-500">Loading histories...</div>
          ) : histories.length === 0 ? (
            <div className="text-gray-500">No history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full ticket-table">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">User</th>
                    <th className="py-3 px-6 text-left">Assigned Role</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Viewed By</th>
                  </tr>
                </thead>
                <tbody>
                  {histories.map((h) => {
                    const statusClass = {
                      Pending: "status-pending",
                      InProgress: "status-inprogress",
                      Completed: "status-completed",
                      Cancelled: "status-cancelled",
                    }[h.status] || "status-pending";

                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-4">
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`status-badge ${statusClass}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-medium">
                          {getUsername(h.user_id)}
                        </td>
                        <td className="py-2 px-4">
                          <span className="assigned-role-badge">
                            {getRoleName(h.assigned_to)}
                          </span>
                        </td>
                        <td className="py-2 px-4">{h.category || "-"}</td>
                        <td className="py-2 px-4">{h.description || "-"}</td>
                        <td className="py-2 px-4">{h.viewedBy || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : searchTerm ? (
        <div className="text-gray-500 mt-4">No ticket selected.</div>
      ) : null}
    </div>
  );
};

export default TicketHistoryDetails;
