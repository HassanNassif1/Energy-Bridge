import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
function View_Types() {
     const API_URL = process.env.REACT_APP_API_URL;
  const [types, setType] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [addForm, setAddForm] = useState({ type: ""});
  const [editForm, setEditForm] = useState({ type: ""});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
   const [username, setUsername] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const location = useLocation();
     const typeRef = useRef(null);
    const isActive = (path) => location.pathname === path;
  
     useEffect(() => {
      if (showAdd && typeRef.current) {
        typeRef.current.focus();
      }
    }, [showAdd]);
    
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
const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
};
  useEffect(() => {
    fetchType();
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchType = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Types`);
      setType(data);
    } catch (e) {
      console.error(e);
    }
  };

 const openEdit = t => {
    setEditForm({ type: t.type });
    setCurrent(t.id);
    setShowEdit(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/Types/CreateType`, addForm);
      setMsg("✅ Type added");
      setShowAdd(false);
      setAddForm({ type: ""});
      fetchType();
    } catch {
      setMsg("❌ Failed to add");
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Types/${current}`, editForm);
      setMsg("✅ Supplier updated");
      setShowEdit(false);
      fetchType();
    } catch {
      setMsg("❌ Failed to update");
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

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/Types/${deleteTarget.id}`);
      setMsg("✅ Type deleted");
      setDeleteTarget(null);
      fetchType();
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

 const columns = [
  { name: "type", selector: r => r.type, sortable: true },

  {
    name: "Actions",
    cell: r => (
      <div style={{ display: "flex", gap: "10px" }}>
        <FaEdit
          onClick={() => openEdit(r)}
          style={{ ...iconStyle, color: "#007bff" }}
          title="Edit"
        />
        <FaTrash
          onClick={() => setDeleteTarget(r)}
          style={{ ...iconStyle, color: "#c60000" }}
          title="Delete"
        />
      </div>
    )
  }
];


  const filtered = types.filter(
    t =>
      t.type.toLowerCase().includes(filter.toLowerCase()) 
     

  );

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>Types List</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ flex: 1, maxWidth: "300px", padding: 8 }}
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
            Add Type
          </button>
        </div>
      <DataTable
  columns={columns}
  data={filtered}
  pagination
  highlightOnHover
  striped
  responsive
  persistTableHead
  customStyles={customStyles}
/>

        {/* Add DSP Modal */}
        {showAdd && (
          <ModalBackdrop>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 30,
                borderRadius: 8,
                width: 400
              }}
            >
              <h3>Add Type</h3>
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
             
                <label>Type</label>
                <input
                 ref={typeRef}
                disabled={!hasPermission('add_type')}
                id="add_type"
                  name="type"
                  value={addForm.type}
                  onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />
 
                <div
                  style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
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
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#c60000",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </ModalBackdrop>
        )}

        {/* Edit DSP Modal */}
        {showEdit && (
          <ModalBackdrop>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 30,
                borderRadius: 8,
                width: 400
              }}
            >
              <h3>Edit Type</h3>
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
                <label>Type</label>
                <input
                  name="type"
                    disabled={!hasPermission('edit_type')}
                id="edit_type"
                  value={editForm.type}
                  onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
                />

             
                <div
                  style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
                >
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
                    Cancel
                  </button>
                  <button
                    type="submit"
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
                </div>
              </form>
            </div>
          </ModalBackdrop>
        )}

        {/* Confirm Delete */}
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
                Delete "<strong>{deleteTarget.type}</strong>"?
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

        {msg && (
          <p
            style={{
              marginTop: 20,
              fontWeight: "bold",
              color: msg.includes("✅") ? "green" : "red"
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

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

export default View_Types;
