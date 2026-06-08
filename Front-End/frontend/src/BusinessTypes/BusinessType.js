import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";

function BusinessType() {
  const API_URL = process.env.REACT_APP_API_URL;
const addInputRef = useRef(null);
const editInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [businessTypes, setBusinessTypes] = useState([]);
  const [filter, setFilter] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [current, setCurrent] = useState(null);
  const [addForm, setAddForm] = useState({ type: '' });
  const [editForm, setEditForm] = useState({ type: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [msg, setMsg] = useState("");

  const [permissions, setPermissions] = useState([]);
  const [roleId, setRoleId] = useState(null);

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const iconStyle = {
    cursor: "pointer",
    fontSize: "1.2rem",
    transition: "color 0.2s"
  };
useEffect(() => {
  if (showAdd && addInputRef.current) {
    addInputRef.current.focus();
  }
}, [showAdd]);
useEffect(() => {
  if (showEdit && editInputRef.current) {
    editInputRef.current.focus();
  }
}, [showEdit]);

  // ============================
  // Fetch user & permissions
  // ============================
  useEffect(() => {
    const fetchUserPermissions = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const { data: user } = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsername(user.username);
        setRoleId(user.role_id);
        sessionStorage.setItem("user", user.username);

        const { data: userPermissions } = await axios.get(
          `${API_URL}/api/UserRoles/permissions-for-user`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setPermissions(Array.isArray(userPermissions) ? userPermissions : []);
      } catch (error) {
        console.error("Error fetching user or permissions:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  const hasPermission = (perm) => roleId === 1 || permissions.includes(perm);

  // ============================
  // Fetch Business Types
  // ============================
  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  const fetchBusinessTypes = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/BusinessTypes`);
      
      setBusinessTypes(data);
    } catch (e) {
      console.error(e);
    }
  };

  // ============================
  // Add
  // ============================
 const handleAdd = async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem("token"); // get token if user is logged in

  try {
    const { data } = await axios.post(
      `${API_URL}/api/BusinessTypes/CreateBusiness`,
      addForm,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    setMsg("✅ Business Type added");
    setShowAdd(false);
    setAddForm({ type: "" });

    fetchBusinessTypes(); // refresh the list
  } catch (err) {
    if (err.response) {
      // Server responded with a status other than 2xx
      setMsg(`❌ Failed to add: ${err.response.data}`);
    } else {
      setMsg("❌ Failed to add");
    }
    console.error("Add business type error:", err);
  }
};


  // ============================
  // Open Edit
  // ============================
  const openEdit = (type) => {
    setEditForm({ type: type.type });
    setCurrent(type.id);
    setShowEdit(true);
  };

  // ============================
  // Edit
  // ============================
const handleEdit = async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem("token"); // get token if user is logged in

  try {
    const { data } = await axios.put(
      `${API_URL}/api/BusinessTypes/${current}`,
      editForm,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    setMsg("✅ Business Type updated");
    setShowEdit(false);

    fetchBusinessTypes(); // refresh the list
  } catch (err) {
    if (err.response) {
      // Show server error message if available
      setMsg(`❌ Failed to update: ${err.response.data}`);
    } else {
      setMsg("❌ Failed to update");
    }
    console.error("Update business type error:", err);
  }
};


  // ============================
  // Delete
  // ============================
const handleDelete = async () => {
  const token = sessionStorage.getItem("token"); // get token if user is logged in

  if (!deleteTarget) return;

  try {
    const { data } = await axios.delete(
      `${API_URL}/api/BusinessTypes/${deleteTarget.id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    setMsg("✅ Business Type deleted");
    setDeleteTarget(null);
    fetchBusinessTypes(); // refresh the list
  } catch (err) {
    if (err.response) {
      setMsg(`❌ Failed to delete: ${err.response.data}`);
    } else {
      setMsg("❌ Failed to delete");
    }
    console.error("Delete business type error:", err);
  }
};

  // ============================
  // Filter
  // ============================
  const filtered = businessTypes.filter((b) =>
    b.type.toLowerCase().includes(filter.toLowerCase())
  );

  // ============================
  // Table columns
  // ============================
  const columns = [
    { name: "Type", selector: (r) => r.type, sortable: true },
    {
      name: "Actions",
      cell: (r) => (
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

  // ============================
  // Component return
  // ============================
  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>Business Types List</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
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
            Add Business Type
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
        />

        {/* --------------------- ADD MODAL --------------------- */}
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
              <h3>Add Business Type</h3>

              <form onSubmit={handleAdd}>
                <label>Type</label>
               <input
               disabled={!hasPermission("add_business_type")}
  name="type"
  ref={addInputRef}  // <-- focus here
  value={addForm.type}
  onChange={(e) =>
    setAddForm((f) => ({ ...f, type: e.target.value }))
  }
  required
  style={{ width: "100%", padding: 8, marginBottom: 12 }}
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

        {/* --------------------- EDIT MODAL --------------------- */}
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
              <h3>Edit Business Type</h3>

              <form onSubmit={handleEdit}>
                <label>Type</label>
               <input
               disabled={!hasPermission("edit_business_type")}
  name="type"
  ref={editInputRef}  // <-- focus here
  value={editForm.type}
  onChange={(e) =>
    setEditForm((f) => ({ ...f, type: e.target.value }))
  }
  required
  style={{ width: "100%", padding: 8, marginBottom: 12 }}
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

        {/* --------------------- DELETE CONFIRM --------------------- */}
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

export default BusinessType;
