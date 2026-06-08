import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserHistoryPage() {
  const [users, setUsers] = useState([]);
  const [userHistories, setUserHistories] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
const deleteAllHistory = async () => {
  if (!window.confirm("Are you sure you want to delete ALL user history logs?"))
    return;

  try {
    const res = await axios.delete(`${API_URL}/api/users/all`);
    alert(res.data);
    setHistoryLogs([]);   // clear displayed history
    setUserHistories({}); // clear dashboard history
  } catch (err) {
    alert(err.response?.data || "Error deleting all user history");
  }
};

  // Fetch all users and their last history
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/users`)
      .then(res => {
        const usersData = res.data;
        setUsers(usersData);

        // Fetch last history per user
        const historyPromises = usersData.map(user =>
          axios.get(`${API_URL}/api/users/history/${user.id}`)
            .then(res => {
              const history = res.data;
              const last = history.length > 0 ? history[0] : null;
              return { userId: user.id, lastHistory: last };
            })
        );

        return Promise.all(historyPromises);
      })
      .then(histories => {
        const historyMap = {};
        histories.forEach(h => {
          historyMap[h.userId] = h.lastHistory;
        });
        setUserHistories(historyMap);
      })
      .catch(err => setError(err.response?.data || "Error fetching users"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch full history for selected user
  useEffect(() => {
    if (!selectedUserId) {
      setHistoryLogs([]);
      return;
    }

    setLoading(true);
    axios.get(`${API_URL}/api/users/history/${selectedUserId}`)
      .then(res => setHistoryLogs(res.data))
      .catch(err => setError(err.response?.data || "Error fetching history"))
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  const statusBadge = (isOnline) => (
    <span style={{
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: "20px",
      color: "white",
      fontWeight: "bold",
      backgroundColor: isOnline ? "#28a745" : "#dc3545",
      fontSize: "0.9rem",
      minWidth: "80px",
      textAlign: "center"
    }}>
      {isOnline ? "Online" : "Offline"}
    </span>
  );

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1 style={{ color: "#c60000", fontSize: "2rem", marginBottom: "20px" }}>User Dashboard & History</h1>

      <button
        onClick={() => navigate("/Dashboard")}
        style={{
          backgroundColor: "#c60000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "12px 24px",
          cursor: "pointer",
          fontSize: "1rem",
          marginBottom: "30px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "#a50000"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "#c60000"}
      >
        Go to Dashboard
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

  

      {/* User History Logs */}
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Select User to view full history:</label>
        <select
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
          style={{ padding: "8px", fontSize: "16px", borderRadius: "4px" }}
        >
          <option value="">-- Select User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>

      {historyLogs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <h2>Full History for {users.find(u => u.id === selectedUserId)?.username}</h2>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            background: "white",
            fontSize: "1rem"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#c60000", color: "#fff", fontSize: "1.1rem" }}>
                <th style={{ padding: "12px 20px" }}>ID</th>
                <th style={{ padding: "12px 20px" }}>Status</th>
                <th style={{ padding: "12px 20px" }}>Role ID</th>
                <th style={{ padding: "12px 20px" }}>Username</th>
                <th style={{ padding: "12px 20px" }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map(log => (
                <tr key={log.id} style={{ textAlign: "center", borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "12px 10px" }}>{log.id}</td>
                  <td style={{ padding: "12px 10px" }}>{log.status}</td>
                  <td style={{ padding: "12px 10px" }}>{log.role_id}</td>
                  <td style={{ padding: "12px 10px" }}>{log.username}</td>
                  <td style={{ padding: "12px 10px" }}>{new Date(log.created_at + 'Z').toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
<button
  onClick={deleteAllHistory}
  style={{
    backgroundColor: "#c60000",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  }}
  onMouseOver={e => e.currentTarget.style.backgroundColor = "#a50000"}
  onMouseOut={e => e.currentTarget.style.backgroundColor = "#c60000"}
>
  Delete All User History Logs
</button>

      {selectedUserId && historyLogs.length === 0 && !loading && <p>No history logs for this user.</p>}
    </div>
  );
}

export default UserHistoryPage;
