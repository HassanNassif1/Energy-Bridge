import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UsersStatusTable() {
  const [users, setUsers] = useState([]);
  const [userHistories, setUserHistories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
   const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/users`)
      .then(res => {
        setUsers(res.data);
        return res.data;
      })
   .then(usersData => {
const historyPromises = usersData.map(user =>
  axios.get(`${API_URL}/api/users/history/${user.id}`)
    .then(res => {
      const history = res.data;

      // sort to ensure latest is last
      history.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const last = history.length > 0 ? history[history.length - 1] : null;

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
      .catch(err => setError(err.response?.data || "Error fetching data"))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (isOnline) => (
    <span style={{
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: "20px",
      color: "white",
      fontWeight: "bold",
      backgroundColor: isOnline ? "#28a745" : "#dc3545", // green for online, red for offline
      fontSize: "0.9rem",
      minWidth: "80px",
      textAlign: "center"
    }}>
      {isOnline ? "Online" : "Offline"}
    </span>
  );

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1 style={{ color: "#c60000", fontSize: "2rem", marginBottom: "20px" }}>Users Current Status</h1>

      {/* Dashboard button */}
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

      {users.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              background:"white",
            fontSize: "1rem"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#c60000", color: "#fff", fontSize: "1.1rem" }}>
                {/* <th style={{ padding: "12px 20px", borderTopLeftRadius: "8px" }}>ID</th> */}
                <th style={{ padding: "12px 20px" }}>Username</th>
                <th style={{ padding: "12px 20px" }}>Role ID</th>
                <th style={{ padding: "12px 20px" }}>Last Action</th>
                <th style={{ padding: "12px 20px" }}>Action Time</th>
                <th style={{ padding: "12px 20px", borderTopRightRadius: "8px" }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
            {users.map(user => {
  const lastHistory = userHistories[user.id]; // may be null

  // Determine last action and timestamp
  const lastAction = lastHistory?.status || "Never logged in";
  const actionTime = lastHistory ? new Date(lastHistory.created_at + 'Z').toLocaleString() : "N/A";

  // Determine if user is online
  let isOnline = false;
  if (lastHistory) {
    const lastTime = new Date(lastHistory.created_at + 'Z'); // ensure UTC
    const minutesSince = (Date.now() - lastTime.getTime()) / 60000;

    // Online if last action is LoggedIn and less than 15 minutes ago
    isOnline = lastHistory.status === "LoggedIn" && minutesSince < 15;
  }

  return (
    <tr
      key={user.id}
      style={{
        textAlign: "center",
        borderBottom: "1px solid #ccc",
        transition: "background-color 0.2s"
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = "#f2f2f2"}
      onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
    >
      <td style={{ padding: "12px 10px" }}>{user.username}</td>
      <td style={{ padding: "12px 10px" }}>{user.role_id}</td>
      <td style={{ padding: "12px 10px" }}>{lastAction}</td>
      <td style={{ padding: "12px 10px" }}>{actionTime}</td>
      <td style={{ padding: "12px 10px" }}>
        {statusBadge(isOnline)}
      </td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersStatusTable;
