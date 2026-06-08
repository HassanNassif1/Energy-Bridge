import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-flow-renderer/dist/style.css';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';



const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
const [ticketError, setTicketError] = useState("");
   const API_URL = process.env.REACT_APP_API_URL;
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [histories, setHistories] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchTicketDetails();
    fetchComments();
    fetchHistories();
    fetchUsers();
    fetchRoles();
  }, [id]);

const fetchTicketDetails = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API_URL}/api/Tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    if (!res.data) throw new Error("No ticket returned");

    setTicket(res.data);
  } catch (e) {
    console.error(e);
    setTicketError("Failed to load ticket");
  } finally {
    setLoading(false);
  }
};




  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/TicketComments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ticketComments = res.data.filter(c => c.ticket_id === Number(id));
      setComments(ticketComments);
    } catch (e) {
      console.error("Failed to fetch comments:", e);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API_URL}/api/TicketComments/CreateComment`, {
        ticket_id: Number(id),
        comment: newComment
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewComment("");
      fetchComments();
    } catch (e) {
      console.error("Failed to add comment:", e);
    }
  };

  const fetchHistories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Tickets/TicketHistories/${id}/User`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistories(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have access to view this ticket history.");
      } else {
        setError("Failed to load ticket history.");
      }
    }
  };

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

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/UserRoles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const getRoleName = (roleId) => {
  if (!Array.isArray(roles)) return "Unassigned"; // safety check
  const role = roles.find((r) => r.id === roleId);
  return role ? role.role_name : "Unassigned";
};


const generateFlowElements = () => {
  if (!histories || histories.length === 0) return [];

  const nodes = histories.map((h, idx) => ({
    id: `node-${idx}`,
    type: 'default',
    data: {
      label: (
        <div style={{ fontSize: '12px' }}>
          <strong>Status:</strong> {h.status}<br />
          <strong>User:</strong> {usersMap[h.user_id] || 'Unknown'}<br />
          <strong>Assigned Role:</strong> {getRoleName(h.assigned_to)}<br />
          <strong>Viewed By:</strong> {h.viewedBy || '-'}
        </div>
      )
    },
    position: { x: idx * 300, y: 50 } // Horizontal layout
  }));

  const edges = histories.slice(1).map((_, idx) => ({
    id: `edge-${idx}`,
    source: `node-${idx}`,
    target: `node-${idx + 1}`,
    animated: true,
    type: 'smoothstep'
  }));

  return [...nodes, ...edges];
};




 
  return (
    <div style={styles.pageContainer}>
      <button style={styles.backButton} onClick={() => navigate('/ViewTickets')}>
        ⬅ Back to Tickets
      </button>

      <div style={styles.flexContainer}>
        {/* Ticket Details */}
        <div style={styles.leftColumn}>
          <h2>Ticket Details</h2>
          {ticket ? (
            <div style={styles.ticketCard}>
              <div style={styles.grid}>
                <div><strong>Ticket ID:</strong> {ticket.id}</div>
                <div><strong>Client ID:</strong> {ticket.client_id}</div>
                <div><strong>Subject:</strong> {ticket.subject}</div>
                <div><strong>Category:</strong> {ticket.category}</div>
                <div><strong>Call Source:</strong> {ticket.call_source}</div>
                <div><strong>Status:</strong> {ticket.status}</div>
                <div><strong>Severity:</strong> {ticket.severity}</div>
                <div><strong>Assigned User:</strong> {ticket.user_id}</div>
                <div><strong>Assigned Department:</strong> {ticket.assigned_to}</div>
                <div><strong>Viewed:</strong> {ticket.isViewed ? "Yes" : "No"}</div>
                <div><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>Description:</strong>
                  <p style={styles.description}>{ticket.description}</p>
                </div>
              </div>
            </div>
          ) : <p>Loading ticket...</p>}

          <div style={styles.commentsSection}>
            <h3>Comments</h3>
            {comments.length === 0 && <p style={{ fontStyle: 'italic' }}>No comments yet.</p>}
            {comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <strong>{c.author}</strong> <span>({new Date(c.created_at).toLocaleString()})</span>
                </div>
                <p>{c.comment}</p>
              </div>
            ))}
            <div style={styles.commentBox}>
              <textarea
                rows="4"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                style={styles.textarea}
              />
              <button onClick={handleAddComment} style={styles.submitBtn}>Submit Comment</button>
            </div>
          </div>
        </div>

        {/* Ticket History + Chart */}
        <div style={styles.rightColumn}>
          <h2>Ticket #{id} History</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {histories.length === 0 ? (
            
            <p className="text-gray-500 italic">No history found.</p>
          ) : (
            <>
            
             {/* Ticket History Table */}
<table className="min-w-full ticket-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Status</th>
      <th>User</th>
      <th>Assigned Role</th>
      <th>Category</th>
      <th>Description</th>
      <th>Viewed By</th>
    </tr>
  </thead>
<tbody>
  {[...histories]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((h, idx, arr) => {
      const prev = arr[idx - 1] || {};
      
      const changed = {
        status: h.status !== prev.status,
        user_id: h.user_id !== prev.user_id,
        assigned_to: h.assigned_to !== prev.assigned_to,
        category: h.category !== prev.category,
        description: h.description !== prev.description,
        viewedBy: h.viewedBy !== prev.viewedBy
      };

      return (
        <tr key={idx}>
          <td>{new Date(h.created_at).toLocaleString()}</td>
          <td style={{ background: changed.status ? '#e85f5fff' : undefined }}>{h.status}</td>
          <td style={{ background: changed.user_id ? '#e85f5fff' : undefined }}>
            {usersMap[h.user_id] || "Unknown"}
          </td>
          <td style={{ background: changed.assigned_to ? '#e85f5fff' : undefined }}>
            {getRoleName(h.assigned_to)}
          </td>
          <td style={{ background: changed.category ? '#e85f5fff' : undefined }}>
            {h.category || "-"}
          </td>
          <td style={{ background: changed.description ? '#e85f5fff' : undefined }}>
            {h.description || "-"}
          </td>
          <td style={{ background: changed.viewedBy ? '#e85f5fff' : undefined }}>
            {h.viewedBy || "-"}
          </td>
        </tr>
      );
    })}
</tbody>


</table>
<div style={{ marginTop: '30px' }}>
  <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Ticket Flow Log</h3>
<ul style={{ listStyle: 'none', padding: 0 }}>
  {[...histories]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((h, idx, arr) => {
      const prev = arr[idx - 1] || {};
      const timestamp = new Date(h.created_at).toLocaleString();
      const user = usersMap[h.user_id] || "Unknown";

      const changes = [];

      if (h.status !== prev.status) {
        changes.push(`changed status to <strong style="color: #e85f5fff">${h.status}</strong>`);
      }

      if (h.assigned_to !== prev.assigned_to) {
        const role = getRoleName(h.assigned_to);
        changes.push(`assigned to <strong style="color: #e85f5fff">${role}</strong>`);
      }

      if (h.viewedBy !== prev.viewedBy) {
        const viewedBy = h.viewedBy || "None";
        changes.push(`viewed by <strong style="color: #e85f5fff">${viewedBy}</strong>`);
      }

      if (h.user_id !== prev.user_id) {
        changes.unshift(`<strong style="color: #e85f5fff">${user}</strong> made a change`);
      } else {
        changes.unshift(`<strong style="color: #e85f5fff">${user}</strong>`);
      }

      if (changes.length <= 1) return null; // skip if no meaningful change

      return (
        <li
          key={idx}
          style={{
            background: '#fff',
            borderLeft: '4px solid #c60000',
            padding: '12px 16px',
            marginBottom: '10px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            color: '#333',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <div style="color: #666; font-size: 13px; margin-bottom: 4px;">🕒 ${timestamp}</div>
              <div>${changes.join(', ')}.</div>
            `
          }}
        />
      );
    })}
</ul>



</div>


{/* Ticket Flow Chart */}



 

    
              {/* <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '10px' }}>
                <Line data={chartData} options={chartOptions} />
              </div> */}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '20px',
    maxWidth: '95%',
    margin: '0 auto',
  },
  flexContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  leftColumn: {
    flex: '1 1 30%',
    minWidth: '350px'
  },
  rightColumn: {
    flex: '1 1 60%',
    minWidth: '350px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '15px',
    padding: '15px',
    overflowX: 'auto'
  },
  ticketCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '6px',
    marginBottom: '30px',
    border: '1px solid #ddd'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '15px'
  },
  description: {
    backgroundColor: '#f1f1f1',
    padding: '10px',
    borderRadius: '4px'
  },
  commentsSection: {
    marginTop: '30px'
  },
  comment: {
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '12px 15px',
    marginBottom: '15px',
    borderLeft: '4px solid #c60000'
  },
  commentHeader: {
    marginBottom: '5px',
    color: '#555'
  },
  commentBox: {
    marginTop: '20px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'vertical',
    fontSize: '14px'
  },
  submitBtn: {
    marginTop: '10px',
    backgroundColor: '#c60000',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  backButton: {
    marginBottom: '15px',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#c60000',
    color: '#fff',
    cursor: 'pointer'
  }
};

export default TicketDetails;
