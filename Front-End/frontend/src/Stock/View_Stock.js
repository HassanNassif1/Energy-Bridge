import React, { useState, useEffect,useContext,useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import Dashboard from "../Dashboard/Sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import UserContext from "../UserContext/UserContext";
import { useLocation } from "react-router-dom";
function View_Stock() {
    
    
   const API_URL = process.env.REACT_APP_API_URL;
       const [Users, setUsers] = useState([]);
       const[Type,setType]=useState([]);
       const[username,setUsername]=useState("");
         const [createdBy, setCreatedBy] = useState(username || "");
       const[Brand,setBrand]=useState([]);
       const[Supplier,setSupplier]=useState([]);
        const [message, setMessage] = useState('');
  const [stock, setStock] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const connectionsRef = useRef(null);

  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState(null);
   const [permissions, setPermissions] = useState([]);
    const [roleId, setRoleId] = useState(null);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
  useEffect(() => {
  if (showAdd && connectionsRef.current) {
    connectionsRef.current.focus();
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
const initialAddForm = {
  connections: '',
  link_name: '',
  type: '',
  brand:'',
  sn: '',
  supplier: '',
  price: '',
  antenna_size: '',
  purchase_date: '',
  status: '',
  created_by: '', // will be a number
  created_on:''
  
};

const [addForm, setAddForm] = useState(initialAddForm);
  const [editForm, setEditForm] = useState({
    connections: "",
    link_name:"",
    type:"",
    brand:"",
    sn:"",
    supplier:"",
    price:"",
    antenna_size:"",
    purchase_date:"",
    status:"",
    created_by:"",
   
  
  
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [msg, setMsg] = useState("");
const iconStyle = {
  cursor: "pointer",
  fontSize: "1.2rem",
  transition: "color 0.2s",
};

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/Users`);

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching Users", error);
        setMessage("Failed to load Users");
      }
    };
 // Add this useEffect to map username to user ID after Users are loaded
useEffect(() => {
  if (Users.length && username) {
    const user = Users.find(u => u.username === username);
    if (user) {
      setCreatedBy(user.id); // sets numeric ID
      setAddForm(prev => ({ ...prev, created_by: user.id }));
    }
  }
}, [Users, username]);


  const fetchType = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Types`);
      setType(data);
    } catch (e) {
      console.error(e);
    }
  };
   const fetchBrand = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Brand`);
      setBrand(data);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchSupplier = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Supplier`);
      setSupplier(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStock();
     fetchUsers();
     fetchType();
    fetchBrand();
    fetchSupplier();

  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const fetchStock = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/Stock`);
      setStock(data);
    } catch (e) {
      console.error(e);
    }
  };

 const openEdit = s => {
    setEditForm({ connections: s.connections,link_name:s.link_name,type:s.type,brand:s.brand,sn:s.sn,supplier:s.supplier,price:s.price,antenna_size:s.antenna_size,purchase_date:s.purchase_date,status:s.status,created_by:s.created_by,created_on:s.created_on });
    setCurrent(s.id);
    setShowEdit(true);
  };
  useEffect(() => {
     const fetchCurrentUser = async () => {
       const token = sessionStorage.getItem('token');
       if (!token) return;
 
       try {
         // Get user info
         const { data: user } = await axios.get(
           `${API_URL}/api/users/me`,
           { headers: { Authorization: `Bearer ${token}` } }
         );
 
         setUsername(user.username);
         
         sessionStorage.setItem('user', user.username);
 
       
       } catch (error) {
         console.error("Error fetching user or permissions:", error);
       }
     };
 
     fetchCurrentUser();
   }, []);
  const handleAdd = async e => {
    e.preventDefault();

    try {
      const payload = {
  connections: addForm.connections || "",
  link_name: addForm.link_name || "",
  type: addForm.type || "",
  brand: addForm.brand || "",
  sn: addForm.sn || "",
  supplier: addForm.supplier || "",
  price: parseInt(addForm.price) || 0,
antenna_size: isNaN(parseInt(addForm.antenna_size))
  ? 0
  : parseInt(addForm.antenna_size),

  status: addForm.status || "",
 purchase_date: addForm.purchase_date 
  ? new Date(addForm.purchase_date).toISOString()
  : new Date().toISOString(),

  created_by: addForm.created_by ? parseInt(addForm.created_by) : null,
   created_on: addForm.created_on 
  ? new Date(addForm.created_on).toISOString()
  : new Date().toISOString(),
};


        const response = await axios.post(`${API_URL}/api/Stock/CreateStock`, payload);
        console.log("Response:", response.data);

        setMsg("✅ Stock added");
        setShowAdd(false);
        setAddForm({ ...initialAddForm });
        fetchStock();
    } catch (error) {
        console.error("❌ Add failed:", error);

        if (error.response) {
            console.error("Error status:", error.response.status);
            console.error("Error data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }

        setMsg("❌ Failed to add");
    }
};

const getUsernameById = (id) => {
  const user = Users.find(u => u.id === id);
  return user ? user.username : "Unknown";
};

  const handleEdit = async e => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/Stock/${current}`, editForm);
      setMsg("✅ Stock updated");
      setShowEdit(false);
      fetchStock();
    } catch {
      setMsg("❌ Failed to update");
    }
  };
const customStyles = {
  table: {
    style: {
      width: "100%",
      tableLayout: "fixed", // columns shrink proportionally
      background: "white",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      fontSize: "clamp(0.8rem, 1vw, 1rem)", // font scales between 0.8rem and 1rem
    },
  },
  headRow: {
    style: {
      backgroundColor: "#c60000",
      color: "#fff",
      fontSize: "clamp(0.8rem, 1vw, 1rem)", // responsive font
      minHeight: "55px",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
  },
  headCells: {
    style: {
      padding: "6px 8px",
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
  },
  rows: {
    style: {
      minHeight: "50px",
      borderBottom: "1px solid #ccc",
      transition: "background-color 0.2s",
      textAlign: "center",
      whiteSpace: "normal",
      wordBreak: "break-word",
      fontSize: "clamp(0.75rem, 0.9vw, 0.95rem)", // responsive row font
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  },
  cells: {
    style: {
      padding: "6px 4px",
      fontSize: "clamp(0.75rem, 0.9vw, 0.95rem)", // responsive cell font
      whiteSpace: "normal",
      wordBreak: "break-word",
      textAlign: "center",
    },
  },
};





  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/Stock/${deleteTarget.id}`);
      setMsg("✅ Stock deleted");
      setDeleteTarget(null);
      fetchStock();
    } catch {
      setMsg("❌ Failed to delete");
    }
  };
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
const columns = [
  { name: "Conn", selector: r => r.connections, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "Link", selector: r => r.link_name, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "Cat", selector: r => r.type, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "Brand", selector: r => r.brand, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "SN", selector: r => r.sn, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "Supp", selector: r => r.supplier, sortable: true, minWidth: "80px", maxWidth: "100px" },
  { name: "$", selector: r => r.price, sortable: true, minWidth: "60px", maxWidth: "80px" },
  { name: "Antenna", selector: r => r.antenna_size, sortable: true, minWidth: "120px", maxWidth: "140px" },  // smaller than before
  { name: "Status", selector: r => r.status, sortable: true, minWidth: "70px", maxWidth: "90px" },
  { name: "Date", selector: r => new Date(r.purchase_date).toLocaleDateString(), sortable: true, minWidth: "100px", maxWidth: "120px" },
  { name: "By", selector: r => getUsernameById(r.created_by), minWidth: "80px", maxWidth: "100px" },
  { name: "On", selector: r => new Date(r.created_on).toLocaleDateString(), sortable: true, minWidth: "100px", maxWidth: "120px" },
  {
    name: "Actions",
    minWidth: "90px",
    maxWidth: "110px",
    cell: r => (
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
        <FaEdit onClick={() => openEdit(r)} style={{ color: "#007bff", cursor: "pointer", fontSize: "14px" }} title="Edit" />
        <FaTrash onClick={() => setDeleteTarget(r)} style={{ color: "#c60000", cursor: "pointer", fontSize: "14px" }} title="Delete" />
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];





  const filtered = stock.filter(
    s =>
      s.type ||
     s.connections ||
      s.status ||
       s.brand ||
        s.purchase_date ||
         s.created_on ||
          s.created_by
     

  );

  return (
    <div className="layout">
      <Dashboard />
      <div className="main-content" style={{ padding: 30 }}>
        <h2>Stock List</h2>
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
            Add Stock
          </button>
        </div>
 <div style={{ width: "100%", overflowX: "hidden" }}>
  <DataTable
    columns={columns}
    data={filtered}
    pagination
    highlightOnHover
    striped
    responsive={false}          // disable built-in horizontal scroll
    persistTableHead
    customStyles={customStyles}
    onRowDoubleClicked={(row) => openEdit(row)} // <-- double-click opens edit
  />
</div>


        {/* Add DSP Modal */}
        {showAdd && (
          <ModalBackdrop>
            <div
              style={{
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 30,
    width: "1200px",
    maxWidth: "95%",
    marginTop:"7.5%",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  height:"auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    transform: "scale(0.86)", // 👈 zoom out
    transformOrigin: "top center",
  }}
>
              <h3>Add Stock</h3>
              <form onSubmit={handleAdd}  style={{ 
           display: "grid",
          gridTemplateColumns: "1fr 1fr", // two columns
          gap: "20px",
          }}>
             
                <label>Connections</label>
               <input
  ref={connectionsRef}
  name="connections"
  id="add_connections"
  disabled={!hasPermission('add_connections')}
  value={addForm.connections}
  onChange={e => setAddForm(f => ({ ...f, connections: e.target.value }))}
  style={{ width: "100%", padding: 8 }}
/>

                
                <label>Link </label>
                <input
                id="add_link_name"
disabled={!hasPermission('add_link_name')}
                  name="link_name"
                  value={addForm.link_name}
                  onChange={e => setAddForm(f => ({ ...f, link_name: e.target.value }))}
                 style={{ width: "100%", padding: 8 }}
                />

              <label>Category</label>
<select
  name="type"
    id="add_type"
disabled={!hasPermission('add_type')}
  value={addForm.type}
 onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}

    style={{ width: "100%", padding: 8 }}
>
  <option value="">-- Select Category --</option>
  {Type.map(type => (
 <option key={type.id} value={type.type}>{type.type}</option>


  ))}
</select>

<label>Brand</label>
<select
  id="add_brand_Stock"
disabled={!hasPermission('add_brand_Stock')}
  name="brand"
  value={addForm.brand}
  onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))}
   style={{ width: "100%", padding: 8 }}
>
  <option value="">-- Select Brand --</option>
  {Brand.map(brand => (
    <option key={brand.id} value={brand.brand}>
      {brand.brand}
    </option>
  ))}
</select>

   <label>SN </label>
                <input
                  id="add_sn"
disabled={!hasPermission('add_sn')}
                  name="sn"
                  value={addForm.sn}
                  onChange={e => setAddForm(f => ({ ...f, sn: e.target.value }))}
                   style={{ width: "100%", padding: 8 }}
                />

                            <label>Supplier</label>
<select
  name="supplier"
    id="add_supplier_stock"
disabled={!hasPermission('add_supplier_stock')}
  value={addForm.supplier}
  onChange={e => setAddForm(f => ({ ...f, supplier: e.target.value }))}
  style={{ width: "100%", padding: 8 }}
>
  <option value="">-- Select Supplier --</option>
  {Supplier.map(supplier => (
    <option key={supplier.id} value={supplier.supplier}>
      {supplier.supplier}
    </option>
  ))}
</select>
                    <label>Price </label>
                <input
                  id="add_price"
disabled={!hasPermission('add_price')}
                  name="price"
                  type="number"
                 value={addForm.price}
        onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} // if backend expects float

              style={{ width: "100%", padding: 8 }}
                />
                    <label>Antenna  </label>
                <input
                  name="antenna_size"
                  type="number"
                    id="add_antenna_size"
disabled={!hasPermission('add_antenna_size')}
                  value={addForm.antenna_size}
                  onChange={e => setAddForm(f => ({ ...f, antenna_size: e.target.value }))}
                   style={{ width: "100%", padding: 8 }}
                />
                    <label>Purchase  </label>
                <input
                  name="purchase_date"
                    id="add_purchase_date"
disabled={!hasPermission('add_purchase_date')}
                    type="date"
                  value={addForm.purchase_date}
                  onChange={e => setAddForm(f => ({ ...f, purchase_date: e.target.value }))}
                    style={{ width: "100%", padding: 8 }}
                />
                    <label>Status </label>
                <input
                  name="status"
                    id="add_status"
disabled={!hasPermission('add_status')}
                  value={addForm.status}
                  onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: "100%", padding: 8 }}
                />  
          
                  <div
  style={{
    display: "flex",
    alignItems: "center",
    gridColumn: "1 / 3",  // make it span full width (2 columns)
    gap: "10px",
  
  }}
>
  <label
    htmlFor="created_by"
   
  >
    Created By:
  </label>

  {username === "admin" ? (
    <select
      id="add_created_by_stock"

      name="created_by"
      value={createdBy}
      onChange={(e) => setCreatedBy(e.target.value)}
      style={{ width: "50%",   marginLeft:"42.7%",padding:8}}
    >
      <option value="">Select User</option>
      {Users.map((user) => (
        <option key={user.id} value={user.username}>
          {user.username}
        </option>
      ))}
    </select>
  ) : (
    <input
      autoComplete="off"
      id="created_by"
      type="text"
      value={username || "Unknown"}
      disabled
    style={{ width: "50%", marginLeft: '38%',padding:8 }}
    />
  )}
</div>

{/* Wrap Created On label and input inside a flex container */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gridColumn: "1 / 3",  // span both columns
    gap: "10px",
  }}
>
 


</div>
                <div
  style={{
    display: "flex",
    justifyContent: "center",  // center horizontally
    gap: 10
  }}
>
  <button
    type="button"
    onClick={() => setShowAdd(false)}
    style={{
      padding: "8px 16px",
      marginLeft:'100%',
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
        width: "800px", // wider form
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        margin: "0 auto"
      }}
    >
      <h3>Edit Stock</h3>
      <form
        onSubmit={handleEdit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // two columns
          gap: "20px",
        }}
      >
        {/* Connections */}
        <div>
          <label>Connections</label>
          <input
            name="connections"
id="edit_connections"
disabled={!hasPermission('edit_connections')}
            value={editForm.connections}
            onChange={e => setEditForm(f => ({ ...f, connections: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Link */}
        <div>
          <label>Link</label>
          <input
          id="edit_link_name"
disabled={!hasPermission('edit_link_name')}
            name="link_name"
            value={editForm.link_name}
            onChange={e => setEditForm(f => ({ ...f, link_name: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Type */}
        <div>
          <label>Category</label>
          <select
          id="edit_type"
disabled={!hasPermission('edit_type')}
            name="type"
            value={editForm.type}
            onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">-- Select Category --</option>
            {Type.map(type => (
              <option key={type.id} value={type.type}>
                {type.type}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label>Brand</label>
          <select
          id="edit_brand_Stock"
disabled={!hasPermission('edit_brand_Stock')}
            name="brand"
            value={editForm.brand}
            onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">-- Select Brand --</option>
            {Brand.map(brand => (
              <option key={brand.id} value={brand.brand}>
                {brand.brand}
              </option>
            ))}
          </select>
        </div>

        {/* SN */}
        <div>
          <label>SN</label>
          <input
            name="sn"
            id="edit_sn"
disabled={!hasPermission('edit_sn')}
            value={editForm.sn}
            onChange={e => setEditForm(f => ({ ...f, sn: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Supplier */}
        <div>
          <label>Supplier</label>
          <select
            name="supplier"
            id="edit_supplier_stock"
disabled={!hasPermission('edit_supplier_stock')}
            value={editForm.supplier}
            onChange={e => setEditForm(f => ({ ...f, supplier: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">-- Select Supplier --</option>
            {Supplier.map(supplier => (
              <option key={supplier.id} value={supplier.supplier}>
                {supplier.supplier}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label>Price</label>
          <input
            name="price"
            id="edit_price"
disabled={!hasPermission('edit_price')}
            type="decimal"
            value={editForm.price}
            onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Antenna Size */}
        <div>
          <label>Antenna </label>
          <input
          id="edit_antenna_size"
disabled={!hasPermission('edit_antenna_size')}
            name="antenna_size"
            value={editForm.antenna_size}
            onChange={e => setEditForm(f => ({ ...f, antenna_size: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label>Purchase </label>
          <input
            name="purchase_date"
            id="edit_purchase_date"
disabled={!hasPermission('edit_purchase_date')}
            type="date"
            value={editForm.purchase_date ? editForm.purchase_date.slice(0, 10) : ""}
            onChange={e => setEditForm(f => ({ ...f, purchase_date: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <input
            name="status"
            id="edit_status_stock"
disabled={!hasPermission('edit_status_stock')}
            value={editForm.status}
            onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Created By */}
        <div>
          <label htmlFor="created_by">Created By</label>
          {username === "admin" ? (
            <select
              id="edit_created_by_stock"
              name="created_by"

              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              style={{
                padding: 8,
                fontSize: "1rem",
                width: "100%",
                backgroundColor: "#ffffff",
              }} 
            >
              <option value="">Select User</option>
              {Users.map(user => (
                <option key={user.id} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="created_by"
              
              type="text"
              value={username || "Unknown"}
              disabled
              style={{
                padding: 8,
                fontSize: "1rem",
                width: "100%",
                backgroundColor: "#f0f0f0",
              }}
            />
          )}
        </div>

   

        {/* Buttons - take full width */}
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowEdit(false)}
            style={{
              padding: "8px 16px",
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
              padding: "8px 16px",
              backgroundColor: "#c60000",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
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

export default View_Stock;
