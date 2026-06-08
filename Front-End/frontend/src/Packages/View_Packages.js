import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
function View_Packages() {
  const [packages, setPackages] = useState([]);
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
     const API_URL = process.env.REACT_APP_API_URL;
  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service_type: "",
    package_name: "",
    bandwidth: "",
    price: "",
    notes: "",
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
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
    },
  },

  rows: {
    style: {
      fontSize: "1rem",
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
      padding: "12px 15px",
      fontSize: "1rem",
      whiteSpace: "normal",
      wordBreak: "break-word",
      textAlign: "center",
    },
  },
};

const hoverStyle = {
  ':hover': { opacity: 0.7 }
};

  useEffect(() => {
    fetchPackages();
    fetchServices();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/Packages`);
      setPackages(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/Services`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
const canDelete = hasPermission("delete_package");
  const openEditModal = (pkg) => {
    setFormData({
      service_type: pkg.service_type,
      package_name: pkg.package_name,
      bandwidth: pkg.bandwidth,
      price: pkg.price,
      notes: pkg.notes,
    });
    setCurrentEditId(pkg.id);
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/Packages/CreatePackage`, formData);
      setMessage("✅ Package added successfully!");
      setShowAddModal(false);
      fetchPackages();
    } catch {
      setMessage("❌ Failed to add package.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Packages/${currentEditId}`, formData);
      setMessage("✅ Package updated successfully!");
      setShowEditModal(false);
      fetchPackages();
    } catch {
      setMessage("❌ Failed to update package.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/Packages/${deleteTarget.id}`);
      setMessage("✅ Package deleted.");
      setDeleteTarget(null);
      fetchPackages();
    } catch {
      setMessage("❌ Failed to delete package.");
    }
  };

  const columns = [
    { name: "Service Type", selector: row => row.service_type, sortable: true },
    { name: "Package Name", selector: row => row.package_name, sortable: true },
    { name: "Bandwidth", selector: row => row.bandwidth, sortable: true },
    { name: "Price", selector: row => row.price, sortable: true, right: true },
    { name: "Notes", selector: row => row.notes, wrap: true },
   {
  name: "Actions",
  cell: pkg => (
    <div style={{ display: "flex", gap: "10px" }}>
      <FaEdit
        onClick={() => openEditModal(pkg)}
        style={{ ...iconStyle, color: "#007bff" }}
        title="Edit"
      />
     
<FaTrash
  onClick={canDelete ? () => setDeleteTarget(pkg) : undefined}
  style={{
    ...iconStyle,
    color: canDelete ? "#c60000" : "#ccc",
    cursor: canDelete ? "pointer" : "not-allowed",
    opacity: canDelete ? 1 : 0.5,
    pointerEvents: canDelete ? "auto" : "none",
  }}
  title={canDelete ? "Delete" : "You don't have permission to delete"}
/>
    </div>
  )
}

  ];

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: "30px" }}>
        <h2 className="title">Package List</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
       
          <input
            placeholder="Search..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{ padding: "8px", flex: 1, maxWidth: "300px" }}
          />
             <button onClick={() => setShowAddModal(true)} style={addBtnStyle}>Add Package</button>
        </div>
    <DataTable
  columns={columns}
  data={packages.filter(pkg =>
    (pkg.package_name + pkg.service_type)
      .toLowerCase()
      .includes(filterText.toLowerCase())
  )}
  pagination
  highlightOnHover
  striped
  responsive
  persistTableHead
  customStyles={customStyles}
/>


        {/* Add Modal */}
        {showAddModal && modal("Add Package", handleAddSubmit)}

        {/* Edit Modal */}
        {showEditModal && modal("Edit Package", handleEditSubmit)}

        {/* Confirm Delete */}
        {deleteTarget && (
          <ModalBackdrop>
            <div style={modalWindowStyle}>
              <p align="center">Delete “<strong>{deleteTarget.package_name}</strong>”?</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                <button onClick={() => setDeleteTarget(null)} style={cancelBtnStyle}>Cancel</button>
                <button onClick={handleDelete} style={deleteBtnStyle}>OK</button>
              </div>
            </div>
          </ModalBackdrop>
        )}

        {message && (
          <p style={{ marginTop: "20px", fontWeight: "bold", color: message.includes("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );

 function modal(title, onSubmit) {
  const isEdit = title.startsWith("Edit");

  return (
    <ModalBackdrop>
      <div style={modalWindowStyle}>
        <h3>{title}</h3>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            padding: "30px",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
          onSubmit={onSubmit}
        >
          <label>Service Type</label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleFormChange}
            disabled={
              isEdit
                ? !hasPermission("edit_service_typep")
                : !hasPermission("add_service_typep")
            }
            required
            style={inputStyle}
          >
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.service_name}>
                {s.service_name}
              </option>
            ))}
          </select>

          <label>Package Name</label>
          <input
            name="package_name"
            type="text"
            value={formData.package_name}
            onChange={handleFormChange}
            disabled={
              isEdit
                ? !hasPermission("edit_package_name")
                : !hasPermission("add_package_name")
            }
            required
            style={inputStyle}
          />

          <label>Bandwidth</label>
          <input
            name="bandwidth"
            type="text"
            value={formData.bandwidth}
            onChange={handleFormChange}
            disabled={
              isEdit ? !hasPermission("edit_bandwidth") : !hasPermission("add_bandwidth")
            }
            required
            style={inputStyle}
          />

          <label>Price</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleFormChange}
            disabled={isEdit ? !hasPermission("edit_price") : !hasPermission("add_price")}
            required
            style={inputStyle}
          />

          <label>Notes</label>
          <input
            name="notes"
            type="text"
            value={formData.notes}
            onChange={handleFormChange}
            disabled={isEdit ? !hasPermission("edit_notes") : !hasPermission("add_notes")}
            style={inputStyle}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                isEdit ? setShowEditModal(false) : setShowAddModal(false)
              }
              style={cancelBtnStyle}
            >
              Cancel
            </button>
            <button type="submit" style={addBtnStyle}>
              {isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

}

// Styles
const tableStyles = {
  table: { style: { fontSize: "11px", tableLayout: "fixed", width: "100%" } },
  headCells: { style: { padding: "4px 6px", fontSize: "11px" } },
  cells: { style: { padding: "4px 6px", fontSize: "11px" } },
};
const addBtnStyle = { backgroundColor: "#c60000", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" };
const deleteBtnStyle = { backgroundColor: "#c60000", color: "#fff", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" };
const btnStyle = { backgroundColor: "#007bff", color: "#fff", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px", fontSize: "0.9rem" };
const inputStyle = { width: "100%", padding: "8px", marginBottom: "12px" };
const modalWindowStyle = { backgroundColor: "#fff", padding: "30px", borderRadius: "8px", width: "460px" };
const cancelBtnStyle = { padding: "8px 16px", backgroundColor: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" };
const ModalBackdrop = ({ children }) => (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: 9999
  }}>
    {children}
  </div>
);

export default View_Packages;
