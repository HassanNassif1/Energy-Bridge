import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import BusinessType from "../BusinessTypes/BusinessType";
function View_Clients() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState("");
   const [formData, setFormData] = useState({
    // initialize your form data fields here, e.g.
    package_type: '',
    downloadSpeed: '',
    uploadSpeed: '',
    // ...other fields you use
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setEditClientData(prev => ({
      ...prev,
      [name]: value,
    }));
  }
const actionBtnStyle = (color) => ({
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
  flexShrink: 0, // prevents shrinking when zooming
});


  const[BusinessType,setBusinessTypes]=useState([]);
    const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
   useEffect (()=>{
 const fetchBusinessTypes = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/BusinessTypes`);
        
        setBusinessTypes(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBusinessTypes() 
   },[]);
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
   const [downloadSpeed, setDownloadSpeed] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [salesclients, setSalesClients] = useState([]);
  // const [clients,setClients]=useState([]);
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [deleteClientId, setDeleteClientId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClientData, setEditClientData] = useState(null);
const [selectedService, setSelectedService] = useState(""); // selected one
const [Package,setPackages]=useState([]);
  const[service,setServices]=useState([]);
const handleEditServiceChange = (e) => {
  const service = e.target.value;
  setSelectedService(service);

  setEditClientData(prev => ({
    ...prev,
    service_type: service,
       package_type: '',
    downloadSpeed: '',
    uploadSpeed: '',
    package_type: '', // reset package type on service change
  }));

  if (service !== "HSI") {
    setDownloadSpeed("");
    setUploadSpeed("");
  }
};

  // const fetchClients = async () => {
  //   try {
  //     const response = await axios.get("https://localhost:7207/api/Clients");
  //     setClients(response.data);
  //   } catch (err) {
  //     console.error("Failed to fetch clients:", err);
  //   }
  // };

  
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/Users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const getUsernameById = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.username : "Unknown";
  };

useEffect(()=>{
  const fetchPackages=async()=>{
    try{
      const response=await axios.get(`${API_URL}/api/Packages`,{

      })
      setPackages(response.data);
    }catch(error){
      console.error(error);
    }
  }
  fetchPackages();
},[]);

  // DELETE Modal handlers
  const openDeleteModal = (clientId) => {
    setDeleteClientId(clientId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteClientId(null);
    setIsDeleteModalOpen(false);
  };
 useEffect(() => {
    
    fetchUsers();
  }, []);
 const handleDelete = async () => {
  const token = sessionStorage.getItem("token"); // 🔹 Get token from session
  try {
    await axios.delete(`${API_URL}/api/Clients/${deleteClientId}`, {
    withCredentials: true,
  headers: { Authorization: `Bearer ${token}` }
    });

    setSalesClients((prevClients) =>
      prevClients.filter((c) => c.id !== deleteClientId)
    );
    closeDeleteModal();
  } catch (error) {
    console.error("Failed to delete client:", error);
    alert("Failed to delete client. Please try again.");
    closeDeleteModal();
  }
};
useEffect(()=>{
  const fetchServices=async()=>{
    try{
      const response=await axios.get(`${API_URL}/api/Services`,{

      })
      setServices(response.data);
    }catch(error){
      console.error(error);
    }
  }
  fetchServices();
},[]);


  // EDIT Modal handlers
  const openEditModal = (client) => {
    setEditClientData(client);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditClientData(null);
    setIsEditModalOpen(false);
  };

const handleEditChange = (e) => {
  const { name, value } = e.target;

  if (name === "business_type") {
    setEditClientData((prev) => ({
      ...prev,
      business_type: value, // store ID for select
    }));
  } else {
    setEditClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};



  

const handleUpdate = async () => {
  const token = sessionStorage.getItem("token");

  // Convert ID to string type for backend
 const selectedType = BusinessType.find(
  (type) => String(type.id) === String(editClientData.business_type)
)?.type || "";


  const payload = {
    ...editClientData,
    business_type: selectedType,
  };

  try {
    await axios.put(`${API_URL}/api/Clients/${editClientData.id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setSalesClients((prevClients) =>
      prevClients.map((client) =>
        client.id === editClientData.id ? payload : client
      )
    );

    closeEditModal();
  } catch (error) {
    console.error("Failed to update client:", error);
    alert("Failed to update client. Please try again.");
    closeEditModal();
  }
};
const canDelete = hasPermission("delete_client");

const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
};

const columns = [
  { name: "ID", selector: row => row.reference_id, minWidth: "80px", maxWidth: "120px" },
  { name: "FN", selector: row => row.first_name },
  { name: "LN", selector: row => row.last_name },
  { name: "Business", selector: row => row.business_type },
  { name: "Mobile", selector: row => row.mobile },
  // { name: "Email", selector: row => row.email },
  { name: "Service", selector: row => row.service_type },
{
  name: "Reg Date",
  selector: row =>
    row.registration_date
      ? new Date(row.registration_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—",
  width: "200px", // 👈 increase width
},


  { name: "Conn", selector: row => row.connection_type },
  { name: "Package", selector: row => row.package_type },
  { name: "Created By", selector: row => getUsernameById(row.created_by) },
  {
    name: "Actions",
    minWidth: "100px",
    maxWidth: "120px",
    cell: row => (
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <div style={actionBtnStyle("#007bff")} onClick={() => openEditModal(row)} title="Edit">
          <FaEdit />
        </div>
     

<div
  id="delete_client"
  onClick={canDelete ? () => openDeleteModal(row.id) : undefined}
  style={{
    ...actionBtnStyle(canDelete ? "#c60000" : "#ccc"),
    cursor: canDelete ? "pointer" : "not-allowed",
    opacity: canDelete ? 1 : 0.5,
    pointerEvents: canDelete ? "auto" : "none",
  }}
  title={canDelete ? "Delete" : "You don't have permission to delete"}
>
  <FaTrash />
</div>


      </div>
      
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];




  const filteredClients = salesclients.filter(
    (item) =>
      item.first_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.last_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.email?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.reference_id?.toLowerCase().includes(filterText.toLowerCase())
  );

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
        padding: "0px 10px",
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





const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content">
        <h2 className="title">Clients List</h2>

        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

<div style={{ width: "100%", overflowX: "hidden" }}>
  <DataTable
    columns={columns}
    data={filteredClients}
    pagination
    highlightOnHover
    striped
    responsive={false}       // disables horizontal scrolling
    persistTableHead
    customStyles={{
    ...customStyles,
    table: {
      style: { tableLayout: "fixed", width: "100%" }
    },
    cells: { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }
  }}
    onRowDoubleClicked={(row) => openEditModal(row)} // <-- open edit modal on double click
  />
</div>




        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
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
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
                textAlign: "center",
              }}
            >
              <p>Are you sure you want to delete this client?</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "20px",
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editClientData && (
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
    zIndex: 9999,
  }}
>
  <div
    style={{
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "10px",
      width: "700px",           // ✅ Increased width
      maxHeight: "85vh",        // ✅ Increased height
      overflowY: "auto",
    }}
  >

              <h3>Edit Client</h3>
            <form
  onSubmit={(e) => {
    e.preventDefault();
    handleUpdate();
  }}
>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
    <div>
      <label style={labelStyle}>First Name</label>
   <input
  id="edit_first_name"
  type="text"
  name="first_name"
  value={editClientData.first_name}
  onChange={handleEditChange}
  disabled={!hasPermission("edit_first_name")}  // different permission!
/>

    </div>

    <div>
      <label style={labelStyle}>Last Name</label>
      <input
        type="text"
         id="edit_last_name"
        name="last_name"
        value={editClientData.last_name || ""}
         disabled={!hasPermission("edit_last_name")} 
        onChange={handleEditChange}
        style={inputStyle}
      />
    </div>

    <div>
      <label style={labelStyle}>Email</label>
      <input
        type="email"
        id="edit_email_c"
        name="email"
        value={editClientData.email || ""}
        onChange={handleEditChange}
          disabled={!hasPermission("edit_email_c")} 
        style={inputStyle}
      />
    </div>

<select
  id="edit_business_type"
  name="business_type"
  onChange={handleEditChange}
  value={editClientData.business_type || ""} 
  required
  disabled={!hasPermission("edit_business_type")}
>
  <option value="">-- Select Business Type --</option>
  {BusinessType.map((type) => (
    <option key={type.id} value={type.id}>
      {type.type}
    </option>
  ))}
</select>






    <div>
      <label style={labelStyle}>Mobile</label>
      <input
        type="text"
        id="edit_mobile_c"
        name="mobile"
        disabled={!hasPermission("edit_mobile_c")} 
        value={editClientData.mobile || ""}
        onChange={handleEditChange}
        style={inputStyle}
      />
    </div>

    <div>
  <label style={labelStyle}>Service</label>
  <select
    name="service_type"
     id="edit_service_typec"
    value={selectedService}
    onChange={handleEditServiceChange}
    style={inputStyle}
    disabled={!hasPermission("edit_service_type")} 
  >
    <option value="">Select Service</option>
    {service.map((s) => (
      <option key={s.id} value={s.service_name}>
        {s.service_name}
      </option>
    ))}
  </select>
</div>



<div style={{ flex: "1 1 48%", minWidth: "48%" }}>
  <label>Package Type</label>

  {/* HSI dropdown */}
  {selectedService === "HSI" && hasPermission("edit_package_type_hsi") && (
    <select
      id="add_package_type_hsi"
      name="package_type"
      value={editClientData.package_type}
      onChange={handleChange}
      required
      style={{
        padding: "8px",
        fontSize: "1rem",
        width: "100%",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      <option value="">Select HSI Package</option>
      {Package.filter(pkg => pkg.service_type === "HSI").map(pkg => (
        <option key={pkg.id} value={pkg.package_name}>
          {pkg.package_name}
        </option>
      ))}
    </select>
  )}

  {/* Corporate: show upload/download fields instead of dropdown */}
  {selectedService === "Corporate" && hasPermission("edit_package_type_corporate") && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "8px",
        gap: "10px",
        backgroundColor: "#fff",
        marginTop: "5px",
      }}
    >
      <span>Download</span>
      <input
        type="text"
        name="downloadSpeed"
        disabled={!hasPermission("edit_downloadSpeed")}
        value={downloadSpeed}
        onChange={(e) => {
          const val = e.target.value;
          setDownloadSpeed(val);
          setEditClientData(prev => ({
            ...prev,
            package_type: `${val} download ${uploadSpeed} upload`,
          }));
        }}
        placeholder="e.g. 50Mbps"
        style={{ flex: 1, padding: "5px", fontSize: "1rem" }}
      />
      <span>Upload</span>
      <input
        type="text"
        name="uploadSpeed"
        disabled={!hasPermission("edit_uploadSpeed")}
        value={uploadSpeed}
        onChange={(e) => {
          const val = e.target.value;
          setUploadSpeed(val);
          setEditClientData(prev => ({
            ...prev,
            package_type: `${downloadSpeed} download ${val} upload`,
          }));
        }}
        placeholder="e.g. 20Mbps"
        style={{ flex: 1, padding: "5px", fontSize: "1rem" }}
      />
    </div>
  )}
</div>


    {/* Add more fields as necessary using the same pattern */}
  </div>
{/* <div>
  <label style={labelStyle}>Sales Executive</label>
  <select
    name="sales_exec"
    value={editClientData.sales_exec || ""}
    onChange={handleEditChange}
    style={inputStyle}
  >
    <option value="">Select Sales Executive</option>
    {users.map((user) => (
      <option key={user.id} value={user.username}>
        {user.username}
      </option>
    ))}
  </select>
</div> */}

  <div style={{ textAlign: "right", marginTop: "30px" }}>
    <button
      type="submit"
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        marginRight: "10px",
        cursor: "pointer",
      }}
    >
      Save Changes
    </button>
    <button
      type="button"
      onClick={closeEditModal}
      style={{
        padding: "10px 20px",
        backgroundColor: "#ccc",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
  </div>
</form>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default View_Clients;
