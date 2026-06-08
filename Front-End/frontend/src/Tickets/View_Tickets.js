import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import DataTable from "react-data-table-component";
import { FaBoxOpen, FaBullseye, FaEdit, FaEye, FaOpenid, FaSave, FaTrash } from "react-icons/fa";
import Dashboard from "../Dashboard/Sidebar";
import UserContext from "../UserContext/UserContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function View_Tickets() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [loadingViewIds, setLoadingViewIds] = useState(new Set());

  const [selectedClient, setSelectedClient] = useState();
const clientSearchRef = useRef(null);

  const [latestViewedBy, setLatestViewedBy] = useState({});
  const token = sessionStorage.getItem("token");

  const [assignmentMode, setAssignmentMode] = useState("department"); // "department" or "user"
  const [histories, setHistories] = useState({});

  // const { username } = useContext(UserContext);
  const [clientDropdownDisabled, setClientDropdownDisabled] = useState(true);
  const navigate = useNavigate();
  const [ticketComments, setTicketComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");


  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [Clients, setClients] = useState([]);
  const [salesclients, setSalesClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

const actionBtn = (color) => ({
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  cursor: "pointer",
  backgroundColor: "#f4f6f8",
  color,
  fontSize: "18px",
});

useEffect(() => {
  const fetchCurrentUser = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const { data: user } = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentUser(user);
      sessionStorage.setItem('user', user.username);
      sessionStorage.setItem('userId', user.id);

    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  fetchCurrentUser();
}, []);
const handleRowDoubleClick = (row) => {
  // Set ticket ID for update
  setCurrentTicket(row.id); // or row.ticket_id depending on your API

  // Populate edit form
  setEditForm({
    ...row,
    assigned_to: row.assigned_to ?? null,
    assigned_user: row.assigned_user ?? null,
    user_id: row.user_id ?? null,
    status: row.status ?? "OPEN",
  });

  // Open edit modal / page
  setShowEdit(true);
};

useEffect(() => {
  if (openDropdown && clientSearchRef.current) {
    clientSearchRef.current.focus();
  }
}, [openDropdown]);



  const filteredClients = salesclients.filter((client) => {
    // Combine all searchable fields into one string
    const searchable = `${client.first_name} ${client.last_name} ${client.reference_id}`.toLowerCase();

    // Split the search input into words
    const searchWords = clientSearch.toLowerCase().trim().split(/\s+/);

    // Return true only if every search word is found somewhere
    return searchWords.every(word => searchable.includes(word));
  });

  const [username, setUsername] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const location = useLocation();
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
  }, []);

  const hasPermission = (perm) => roleId === 1 || permissions.includes(perm);
  const AllowedSeverities = ["Low", "Medium", "High", "Critical"];
  const AllowedStatusesAdd = ["OPEN", "IN PROGRESS", "PENDING"];
  const AllowedStatusesEdit = ["OPEN", "IN PROGRESS", "PENDING", "CLOSED"];
  const AllowedCategories = ["Internet", "Hardware", "Billing", "Maintenance", "Visit", "Connection Shifting", "No Internet", "Off-On", "Paid Service", "Ping Break", "Renewal Tickets", "Speed"];
  const AllowedCallSource = ["Mobile", "Email", "On-Site", "Phone"];
  const iconStyle = {
    cursor: "pointer",
    fontSize: "1.2rem",
    transition: "color 0.2s",
  };
  
const handleView = useCallback(async (id) => {
  if (loadingViewIds.has(id)) return; // prevent double click

  setLoadingViewIds(prev => new Set(prev).add(id)); // mark as loading

  try {
    await axios.put(
      `${API_URL}/api/Tickets/MarkAsViewed/${id}`,
      { viewedBy: sessionStorage.getItem("userId") },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        withCredentials: true,
      }
    );

    setLatestViewedBy(prev => ({
      ...prev,
      [id]: sessionStorage.getItem("user"),
    }));

    navigate(`/ticket/${id}`);
  } catch (error) {
    console.error("Error marking ticket as viewed:", error);
  } finally {
    setLoadingViewIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
}, [navigate, loadingViewIds]);




 const handleAssignmentModeChange = (mode) => {
  setAssignmentMode(mode);
  if (mode === "department") {
    setEditForm(prev => ({ ...prev, assigned_user: "", role_id: "" }));
  } else {
    setEditForm(prev => ({ ...prev, role_id: "", assigned_user: "" }));
  }
};


  const [addForm, setAddForm] = useState({
    client_id: "",
    subject: "",
    description: "",
    category: "",
    severity: "Low",
    status: "OPEN",
    assigned_to: "", // This will likely be a user ID, not a role ID, for ticket assignment
    call_source: "",
    role_id: "",
    user_id: "",
    assigned_user: ""
  });
  const [editForm, setEditForm] = useState({ ...addForm });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
  const [roles, setRoles] = useState([]);
  const [Users, setUsers] = useState([]); // ✅ empty array won't break .map


  useEffect(() => {
    fetchClients();
    fetchRoles();
    fetchTickets();
    fetchUsers();
    fetchComments();
    fetchUser();
  }, [ticketComments]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const roleId = response.data.roleId;
        let allRoles = roles;

        // Fetch roles if not already available
        if (!roles.length) {
          const rolesRes = await axios.get(`${API_URL}/api/UserRoles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          allRoles = rolesRes.data;
          setRoles(allRoles); // ✅ Store roles in state
        }

        const userRole = allRoles.find(role => role.id === roleId);

        setUsername(roleId); // or setUsername(response.data.username) depending on what you want to show

        // ✅ Set session storage once the userRole is found
        if (userRole) {
          sessionStorage.setItem("roleId", roleId);
          sessionStorage.setItem("roleName", userRole.role_name);
        } else {
          sessionStorage.setItem("roleId", roleId);
          sessionStorage.setItem("roleName", ""); // fallback if role not found
        }

      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };


    fetchUserInfo();
  }, [roles]); // depends on roles
  const userRoleId = Number(sessionStorage.getItem("roleId"));
  const isAdmin = userRoleId === 1;
  useEffect(() => {
    const fetchClientsBySales = async () => {
      const token = sessionStorage.getItem('token'); // stored on login

      try {
        const response = await axios.get(`${API_URL}/api/Clients/by-sales`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSalesClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClientsBySales();
  }, []);
  const fetchClients = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Clients`);
      setClients(data);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  };
  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/TicketComments`);
      setTicketComments(data);
    } catch (e) {
      console.error("Failed to fetch ticket comments", e);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data);

    } catch (Err) {
      console.error(Err, "Failed to fetch users");
    }
  }
  const normalizeStatus = s =>
    (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, ""); // "IN PROGRESS" -> "inprogress"
  const fetchUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.username);
        sessionStorage.setItem("userLogged", data.username);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };


  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/UserRoles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      setRoles(response.data);
     
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // --- MODIFIED fetchTickets FUNCTION ---
  const fetchTickets = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return; // Silent fail, PrivateRoute handles redirect

    try {
      const { data } = await axios.get(`${API_URL}/api/Tickets/GetTicketsByUserRole`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTickets(data);
    } catch (e) {
      console.error("Failed to fetch tickets:", e.response?.data || e.message);

      if (e.response?.status === 401) {
        // Session expired – let PrivateRoute handle redirect

        return;
      } else if (e.response?.status === 403) {
        setMsg("❌ Forbidden: You do not have permission to view tickets.");
      } else {
        setMsg("❌ No Tickets Found.");
      }

      setTickets([]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    const commentData = {
      ticket_id: editForm.id,
      comment: newComment,
      created_at: new Date().toISOString()
    };


    const token = sessionStorage.getItem("token");
    fetch(`${API_URL}/api/TicketComments/CreateComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // send JWT token here
      },
      body: JSON.stringify(commentData),
    });

    // Reset UI
    setShowCommentModal(false);
    setNewComment("");
    fetchComments(); // Refresh comments list
  };



  const handleClientChange = async (e) => {
    const selectedReferenceId = e.target.value;
    setAddForm(f => ({ ...f, client_id: selectedReferenceId }));

    if (!selectedReferenceId) return;

    try {
      const token = sessionStorage.getItem('token');
      const clientRes = await axios.get(
        `${API_URL}/api/Clients/by-reference-id/${selectedReferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const client = clientRes.data;

      if (client?.created_by) {
        const userRes = await axios.get(
          `${API_URL}/api/Users/${client.created_by}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = userRes.data;

        setUsers([user]); // show only the related user
        setAddForm(f => ({ ...f, user_id: user.id }));
      }
    } catch (err) {
      console.error("Failed to fetch client or user by reference_id", err);
    }
  };
  const handleClientChangeEdit = async (e) => {
    const selectedReferenceId = e.target.value;
    setEditForm(f => ({ ...f, client_id: selectedReferenceId }));

    if (!selectedReferenceId) return;

    try {
      const token = sessionStorage.getItem('token');
      const clientRes = await axios.get(
        `${API_URL}/api/Clients/by-reference-id/${selectedReferenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const client = clientRes.data;

      if (client?.created_by) {
        const userRes = await axios.get(
          `${API_URL}/api/Users/${client.created_by}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = userRes.data;

        setUsers([user]); // show only the related user
        setEditForm(f => ({ ...f, user_id: user.id })); // ✅ fixed to update editForm
      }
    } catch (err) {
      console.error("Failed to fetch client or user by reference_id", err);
    }
  };


  // --- END MODIFIED fetchTickets FUNCTION ---
  const handleUserChange = async (e) => {
    const selectedUserId = parseInt(e.target.value);
    setAddForm(f => ({ ...f, user_id: selectedUserId, client_id: "" }));

    if (!selectedUserId) {
      setSalesClients([]);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/Clients/by-created/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSalesClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const handleUserEdit = async (e) => {
    const selectedUserId = parseInt(e.target.value);
    setEditForm(f => ({ ...f, user_id: selectedUserId, client_id: "" }));
    setClientDropdownDisabled(false); // enable dropdown when user is edited

    if (!selectedUserId) {
      setSalesClients([]);
      setClientDropdownDisabled(true); // re-disable if user reset
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/Clients/by-created/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSalesClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };


  // Clear messages after 5 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);
  const openEditModal = (ticket) => {
    setEditForm(ticket);
    setShowEdit(true);
    setClientDropdownDisabled(true); // disable client dropdown initially
  };

const openEdit = (ticket) => {
  setEditForm({
    ...ticket,
    // Make sure the dropdown shows the current department
    assigned_to: ticket.assigned_to ? Number(ticket.assigned_to) : null,
    assigned_user: ticket.assigned_user ? Number(ticket.assigned_user) : null,
  });
  setCurrentTicket(ticket.id);
  setShowEdit(true);
};


const handleAdd = async (e) => {
  e.preventDefault();

  const selectedClient = Clients.find(c => c.reference_id === addForm.client_id);

  const userId = sessionStorage.getItem("userId"); // Get current logged-in user ID
const payload = {
  ...addForm,
  client_id: selectedClient ? selectedClient.reference_id : addForm.client_id,
  role_id: addForm.role_id ? Number(addForm.role_id) : null,         // department assignment
  assigned_to: addForm.role_id ? Number(addForm.role_id) : null,    // optional, if your backend needs this
  assigned_user: addForm.assigned_user ? Number(addForm.assigned_user) : null, // user assignment
  user_id: userId ? Number(userId) : null, // logged-in user
};



  const token = sessionStorage.getItem('token');

  try {
    await axios.post(`${API_URL}/api/Tickets/CreateTickets`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMsg("✅ Ticket added");
    setShowAdd(false);

    // Reset form
    setAddForm({
      client_id: "",
      subject: "",
      description: "",
      category: "",
      severity: "Low",
      status: "OPEN",
      assigned_to: "",
      call_source: "",
      role_id: "",
      assigned_user: ""
    });

    fetchTickets(); // Refresh tickets after adding
  } catch (error) {
    console.error("Add ticket error:", error.response?.data || error.message);
    setShowAdd(false);
  }
};


const handleEdit = async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem("token");

  try {
 const payload = {
  ...editForm,
  assigned_to: editForm.assigned_to ? Number(editForm.assigned_to) : null,
  assigned_user: editForm.assigned_user ? Number(editForm.assigned_user) : null,
  user_id: editForm.user_id ? Number(editForm.user_id) : null,
  status: editForm.status ? editForm.status.toUpperCase() : "OPEN",
};


    await axios.put(`${API_URL}/api/Tickets/${currentTicket}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMsg("✅ Ticket updated");
    setShowEdit(false);
    fetchTickets(); // Refresh tickets to show new department
  } catch (error) {
    console.error("Edit ticket error:", error.response?.data || error.message);
    setMsg("❌ Failed to update ticket");
  }
};



  const handleDelete = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/Tickets/${deleteTarget.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMsg("✅ Ticket deleted");
      setDeleteTarget(null);
      fetchTickets(); // Refresh tickets after deleting
    } catch (error) {
      console.error("Delete ticket error:", error.response?.data || error.message);
      setMsg("❌ Unable to delete ticket due to open ticket");
    }
  };

  const customStyles = {
    table: {
      style: {
        width: "100%",
        background: "white",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        fontSize: "1rem",
        overflowX: "auto",
        border: "none", // remove table border
      }
    },

    headRow: {
      style: {
        backgroundColor: "#c60000",
        color: "#fff",
        fontSize: "1.1rem",
        minHeight: "55px",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        border: "none", // remove head row border
      }
    },

    headCells: {
      style: {
        padding: "12px 20px",
        color: "white",
        fontWeight: "bold",
        border: "none", // remove head cell border
      }
    },

    cells: {
      style: {
        padding: "12px 10px",
        textAlign: "center",
        fontSize: "1rem",
        border: "none", // remove bottom border
      }
    },

    rows: {
      style: {
        transition: "background-color 0.2s",
        border: "none", // remove row border
        '&:hover': {
          backgroundColor: "#f2f2f2",
        }
      }
    }
  };

  // Removed fetchUserInfo useEffect, as it's no longer necessary here.
  // The backend's GetTicketsByUserRole already knows the user's identity.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return; // Let PrivateRoute handle redirection
    fetchTickets();
  }, []);
  const StatusBadge = ({ status, active = true }) => {
    const statusClass = status.toLowerCase().replace(/\s/g, ''); // e.g. "IN PROGRESS" -> "inprogress"
    return (
      <span className={`status-badge status-${statusClass} ${active ? '' : 'status-off'}`}>
        {active && <span className="status-dot" />}
        {status}
      </span>
    );
  };

  const AssignedBadge = ({ name }) => {
    return <span className="assigned-role-badge">{name || "Unassigned"}</span>;
  };
  const fetchHistories = async (ticketId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/Tickets/TicketHistories/${ticketId}/User`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // do something with response.data
    } catch (err) {
      // if (err.response?.status === 403) {
      //   setError("You do not have access to view this ticket history.");
      // } else {
      //   setError("Failed to load ticket history.");
      // }
    }
  };

useEffect(() => {
  if (!tickets || tickets.length === 0) return;

  tickets.forEach(ticket => {
    axios
      .get(`${API_URL}/api/Tickets/TicketHistories/${ticket.id}/User`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const history = Array.isArray(response.data) ? response.data : [];

        // FIXED: get last viewedBy entry
        const lastViewed = [...history].reverse().find(h => h.viewedBy);

        setLatestViewedBy(prev => ({
          ...prev,
          [ticket.id]: lastViewed?.viewedBy || "Not viewed"
        }));
      })
      .catch(err => {
        console.error(err);
        setLatestViewedBy(prev => ({
          ...prev,
          [ticket.id]: "Not viewed"
        }));
      });
  });
}, [tickets]);


  const getLatestViewedBy = (ticketId) => {
    if (!Array.isArray(histories)) return "Not viewed";

    const ticketHistory = histories
      .filter(h => h.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return ticketHistory[0]?.viewedBy || "Not viewed";
  };

const canDelete = hasPermission("delete_ticket");
  // Columns for DataTable
  const columns = [
    { name: "Ticket ID ", selector: r => r.id, sortable: true, maxWidth: "120px" },
  { name: "Ref ID", selector: r => r.client_id, sortable: true, maxWidth: "120px" },
  
  { name: "Subject", selector: r => r.subject, sortable: true, wrap: true, minWidth: "150px" },
  { name: "Category", selector: r => r.category, sortable: true, minWidth: "120px" },
  { name: "Severity", selector: r => r.severity, sortable: true, minWidth: "100px" },
  { name: "Status", selector: row => row.status, cell: row => <StatusBadge status={row.status} />, sortable: true, maxWidth: "120px" },
  { name: "From User", selector: row => row.user_id, cell: row => <AssignedBadge name={Users.find(u => u.id === row.user_id)?.username || "Unassigned"} />, sortable: true, minWidth: "120px" },
  { name: "To User", selector: row => row.assigned_user, cell: row => <AssignedBadge name={Users.find(u => u.id === row.assigned_user)?.username || "Unassigned"} />, sortable: true, minWidth: "120px" },
  { name: "To Dept", selector: row => { if (row.assigned_to) { const assignedRole = roles.find(r => Number(r.id) === Number(row.assigned_to)); if (assignedRole) return <AssignedBadge name={assignedRole.role_name} />; } return <AssignedBadge name="Unassigned" />; }, sortable: true, },

  {
  name: "Actions",
  cell: r => (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      <div onClick={() => openEdit(r)} style={actionBtn("#007bff")}>
        <FaEdit />
      </div>

    <div
  onClick={() => !loadingViewIds.has(r.id) && handleView(r.id)}
  style={{
    ...actionBtn("#28a745"),
    cursor: loadingViewIds.has(r.id) ? "not-allowed" : "pointer",
    opacity: loadingViewIds.has(r.id) ? 0.6 : 1,
    pointerEvents: loadingViewIds.has(r.id) ? "none" : "auto",
  }}
  title={loadingViewIds.has(r.id) ? "Loading..." : "View"}
>
  <FaEye />
</div>


 


<div
  onClick={canDelete ? () => setDeleteTarget(r) : undefined}
  style={{
    ...actionBtn(canDelete ? "#c60000" : "#ccc"),
    cursor: canDelete ? "pointer" : "not-allowed",
    opacity: canDelete ? 1 : 0.5,
    pointerEvents: canDelete ? "auto" : "none",
  }}
  title={canDelete ? "Delete" : "You don't have permission"}
>
  <FaTrash />
</div>




    </div>
  ),
  ignoreRowClick: true,
  allowOverflow: true,
  button: true,
  maxWidth: "150px",  // fixed max width for column
  minWidth: "150px",  // ensures column doesn't shrink too much
}


  ];

  const isRestricted = Number(roles.id) === 2;

  // Filtered tickets by subject, category, or status
  const filtered = tickets.filter(
    t =>
      t.id?.toString().includes(filter) ||
      (t.subject?.toLowerCase().includes(filter.toLowerCase()) ||
        t.category?.toLowerCase().includes(filter.toLowerCase()) ||
        t.status?.toLowerCase().includes(filter.toLowerCase()))

  );

  return (
    <div className="layout">
      <div className="main-content">
        <h2>Tickets Management</h2>
        <Dashboard />
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search by subject, category or status..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ flex: 1, maxWidth: 300, padding: 8 }}
          />
          <button
            onClick={() => setShowAdd(true)}
            style={{
              backgroundColor: "#c60000",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          > 
            Add Ticket
          </button>
        </div>
        <div style={{ width: "100%", overflowX: "hidden" }}>
       <DataTable
  columns={columns}
  data={filtered}
  pagination
  highlightOnHover
  striped={false}
  responsive={false}   // prevent horizontal scroll
  persistTableHead
  customStyles={{
    ...customStyles,
    table: {
      style: { tableLayout: "fixed", width: "100%" }
    },
    cells: { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }
  }}
  conditionalRowStyles={[
    { when: row => normalizeStatus(row.status) === "pending", style: { backgroundColor: "#fbd19eff" } },
    { when: row => normalizeStatus(row.status) === "inprogress", style: { backgroundColor: "#a1e1ffff" } },
    { when: row => normalizeStatus(row.status) === "open", style: { backgroundColor: "#98f9baff" } },
    { when: row => normalizeStatus(row.status) === "closed", style: { backgroundColor: "#fab2b2ff" } },
  ]}
  onRowDoubleClicked={handleRowDoubleClick}
/>
</div>








        {/* Add Ticket Modal */}
        {showAdd && (
          <ModalBackdrop>
          <div
  style={{
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 30,
    width: "1200px",
    maxWidth: "95%",
    marginTop:"5%",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  height:"auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    transform: "scale(0.9)", // 👈 zoom out
    transformOrigin: "top center",
  }}
>

              <h3 style={{ marginBottom: 24, textAlign: "center" }}>Add Ticket</h3>

              <form
                onSubmit={handleAdd}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: '0px',
                  alignItems: "start",
                }}

              >
                {/* --- Client Selection (Full Width) --- */}
                <div style={{ gridColumn: "span 2", position: "relative" }}>
  <label style={{ display: "block", marginBottom: 6 }}>Client</label>

  {/* Client search input */}
  <input
    type="text"
    placeholder="Search client..."
    value={clientSearch}
    ref={clientSearchRef}
    onChange={(e) => {
      setClientSearch(e.target.value);
      setOpenDropdown(true);
    }}
    onFocus={() => setOpenDropdown(true)}
    style={{
      width: "100%",
      padding: 10,
      border: "1px solid #ccc",
      borderRadius: 4,
    }}
    autoFocus // ensure cursor appears when opening modal
  />

  {/* Dropdown list */}
  {openDropdown && clientSearch.trim() !== "" && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: 4,
        marginTop: 4,
        maxHeight: 220,
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
      }}
    >
      {filteredClients.length > 0 ? (
        filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => {
              setSelectedClient(client);
              setClientSearch(
                `${client.reference_id} ${client.first_name} ${client.last_name}`
              );
              setOpenDropdown(false);
              setAddForm((prev) => ({
                ...prev,
                client_id: client.reference_id,
              }));
            }}
            style={{
              padding: 8,
              borderBottom: "1px solid #f1f1f1",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {client.reference_id} {client.first_name} {client.last_name}
          </div>
        ))
      ) : (
        <div style={{ padding: 8, color: "#888" }}>No results found</div>
      )}
    </div>
  )}
</div>

                {/* Subject */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>Subject</label>
             <input
  value={addForm.subject}
  id="add_subject"
  disabled={!hasPermission("add_subject")}
  onChange={(e) =>
    setAddForm((f) => ({ ...f, subject: e.target.value }))
  }
  required
  maxLength={50} // <-- limit to 200 characters
  style={{
    width: "100%",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc"
  }}
/>

                </div>

                {/* Category */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>Category</label>
                  <select
                    value={addForm.category}
                    disabled={!hasPermission("add_category")}
                    id="add_category"
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, category: e.target.value }))
                    }
                    required
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  >
                    <option value="">-- Select Category --</option>
                    {AllowedCategories.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>Severity</label>
                  <select
                    value={addForm.severity}
                    disabled={!hasPermission("add_severity")}
                    id="add_severity"
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, severity: e.target.value }))
                    }
                    required
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  >
                    {AllowedSeverities.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>Status</label>
                  <select
                    value={addForm.status}
                    id="add_status_ticket"
                    disabled={!hasPermission("add_status_ticket")}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, status: e.target.value }))
                    }
                    required
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  >
                    {AllowedStatusesAdd.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Call Source */}
                <div>
                  <label style={{ display: "block", marginBottom: 6 }}>Call Source</label>
                  <select
                    value={addForm.call_source}
                    id="add_call_source"
                    disabled={!hasPermission("add_call_source")}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, call_source: e.target.value }))
                    }
                    required
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  >
                    <option value="">-- Select Call Source --</option>
                    {AllowedCallSource.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description (full width) */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: 6 }}>Description</label>
                  <textarea
                    id="add_description"
                    value={addForm.description}
                    disabled={!hasPermission("add_description")}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, description: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      minHeight: 120,
                      resize: "vertical",
                    }}
                  />
                </div>

           {/* Assignment Section */}
<div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 16 }}>
  <label style={{ fontWeight: "600", fontSize: 14 }}>Assignment Options</label>

  <div style={{
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    alignItems: "flex-start"
  }}>
    {/* Department Assignment */}
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#555" }}>
        Assign to Department
      </label>
      <select
        value={addForm.role_id || ""}
        disabled={!hasPermission("add_role_id")}
        onChange={(e) =>
          setAddForm(prev => ({ ...prev, role_id: e.target.value ? Number(e.target.value) : null }))
        }
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
          fontSize: 14,
          backgroundColor: "#fafafa",
          cursor: "pointer"
        }}
      >
        <option value="">-- Select Department --</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.role_name}</option>
        ))}
      </select>
      {addForm.role_id && (
        <div style={{ marginTop: 6, color: "#007BFF", fontSize: 12 }}>
          Assigned to department: <strong>{roles.find(r => r.id == addForm.role_id)?.role_name}</strong>
        </div>
      )}
    </div>

    {/* User Assignment */}
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#555" }}>
        Assign to User
      </label>
      <select
        value={addForm.assigned_user || ""}
        disabled={!hasPermission("add_assigned_user")}
        onChange={(e) =>
          setAddForm(prev => ({ ...prev, assigned_user: e.target.value ? Number(e.target.value) : null }))
        }
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
          fontSize: 14,
          backgroundColor: "#fafafa",
          cursor: "pointer"
        }}
      >
        <option value="">-- Select User --</option>
        {Users.map(user => (
          <option key={user.id} value={user.id}>{user.username}</option>
        ))}
      </select>
      {addForm.assigned_user && (
        <div style={{ marginTop: 6, color: "#28a745", fontSize: 12 }}>
          Assigned to user: <strong>{Users.find(u => u.id == addForm.assigned_user)?.username}</strong>
        </div>
      )}
    </div>
  </div>

  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
    You can assign this ticket to a department, a user, or both.
  </div>
</div>


                {/* Buttons (Full Width) */}
                <div
                  style={{
                    gridColumn: "span 2",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#ccc",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#c60000",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </ModalBackdrop>
        )}



        {/* Edit Ticket Modal */}

        {showEdit && (
          <ModalBackdrop>
              <div
  style={{
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 30,
    width: "1200px",
    maxWidth: "95%",
    marginTop:"5%",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  height:"auto",
    display: "flex",
    flexDirection: "column",
   
    transform: "scale(0.9)", // 👈 zoom out
    transformOrigin: "top center",
  }}
>
              <h3>{isAdmin ? "Edit Ticket" : "View Ticket"}</h3>
              {!isAdmin &&
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#ccc",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    X
                  </button>

                  {isAdmin && (
                    <button
                      type="submit"
                      form="editForm" // if needed
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#c60000",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      Save
                    </button>
                  )}
                </div>}


              <form onSubmit={handleEdit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <label>
                  Client ID
                </label>

                <select style={{ width: "100%", padding: 8, marginBottom: 12,marginTop:10 }}
                  value={editForm.client_id}
                  id="edit_id"
                  disabled={!hasPermission("edit_id")}
                  onChange={handleClientChangeEdit}
                  required >
                  <option value="">-- Select Client --</option>
                  {salesclients.map(client => (<option key={client.id}
                    value={client.reference_id}>
                    {client.reference_id}
                  </option>))}
                </select>

                <label>Subject</label>
                <input value={editForm.subject}
                  id="edit_subject"
                  disabled={!hasPermission("edit_subject")}
                  onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                  required style={{ width: "100%", padding: 8, marginBottom: 12 }} />

                <label>Description</label>

                <input value={editForm.description}
                           id="edit_description"
                      disabled={!hasPermission("edit_description")}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: "100%", padding: 8}} />

                <label>Category</label>
                <select
                  id="edit_category"
                  disabled={!hasPermission("edit_category")}
                  value={editForm.category}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                >

                  {AllowedCategories.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label>Severity</label>

                <select value={editForm.severity}
                  id="edit_severity"
                  disabled={!hasPermission("edit_severity")}
                  onChange={e => setEditForm(f => ({ ...f, severity: e.target.value }))}
                  required style={{ width: "100%", padding: 8, marginBottom: 12 }} >
                  {AllowedSeverities.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>

                <label>Status</label>
                <select value={editForm.status}
                  id="edit_status_ticket"
                  disabled={!hasPermission("edit_status_ticket")}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  required style={{ width: "100%", padding: 8, marginBottom: 12 }} >
                  {AllowedStatusesEdit.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                   <label>Call Source</label>
                <select
                  value={editForm.call_source}
                             id="edit_call_source"
                      disabled={!hasPermission("edit_call_source")}
                  onChange={e => setEditForm(f => ({ ...f, call_source: e.target.value }))}
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                >

                  {AllowedCallSource.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
             <div style={{
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
  alignItems: "flex-start"
}}>
  {/* Department Assignment */}
<div style={{
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
  alignItems: "flex-start"
}}>
  {/* Department Assignment */}
  <div style={{ flex: 1, minWidth: 200 }}>
 <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#555" }}>
            Assign to Department
          </label>
   <select
  value={editForm.assigned_to || ""}
  disabled={!hasPermission("edit_role_id")}
  onChange={(e) =>
    setEditForm(prev => ({ ...prev, assigned_to: e.target.value ? Number(e.target.value) : null }))
  }
  style={{
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    backgroundColor: "#fafafa",
    cursor: "pointer"
  }}
>
  <option value="">-- Select Department --</option>
  {roles.map(role => (
    <option key={role.id} value={role.id}>{role.role_name}</option>
  ))}
</select>

{editForm.assigned_to && (
  <div style={{ marginTop: 6, color: "#007BFF", fontSize: 12 }}>
    Assigned to department: <strong>{roles.find(r => r.id === editForm.assigned_to)?.role_name}</strong>
  </div>
)}

        </div>

        {/* User Assignment */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#555" }}>
            Assign to User
          </label>
          <select
            value={editForm.assigned_user || ""}
            disabled={!hasPermission("edit_assigned_user")}
            onChange={(e) =>
              setEditForm(prev => ({ ...prev, assigned_user: e.target.value ? Number(e.target.value) : null }))
            }
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
              backgroundColor: "#fafafa",
              cursor: "pointer"
            }}
          >
            <option value="">-- Select User --</option>
            {Users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          {editForm.assigned_user && (
            <div style={{ marginTop: 6, color: "#28a745", fontSize: 12 }}>
              Assigned to user: <strong>{Users.find(u => u.id == editForm.assigned_user)?.username}</strong>
            </div>
          )}
        </div>
</div>

</div>


               

             

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 20 ,height:"60%",marginTop:"2%",width:"50%",marginLeft:"50%"}}>
                  <button type="button" onClick={() => setShowEdit(false)}
                    style={{ padding: "8px 16px", backgroundColor: "#ccc", border: "none", borderRadius: 4, cursor: "pointer",width:"50%" }} >
                    Cancel </button> <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#c60000", color: "#fff",width:"50%", border: "none", borderRadius: 4, cursor: "pointer" }} >
                    Save </button>



                </div>
              </form>




              {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
  <p><strong>Ticket ID:</strong> {editForm.id}</p>
  <p><strong>Client ID:</strong> {editForm.client_id}</p>
  <p><strong>Subject:</strong> {editForm.subject}</p>
  <p><strong>Description:</strong> {editForm.description}</p>
  <p><strong>Category:</strong> {editForm.category}</p>
  <p><strong>Severity:</strong> {editForm.severity}</p>
  <p><strong>Status:</strong> {editForm.status}</p>
  <p><strong>Assigned Department:</strong> {
    roles.find(r => r.id === editForm.assigned_to)?.role_name || "-"
  }</p>
  <p><strong>User Assigned:</strong> {
    Users.find(u => u.id === editForm.user_id)?.username || "-"
  }</p>
  <p><strong>Call Source:</strong> {editForm.call_source}</p>
  <p><strong>Created At:</strong> {new Date(editForm.created_at).toLocaleString()}</p>



  
  <div style={{ gridColumn: "1 / -1", marginTop: "0px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      
      <h4>Comments</h4>
      <button
        onClick={() => setShowCommentModal(true)}
        style={{
          padding: "6px 12px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        Add Comment
      </button>
    </div>

    {ticketComments.filter(c => c.ticket_id === editForm.id).length === 0 ? (
      <p style={{ marginTop: 10 }}>No comments available.</p>
    ) : (
      <ul style={{ paddingLeft: 16, marginTop: 10 }}>
        {ticketComments
          .filter(c => c.ticket_id === editForm.id)
          .map((comment, index) => (
       <div key={index} style={{ 
  marginBottom: "12px", 
  padding: "10px", 
  backgroundColor: "#f9f9f9", 
  borderRadius: "6px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
}}>
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
    <span style={{ color: "red", fontWeight: "bold" }}>
      {comment.author} said:
    </span>
    <span style={{ color: "#888", fontSize: "13px" }}>
      {new Date(comment.created_at).toLocaleString()}
    </span>
  </div>
  <div style={{ color: "black", fontSize: "15px" }}>
    {comment.comment}
  </div>
</div>

          ))}
      </ul>
    )}
  </div>
</div> */}



              {showCommentModal && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "8px",
                    width: "80%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                    position: "relative"
                  }}>
                    {/* Close Button */}
                    <button onClick={() => setShowCommentModal(false)} style={{
                      position: "absolute",
                      top: "10px",
                      right: "15px",
                      fontSize: "20px",
                      border: "none",
                      background: "none",
                      cursor: "pointer"
                    }}>×</button>

                    {/* Modal Content */}
                    <h2 style={{ marginBottom: "20px" }}>Add a Comment</h2>
                    <form onSubmit={handleAddComment}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{
                          width: "100%",
                          height: "150px",
                          padding: "10px",
                          fontSize: "16px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          resize: "vertical"
                        }}
                        placeholder="Write your comment here..."
                        required
                      />
                      <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" style={{
                          padding: "10px 20px",
                          backgroundColor: "#007BFF",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}>
                          Submit Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


            </div>
          </ModalBackdrop>
        )}


        {/* Confirm Delete Modal */}
        {deleteTarget && (
          <ModalBackdrop>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 8,
                width: 320,
                textAlign: "center"
              }}
            >
              <p>
                Delete ticket "<strong>{deleteTarget.subject}</strong>"?
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 15 }}>
                <button
                  style={{
                    backgroundColor: "#ccc",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    backgroundColor: "#c60000",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {msg && (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: msg.startsWith("✅") ? "#d4edda" : "#f8d7da",
              color: msg.startsWith("✅") ? "#155724" : "#721c24",
              borderRadius: 4,
              width: "fit-content"
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

const ModalBackdrop = ({ children }) => (
  <div
    style={{
      position: "fixed",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    {children}
  </div>
);

export default View_Tickets;