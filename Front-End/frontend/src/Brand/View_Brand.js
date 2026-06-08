import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
function View_Brand() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [brand, setBrands] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [addForm, setAddForm] = useState({ brand: "", status: "" });
  const [editForm, setEditForm] = useState({ brand: "", status: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
  const [username, setUsername] = useState("");
   const brandRef = useRef(null);
    const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
      useEffect(() => {
        if (showAdd && brandRef.current) {
          brandRef.current.focus();
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
    fetchBrands();
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Brand`);
      setBrands(data);
    } catch (e) {
      console.error(e);
    }
  };

 const openEdit = b => {
    setEditForm({ brand: b.brand, status: b.status });
    setCurrent(b.id);
    setShowEdit(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/Brand/CreateBrand`, addForm);
      setMsg("✅ Brand added");
      setShowAdd(false);
      setAddForm({ brand: "", status: "" });
      fetchBrands();
    } catch {
      setMsg("❌ Failed to add");
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Brand/${current}`, editForm);
      setMsg("✅ Vrand updated");
      setShowEdit(false);
      fetchBrands();
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
      await axios.delete(`${API_URL}/api/Brand/${deleteTarget.id}`);
      setMsg("✅ Brand deleted");
      setDeleteTarget(null);
      fetchBrands();
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

 const columns = [
  { name: "Brand", selector: r => r.brand, sortable: true },
  { name: "Status", selector: r => r.status, sortable: true },
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


  const filtered = brand.filter(
    b =>
      b.brand.toLowerCase().includes(filter.toLowerCase()) 
      || (b.status &&b.status.toLowerCase().includes(filter.toLowerCase()))

  );

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>Brand List</h2>
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
            Add Brand
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
              <h3>Add Brand</h3>
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
             
                <label>Brand</label>
                <input
                  name="brand"
                   ref={brandRef}
                  id="add_brand"
                  disabled={!hasPermission("add_brand")}
                  value={addForm.brand}
                  onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />
   <label>Status</label>
                <input
                  id="add_status_brand"
                  disabled={!hasPermission("add_status_brand")}
                  name="status"
                  value={addForm.status}
                  onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
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
              <h3>Edit Brand</h3>
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
                <label>Brand</label>
                <input
                  id="edit_brand"
                  disabled={!hasPermission("edit_brand")}
                  name="brand"
                  value={editForm.brand}
                  onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
                />

                <label>Status</label>
                <input
                  name="status"
                    id="edit_status_brand"
                  disabled={!hasPermission("edit_status_brand")}
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
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
                Delete "<strong>{deleteTarget.brand}</strong>"?
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

export default View_Brand;
