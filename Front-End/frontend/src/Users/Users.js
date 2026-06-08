import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Dashboard";
import { FaEdit, FaTrash,FaEye } from "react-icons/fa";
import Sidebar from "../Dashboard/Sidebar";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
   const usernameRef = useRef(null);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
   const API_URL = process.env.REACT_APP_API_URL;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    if (showAddModal && usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [showAddModal]);
  
const [formData, setFormData] = useState({
  username: "",
  password: "",
  status: "active",
  role_id: null
});

  const [editForm, setEditForm] = useState({ username: "", password: "", status: "", role_id: ""  });

  const fetchUsers = async () => {
    const { data } = await axios.get(`${API_URL}/api/users`);
    setUsers(data);
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
      console.log(roles,"rolesssssssssssssssssssss");
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/adduser`, formData);
      fetchUsers();
      setShowAddModal(false);
      setFormData({ username: "", password: "", status: "",  role_id: Number(formData.role_id)});
   
      setMessage("✅ User added");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add user");
    
    }
  };

const handleEdit = async (e) => {
  e.preventDefault();
  try {
    const payload = { ...editForm };
    if (!payload.password) {
      delete payload.password; // don't send password if empty
    }
    await axios.put(`${API_URL}/api/users/${currentUserId}`, payload);
    fetchUsers();
    setShowEditModal(false);
    setMessage("✅ User updated");
  } catch {
    setMessage("❌ Failed to update user");
  }
};



  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/users/${deleteTarget.id}`);
      fetchUsers();
      setDeleteTarget(null);
      setMessage("✅ User deleted");
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage("❌ Cannot delete user (referenced in clients)");
      } else {
        setMessage("❌ Failed to delete user");
      }
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
    },
  },

  headRow: {
    style: {
      backgroundColor: "#c60000",
      color: "#fff",
      fontSize: "1.1rem",
      minHeight: "55px",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
    },
  },

  headCells: {
    style: {
      padding: "12px 20px",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "1.05rem",
      textAlign: "center",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
  },

  rows: {
    style: {
      minHeight: "60px",
      borderBottom: "1px solid #ccc",
      transition: "background-color 0.2s",
      textAlign: "center",

      "&:hover": {
        backgroundColor: "#f2f2f2",
      },
    },
  },

  cells: {
    style: {
      padding: "12px 14px",
      fontSize: "1rem",
      whiteSpace: "normal",
      wordBreak: "break-word",
      textAlign: "center",
    },
  },
};

 const openEditModal = (user) => {
  setEditForm({
    username: user.username,
    status: user.status || "",
    password: "", // Do NOT prefill password field
    role_id: user.role_id,
  });
  setCurrentUserId(user.id);
  setShowEditModal(true);
};
const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
};
const togglePassword = (id) => {
  setVisiblePasswords(prev => ({ 
    ...prev, 
    [id]: !prev[id] 
  }));
};

  const columns = [
    { name: "Username", selector: row => row.username, sortable: true },
{
  name: "Password",
  cell: row => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span>
        {visiblePasswords[row.id] ? row.plain_password : "********"}
      </span>
      <FaEye
        onClick={() => togglePassword(row.id)}
        style={{ cursor: "pointer" }}
      />
    </div>
  )
}

,


    {
  name: "Status",
  cell: row => (
    <label className="switch">
      <input
        type="checkbox"
        checked={row.status === "active"}
     onChange={async () => {
  const newStatus = row.status === "active" ? "inactive" : "active";
  console.log("Toggling user", row.id, "to", newStatus);

  setUsers(prevUsers =>
    prevUsers.map(user =>
      user.id === row.id ? { ...user, status: newStatus } : user
    )
  );

  try {
    const res = await axios.put(`${API_URL}/api/users/${row.id}`, {
      id: row.id,
      username: row.username,
      status: newStatus,
      role_id: row.role_id,
      password:"",
    });
    console.log("Update success", res.data);
  } catch (error) {
    console.error("Failed to update status", error);
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === row.id ? { ...user, status: row.status } : user
      )
    );
  }
}}

      />
      <span className="slider round"></span>
    </label>
  ),
  sortable: true,
},

   { 
  name: "Role", 
  selector: row => {
    const role = roles.find(r => r.id === row.role_id);
    return role ? role.role_name : "Unknown";
  }, 
  sortable: true 
},

    {
      name: "Actions",
      cell: row => (
           <div style={{ display: "flex", gap: "10px" }}>
             <FaEdit
               onClick={() => openEditModal(row)}
               style={{ ...iconStyle, color: "#007bff" }}
               title="Edit"
             />
             <FaTrash
               onClick={() => setDeleteTarget(row)}
               style={{ ...iconStyle, color: "#c60000" }}
               title="Delete"
             />
           </div>
      )
    }
  ];

  const filteredUsers = users.filter(
    u => u.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>User Management</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search users..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: 8, maxWidth: 300 }}
          />
          <button onClick={() => setShowAddModal(true)} style={{ padding: "8px 16px", backgroundColor: "#c60000", color: "white", border: "none", borderRadius: 4 }}>
            Add User
          </button>
        </div>
   <DataTable
  columns={columns}
  data={filteredUsers}
  customStyles={customStyles}
  
  highlightOnHover
  striped
/>

        {message && (
          <p style={{ marginTop: 15, color: message.includes("✅") ? "green" : "red" }}>{message}</p>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <ModalBackdrop>
          <div style={modalStyle}>
            <h3>Add User</h3>
            <form onSubmit={handleAdd}  style={{ 
            display: 'flex', 
            flexDirection: 'column',
            maxWidth: '400px',
            width: '100%',
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            padding: "30px",
            borderRadius: "8px",
            backgroundColor: "#fff"
          }}>
            <label>UserName</label>
              <input style={{ width: "100%", padding: 8, marginBottom: 12 }} 
              ref={usernameRef}
              required placeholder="Username" 
              value={formData.username} 
              onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
               />
                <label>Password</label>
              <input style={{ width: "100%", padding: 8, marginBottom: 12 }} type="password" placeholder="Password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} />
             
              <label>Role</label> 
              <select style={{ width: "100%", padding: 8, marginBottom: 12 }}required value={formData.role_id} onChange={e => setFormData(f => ({ ...f, role_id: e.target.value }))}>
                <option value="">Select Role</option>
                {roles.map(role => <option key={role.id} value={role.id}>{role.role_name}</option>)}
              </select>
              <div style={modalButtons}>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <ModalBackdrop>
          <div style={modalStyle}>
            <h3>Edit User</h3>
            <form onSubmit={handleEdit}  style={{ 
            display: 'flex', 
            flexDirection: 'column',
            maxWidth: '400px',
            width: '100%',
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            padding: "30px",
            borderRadius: "8px",
            backgroundColor: "#fff"
          }}>
              <label>UserName</label>
              <input style={{ width: "100%", padding: 8, marginBottom: 12 }}  required placeholder="Username" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
          <label>Password</label>
<input
style={{ width: "100%", padding: 8, marginBottom: 12 }} 
  type="password"
  placeholder="New Password "
  value={editForm.password}
  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
/>     
          <label>Status</label>         
      
<input 
  style={{ width: "100%", padding: 8, marginBottom: 12 }} 
  placeholder="Status" 
  value={editForm.status} 
  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} 
/>

                       <label>Role</label>
              <select style={{ width: "100%", padding: 8, marginBottom: 12 }}  required value={editForm.role_id} onChange={e => setEditForm(f => ({ ...f, role_id: e.target.value }))}>
                <option value="">Select Role</option>
                {roles.map(role => <option key={role.id} value={role.id}>{role.role_name}</option>)}
              </select>
              <div style={modalButtons}>
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
 <ModalBackdrop>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 8,
                width: 300,
                textAlign: "center"
              }}
            >
              <p>
                Delete "<strong>{deleteTarget.username}</strong>"?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: 20
                }}
              >
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "red",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </ModalBackdrop>
      )}
    </div>
  );
}

const modalStyle = {
  backgroundColor: "#fff",
  padding: 25,
  borderRadius: 8,
  width: 400,
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 15
};

const ModalBackdrop = ({ children }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    {children}
  </div>
);

export default Users;










