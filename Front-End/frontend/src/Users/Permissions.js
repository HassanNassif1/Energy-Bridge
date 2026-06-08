import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Dashboard/Sidebar";

// Categorized permissions
const defaultGroupOptions = [
  { label: "Tickets", value: "ViewTickets", category: "General" },
  { label: "Potential Clients Tickets", value: "ViewPotentialTickets", category: "General" },
  { label: "WhatsApp", value: "WhatsApp", category: "General" },
  { label: "Ticket Histories", value: "ViewTicketsHistory", category: "General" },
  { label: "Clients", value: "ViewClients", category: "General" },
  { label: "Add Client", value: "AddClient", category: "General" },
  { label: "Packages", value: "ViewPackages", category: "General" },
  { label: "Business Types", value: "BusinessTypes", category: "General" },
  { label: "Dashboard", value: "ViewDashboard", category: "General" },
  { label: "Permissions", value: "Permissions", category: "General" },
  { label: "User History", value: "UserHistory", category: "General" },
  { label: "Dsps", value: "ViewDsps", category: "General" },
  { label: "Stock", value: "ViewStock", category: "General" },
  { label: "Category", value: "ViewCategory", category: "General" },
  { label: "Users Logged", value: "UsersLogged", category: "General" },
  { label: "Brands", value: "ViewBrand", category: "General" },
  { label: "Suppliers", value: "ViewSuppliers", category: "General" },
  { label: "Staff", value: "Users", category: "General" },
  { label: "Clients Ticket", value: "ViewClientTicket", category: "General" },

  {
    category: "Packages",
    subcategories: {
      "Add Packages": [
        { id: "add_service_typep", label: "Service Type", value: "service_type", category: "Packages" },
        { id: "add_package_name", label: "Package Name", value: "package_name", category: "Packages" },
        { id: "add_bandwidth", label: "Bandwidth", value: "bandwidth", category: "Packages" },
        { id: "add_price", label: "Price", value: "price", category: "Packages" },
        { id: "add_notes", label: "Notes", value: "notes", category: "Packages" },
      ],
        "Delete Tickets": [
      { id: "delete_package", label: "Delete Package", value: "DeletePackage", category: "Packages" }
    ],
      "Edit Packages": [
        { id: "edit_service_typep", label: "Service Type", value: "service_type", category: "Packages" },
        { id: "edit_package_name", label: "Package Name", value: "package_name", category: "Packages" },
        { id: "edit_bandwidth", label: "Bandwidth", value: "bandwidth", category: "Packages" },
        { id: "edit_price", label: "Price", value: "price", category: "Packages" },
        { id: "edit_notes", label: "Notes", value: "notes", category: "Packages" },
      ]
    }
  },

  {
    category: "Brand",
    subcategories: {
      "Add Brands": [
        { id: "add_brand_Stock", label: "Brand", value: "brand" },
        { id: "add_status_brand", label: "Status", value: "status" },
      ],
      "Edit Brands": [
        { id: "edit_brand_Stock", label: "Brand", value: "brand" },
        { id: "edit_status_brand", label: "Status", value: "status" },
      ]
    }
  },
{
    category: "Dsps",
    subcategories: {
      "Add Dsp": [{ id: "add_code", label: "Code", value: "code" },{ id: "add_name", label: "Name", value: "name" }],
      "Edit Dsp": [{ id: "edit_code", label: "Code", value: "code"},{ id: "edit_name", label: "Name", value: "name" } ],
    }
  },
  {
    category: "Clients",
    subcategories: {
      "Add Clients": [
        { id: "add_reference_id", label: "Reference ID", value: "reference_id" },
        { id: "add_package_type_hsi", label: "Package (HSI)", value: "package_type" },
        { id: "add_package_type_corporate", label: "Package (Corporate)", value: "package_type" },
        { id: "add_first_name", label: "First Name", value: "first_name" },
        {id:"add_business_type",label:"Business Type", value:"business_type"},
        { id: "add_last_name", label: "Last Name", value: "last_name" },
        { id: "add_mobile_c", label: "Mobile", value: "mobile" },
        { id: "add_email_c", label: "Email", value: "email" },
        { id: "add_dob", label: "Date of Birth", value: "dob" },
        { id: "add_address", label: "Address", value: "address" },
        { id: "add_city", label: "City", value: "city" },
        { id: "add_state", label: "State", value: "state" },
        { id: "add_pincode", label: "PinCode", value: "pincode" },
        { id: "add_ip_address", label: "IP Address", value: "ip_address" },
        { id: "add_mac_id", label: "MAC ID", value: "mac_id" },
        { id: "add_gender", label: "Gender", value: "gender" },
        { id: "add_service_typec", label: "Service", value: "service_type" },
        { id: "add_registration_date", label: "Registration Date", value: "registration_date" },
        { id: "add_street", label: "Street", value: "street" },
        { id: "add_connection_type", label: "Connection Type", value: "connection_type" },
        { id: "add_package_type", label: "Package Type", value: "package_type" },
        { id: "add_downloadSpeed", label: "Download Speed", value: "downloadSpeed" },
        { id: "add_uploadSpeed", label: "Upload Speed", value: "uploadSpeed" },
        { id: "add_pppoe_pass", label: "PPPOE Password", value: "pppoe_pass" },
        { id: "add_sales_exec", label: "Sales Executive", value: "sales_exec" },
        { id: "add_pppoe_user", label: "PPPOE User", value: "pppoe_user" },
        { id: "add_installed_by", label: "Installed By", value: "installed_by" },
      ],
      "Edit Clients": [
        { id: "edit_reference_id", label: "Reference ID", value: "reference_id" },
         {id:"edit_business_type",label:"Business Type", value:"business_type"},
        { id: "edit_first_name", label: "First Name", value: "first_name" },
        { id: "edit_last_name", label: "Last Name", value: "last_name" },
        { id: "edit_mobile_c", label: "Mobile", value: "mobile" },
        { id: "edit_email_c", label: "Email", value: "email" },
        { id: "edit_dob", label: "Date of Birth", value: "dob" },
        { id: "edit_address", label: "Address", value: "address" },
        { id: "edit_city", label: "City", value: "city" },
        { id: "edit_state", label: "State", value: "state" },
        { id: "edit_pincode", label: "PinCode", value: "pincode" },
        { id: "edit_ip_address", label: "IP Address", value: "ip_address" },
        { id: "edit_mac_id", label: "MAC ID", value: "mac_id" },
         { id: "edit_package_type_hsi", label: "Package (HSI)", value: "package_type" },
        { id: "edit_package_type_corporate", label: "Package (Corporate)", value: "package_type" },
        { id: "edit_gender", label: "Gender", value: "gender" },
        { id: "edit_service_type", label: "Service", value: "service_type" },
        { id: "edit_registration_date", label: "Registration Date", value: "registration_date" },
        { id: "edit_street", label: "Street", value: "street" },
        { id: "edit_connection_type", label: "Connection Type", value: "connection_type" },
        { id: "edit_package_typec", label: "Package Type", value: "package_type" },
        { id: "edit_downloadSpeed", label: "Download Speed", value: "downloadSpeed" },
        { id: "edit_uploadSpeed", label: "Upload Speed", value: "uploadSpeed" },
        { id: "edit_pppoe_pass", label: "PPPOE Password", value: "pppoe_pass" },
        { id: "edit_sales_exec", label: "Sales Executive", value: "sales_exec" },
        { id: "edit_pppoe_user", label: "PPPOE User", value: "pppoe_user" },
        { id: "edit_installed_by", label: "Installed By", value: "installed_by" },
      ],
         "Delete Clients": [
      { id: "delete_client", label: "Delete Client", value: "DeleteClient", category: "Clients" }
    ],
    }
  },

  {
    category: "Tickets",
    subcategories: {
      "Add Tickets": [
        { id: "add_id", label: "Ticket ID", value: "id", category: "Tickets" },
        { id: "add_client_id", label: "Client ID", value: "client_id", category: "Tickets" },
         { id: "add_tclientfname", label: "Client FName", value: "client_fname", category: "Tickets" },
          { id: "add_tclientlname", label: "Client LName", value: "client_lname", category: "Tickets" },
           { id: "add_tmobilenumber", label: "Client Mobile Number", value: "mobile_number", category: "Tickets" },
        { id: "add_subject", label: "Subject", value: "subject", category: "Tickets" },
        { id: "add_category", label: "Category", value: "category", category: "Tickets" },
        { id: "add_severity", label: "Severity", value: "severity", category: "Tickets" },
        { id: "add_status_ticket", label: "Status", value: "status", category: "Tickets" },
        { id: "add_user_id", label: "From User", value: "user_id", category: "Tickets" },
        { id: "add_assigned_user", label: "To User", value: "assigned_user", category: "Tickets" },
        { id: "add_assigned_to", label: "To Dep", value: "assigned_to", category: "Tickets" },
        { id: "add_call_source", label: "Call Source", value: "call_source", category: "Tickets" },
        { id: "add_role_id", label: "Assign To Department", value: "department", category: "Tickets" },
        { id: "add_description", label: "Description", value: "description", category: "Tickets" },
        { id: "add_user", label: "Assign To User", value: "user", category: "Tickets" },
      ],
       "Delete Tickets": [
      { id: "delete_ticket", label: "Delete Ticket", value: "DeleteTicket", category: "Tickets" }
    ],
      "Edit Tickets": [
        { id: "edit_id", label: "Ticket ID", value: "id", category: "Tickets" },
         { id: "edit_tclientfname", label: "Client FName", value: "client_fname", category: "Tickets" },
          { id: "edit_tclientlname", label: "Client LName", value: "client_lname", category: "Tickets" },
           { id: "edit_tmobilenumber", label: "Client Mobile Number", value: "mobile_number", category: "Tickets" },
        { id: "edit_client_id", label: "Client ID", value: "client_id", category: "Tickets" },
        { id: "edit_subject", label: "Subject", value: "subject", category: "Tickets" },
        { id: "edit_category", label: "Category", value: "category", category: "Tickets" },
        { id: "edit_severity", label: "Severity", value: "severity", category: "Tickets" },
        { id: "edit_status_ticket", label: "Status", value: "status", category: "Tickets" },
        { id: "edit_user_id", label: "From User", value: "user_id", category: "Tickets" },
        { id: "edit_assigned_user", label: "To User", value: "assigned_user", category: "Tickets" },
        { id: "edit_assigned_to", label: "To Dep", value: "assigned_to", category: "Tickets" },
        { id: "edit_call_source", label: "Call Source", value: "call_source", category: "Tickets" },
        { id: "edit_role_id", label: "Assign To Department", value: "department", category: "Tickets" },
        { id: "edit_description", label: "Description", value: "description", category: "Tickets" },
        { id: "edit_user", label: "Assign To User", value: "user", category: "Tickets" },
      ]
    }
  },

  {
    category: "Business Type",
    subcategories: {
      "Add Business Type": [{ id: "add_business_type", label: "Type", value: "type" }],
      "Edit Business Type": [{ id: "edit_business_type", label: "Type", value: "type" }],
    }
  },

  {
    category: "Stock",
    subcategories: {
      "Add Stock": [
        { id: "add_connections", label: "Connections", value: "connections" },
        { id: "add_link_name", label: "Link Name", value: "link_name" },
        { id: "add_type", label: "Category", value: "type" },
        { id: "add_brand", label: "Brand", value: "brand" },
          { id: "add_created_by_stock", label: "Created By", value: "created_by" },
       
        { id: "add_sn", label: "SN", value: "sn" },
        { id: "add_supplier_stock", label: "Supplier", value: "supplier" },
        { id: "add_price", label: "Price", value: "price" },
        { id: "add_antenna_size", label: "Antenna Size", value: "antenna_size" },
        { id: "add_purchase_date", label: "Purchase Date", value: "purchase_date" },
        { id: "add_status_Stock", label: "Status", value: "status" },
      ],
      "Edit Stock": [
        { id: "edit_connections", label: "Connections", value: "connections" },
        { id: "edit_link_name", label: "Link Name", value: "link_name" },
        { id: "edit_type", label: "Category", value: "type" },
        { id: "edit_brand", label: "Brand", value: "brand" },
        { id: "edit_sn", label: "SN", value: "sn" },
        { id: "edit_supplier_stock", label: "Supplier", value: "supplier" },
        { id: "edit_price", label: "Price", value: "price" },
        { id: "edit_antenna_size", label: "Antenna Size", value: "antenna_size" },
        { id: "edit_purchase_date", label: "Purchase Date", value: "purchase_date" },
        { id: "edit_status_stock", label: "Status", value: "status" },
      ]
    }
  },

  {
    category: "Category",
    subcategories: {
      "Add Category": [{ id: "add_type", label: "Type", value: "type" }],
      "Edit Category": [{ id: "Edit_type", label: "Type", value: "type" }],
    }
  },



  {
    category: "Supplier",
    subcategories: {
      "Add Supplier": [
        { id: "add_supplier_s", label: "Supplier", value: "supplier" },
        { id: "add_status_s", label: "Status", value: "status" },
        { id: "add_mobile_s", label: "Mobile", value: "mobile" },
        { id: "add_email_s", label: "Email", value: "email" },
      ],
      "Edit Supplier": [
        { id: "edit_supplier_s", label: "Supplier", value: "supplier" },
        { id: "edit_status_supplier_s", label: "Status", value: "status" },
        { id: "edit_mobile_s", label: "Mobile", value: "mobile" },
        { id: "edit_email_s", label: "Email", value: "email" },
      ]
    }
  }
];

function Permissions() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState("role"); // role | user
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState("");

  // Add this helper function
const isAllSelected = (permGroup) => {
  // flatten all permissions in the group
  const allPermKeys = [];
  permGroup.forEach(p => {
    if (p.subcategories) {
      Object.values(p.subcategories).forEach(subcat => {
        subcat.forEach(option => allPermKeys.push(option.id || option.value));
      });
    } else {
      allPermKeys.push(p.id || p.value);
    }
  });
  return allPermKeys.every(key => selectedPermissions.includes(key));
};

const toggleAllInCategory = (permGroup, selectAll) => {
  const allPermKeys = [];
  permGroup.forEach(p => {
    if (p.subcategories) {
      Object.values(p.subcategories).forEach(subcat => {
        subcat.forEach(option => allPermKeys.push(option.id || option.value));
      });
    } else {
      allPermKeys.push(p.id || p.value);
    }
  });

  setSelectedPermissions(prev => {
    if (selectAll) {
      // add all keys
      const newPerms = Array.from(new Set([...prev, ...allPermKeys]));
      return newPerms;
    } else {
      // remove all keys
      return prev.filter(p => !allPermKeys.includes(p));
    }
  });
};

  // Fetch roles and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/UserRoles`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
          axios.get(`${API_URL}/api/Users`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
        ]);
        setRoles(rolesRes.data);
        setUsers(usersRes.data);
      } catch {
        setMessage("Failed to load data.");
      }
    };
    fetchData();
  }, [API_URL]);

useEffect(() => {
  let perms = [];

  if (mode === "role" && selectedRole) {
    const role = roles.find(r => r.role_name === selectedRole);

    if (role?.permissions) {
      perms = Array.isArray(role.permissions)
        ? role.permissions
        : JSON.parse(role.permissions);
    }

  } else if (mode === "user" && selectedUser) {
    const user = users.find(u => u.id === parseInt(selectedUser));

    if (user?.permissions) {
      perms = Array.isArray(user.permissions)
        ? user.permissions
        : JSON.parse(user.permissions);
    }
  }

  setSelectedPermissions(perms);
}, [mode, selectedRole, selectedUser, roles, users]);


  const togglePermission = permKey => {
    setSelectedPermissions(prev =>
      prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSubmit = async () => {
    if (mode === "role") {
      if (!selectedRole) return setMessage("Please select a role.");
      try {
        const { data } = await axios.post(
          `${API_URL}/api/UserRoles/AssignPermissions`,
          { roleName: selectedRole, permissions: selectedPermissions },
          { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
        );
        setRoles(prev => prev.map(r => r.id === data.id ? data : r));
        setMessage("Role permissions updated successfully.");
      } catch {
        setMessage("Error updating role permissions.");
      }
    } else {
      if (!selectedUser) return setMessage("Please select a user.");
      try {
        const { data } = await axios.post(
          `${API_URL}/api/UserRoles/AssignPermissionsToUser`,
          { UserId: parseInt(selectedUser), permissions: selectedPermissions },
          { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
        );
        setUsers(prev => prev.map(u => u.id === data.id ? data : u));
        setMessage("User permissions updated successfully.");
      } catch {
        setMessage("Error updating user permissions.");
      }
    }
  };

  // Group permissions by category
  const groupedPermissions = defaultGroupOptions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  return (
    <div className="permissions-container">
      <Sidebar />
      <h2>{mode === "role" ? "Role Permission Management" : "User Permission Management"}</h2>

      {/* Mode Toggle */}
      <div className="mode-toggle-box">
        <div className="toggle-buttons">
          <button
            className={mode === "role" ? "active-mode" : ""}
            onClick={() => { setMode("role"); setSelectedUser(""); setSelectedPermissions([]); }}
          >
            Role Mode
          </button>
          <button
            className={mode === "user" ? "active-mode" : ""}
            onClick={() => { setMode("user"); setSelectedRole(""); setSelectedPermissions([]); }}
          >
            User Mode
          </button>
        </div>
      </div>

    <div className="selector-container">
  {mode === "role" && (
    <div className="role-selector">
      <label>Select Role:</label>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="custom-select"
      >
        <option value="">-- Select Role --</option>
        {roles.map((role) => (
          <option key={role.id} value={role.role_name}>
            {role.role_name}
          </option>
        ))}
      </select>
    </div>
  )}

  {mode === "user" && (
    <div className="role-selector">
      <label>Select User:</label>
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="custom-select"
      >
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  )}
</div>


      {/* Permissions Grid */}
      <div className="permissions-wrapper">
      {Object.keys(groupedPermissions).map(category => {
  const group = groupedPermissions[category];
  const allSelected = isAllSelected(group);

  if (group[0].subcategories) {
    const subcats = group[0].subcategories;
    return (
      <div key={category} className="permission-category">
        <h3>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAllInCategory(group, e.target.checked)}
          />{" "}
          {category}
        </h3>
        {Object.keys(subcats).map(subcat => (
          <div key={subcat} className="subcategory">
            <h4>{subcat}</h4>
            <div className="checkbox-group">
              {subcats[subcat].map(option => {
                const permKey = option.id || option.value;
                return (
                  <div key={permKey} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={permKey}
                      checked={selectedPermissions.includes(permKey)}
                      onChange={() => togglePermission(permKey)}
                    />
                    <label htmlFor={permKey}>{option.label}</label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div key={category} className="permission-category">
      <h3>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => toggleAllInCategory(group, e.target.checked)}
        />{" "}
        {category}
      </h3>
      <div className="checkbox-group">
        {group.map(option => {
          const permKey = option.id || option.value;
          return (
            <div key={permKey} className="checkbox-item">
              <input
                type="checkbox"
                id={permKey}
                checked={selectedPermissions.includes(permKey)}
                onChange={() => togglePermission(permKey)}
              />
              <label htmlFor={permKey}>{option.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
})}

      </div>

      <button className="submit-button" onClick={handleSubmit}>Submit Permissions</button>
      {message && <div className="status-message">{message}</div>}
    </div>
  );
}

export default Permissions;
