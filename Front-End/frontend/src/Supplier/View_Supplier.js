import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
function View_Supplier() {
  const [supplier, setSupplier] = useState([]);
     const API_URL = process.env.REACT_APP_API_URL;
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
  const [addForm, setAddForm] = useState({ brand: "", status: "" });
  const [editForm, setEditForm] = useState({ brand: "", status: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
   const [username, setUsername] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const location = useLocation();
     const supplierRef = useRef(null);
    const isActive = (path) => location.pathname === path;
   useEffect(() => {
    if (showAdd && supplierRef.current) {
      supplierRef.current.focus();
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
    fetchSupplier();
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchSupplier = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Supplier`);
      setSupplier(data);
    } catch (e) {
      console.error(e);
    }
  };

 const openEdit = s => {
    setEditForm({ supplier: s.supplier, status: s.status,mobile:s.mobile,email:s.email });
    setCurrent(s.id);
    setShowEdit(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/Supplier/CreateSupplier`, addForm);
      setMsg("✅ Supplier added");
      setShowAdd(false);
      setAddForm({ brand: "", status: "" });
      fetchSupplier();
    } catch {
      setMsg("❌ Failed to add");
    }
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Supplier/${current}`, editForm);
      setMsg("✅ Supplier updated");
      setShowEdit(false);
      fetchSupplier();
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
      await axios.delete(`${API_URL}/api/Supplier/${deleteTarget.id}`);
      setMsg("✅ Supplier deleted");
      setDeleteTarget(null);
      fetchSupplier();
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

const columns = [
  { name: "Supplier", selector: r => r.supplier, sortable: true },
  { name: "Mobile", selector: r => r.mobile, sortable: true },
  { name: "Email", selector: r => r.email, sortable: true },
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


  const filtered = supplier.filter(
    s =>
      s.supplier.toLowerCase().includes(filter.toLowerCase()) 
      || (s.status &&s.status.toLowerCase().includes(filter.toLowerCase())) ||
      (s.mobile &&s.mobile.toLowerCase().includes(filter.toLowerCase())) ||
        (s.email &&s.email.toLowerCase().includes(filter.toLowerCase()))

  );

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>Suppliers List</h2>
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
            Add Supplier
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
              <h3>Add Supplier</h3>
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
             
                <label>Supplier</label>
                <input
                 ref={supplierRef}
                disabled={!hasPermission("add_supplier_s")}
                id="add_supplier_s"
                  name="supplier"
                  value={addForm.supplier}
                  onChange={e => setAddForm(f => ({ ...f, supplier: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />
   <label>Status</label>
                <input
                 disabled={!hasPermission("add_status_s")}
                id="add_status"
                  name="status"
                  value={addForm.status}
                  onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
                />
<label>Mobile</label>
                <input
                 disabled={!hasPermission("add_mobile_s")}
                id="add_mobile"
                  name="mobile"
                  value={addForm.mobile}
                  onChange={e => setAddForm(f => ({ ...f, mobile: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
                />
                <label>Email</label>
                <input
                  name="email"
                   disabled={!hasPermission("add_email_s")}
                id="add_email"
                  type="email"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
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
                <label>Supplier</label>
                <input
                   disabled={!hasPermission("edit_supplier_s")}
                id="edit_supplier_s"
                  name="supplier"
                  value={editForm.supplier}
                  onChange={e => setEditForm(f => ({ ...f, supplier: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 12 }}
                  required
                />

                <label>Status</label>
                <input
                 disabled={!hasPermission("edit_status_supplier_s")}
                id="edit_status_supplier"
                  name="status"
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />

  <label>Mobile</label>
                <input
                 disabled={!hasPermission("edit_mobile_s")}
                id="edit_mobile_s"
                  name="mobile"
                  value={editForm.mobile}
                  onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))}
                  style={{ width: "100%", padding: 8, marginBottom: 20 }}
                />
                  <label>Email</label>
                <input
                  name="email"
                   disabled={!hasPermission("edit_email_s")}
                id="edit_email_s"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
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
                Delete "<strong>{deleteTarget.supplier}</strong>"?
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

export default View_Supplier;
