import React, { useState, useEffect,useRef  } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";

function View_Dsps() {
   const API_URL = process.env.REACT_APP_API_URL;
    const [username, setUsername] = useState("");
    const addCodeRef = useRef(null); // Ref for Add DSP code input
 const editCodeRef = useRef(null); // Ref for Add DSP code input
  const [dsps, setDsps] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [addForm, setAddForm] = useState({ code: "", name: "" });
  const [editForm, setEditForm] = useState({ code: "", name: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
};
useEffect(() => {
  if (showAdd && addCodeRef.current) {
    addCodeRef.current.focus();
  }
}, [showAdd]);
useEffect(() => {
  if (showEdit && editCodeRef.current) {
    editCodeRef.current.focus();
  }
}, [showEdit]);

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
  useEffect(() => {
    fetchDsps();
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchDsps = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Dsps`);
      setDsps(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = dsp => {
    setEditForm({ code: dsp.code, name: dsp.name });
    setCurrent(dsp.id);
    setShowEdit(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/Dsps/CreateDsp`, addForm);
      setMsg("✅ DSP added");
      setShowAdd(false);
      setAddForm({ code: "", name: "" });
      fetchDsps();
    } catch {
      setMsg("❌ Failed to add");
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Dsps/${current}`, editForm);
      setMsg("✅ DSP updated");
      setShowEdit(false);
      fetchDsps();
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


  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/Dsps/${deleteTarget.id}`);
      setMsg("✅ DSP deleted");
      setDeleteTarget(null);
      fetchDsps();
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

  const columns = [
    { name: "Code", selector: r => r.code, sortable: true },
    { name: "Name", selector: r => r.name, sortable: true },
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

  const filtered = dsps.filter(
    d =>
      d.code.toLowerCase().includes(filter.toLowerCase()) ||
      (d.name && d.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>DSP List</h2>
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
            Add DSP
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
              <h3>Add DSP</h3>
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
                <label>Code</label>
              <input
  id="add_code"
  ref={addCodeRef} // <- attach the ref here
  disabled={!hasPermission("add_code")}
  name="code"
  value={addForm.code}
  onChange={e => setAddForm(f => ({ ...f, code: e.target.value }))}
  style={{ width: "100%", padding: 8, marginBottom: 12 }}
  required
/>


                <label>Name</label>
                <input
                  name="name"
                  value={addForm.name}
                  id="add_name" 
                  disabled={!hasPermission("add_name")}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
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
              <h3>Edit DSP</h3>
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
                <label>Code</label>
             <input
  id="edit_code"
  ref={editCodeRef} // <- attach the ref here
  disabled={!hasPermission("edit_code")}
  name="code"
  value={editForm.code}
  onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))}
  style={{ width: "100%", padding: 8, marginBottom: 12 }}
  required
/>


                <label>Name</label>
                <input
                  name="name"
                  value={editForm.name}
                   id="edit_name"
                  disabled={!hasPermission("edit_name")}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
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
                Delete "<strong>{deleteTarget.code}</strong>"?
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

export default View_Dsps;
