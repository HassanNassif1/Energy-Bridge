import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Dashboard from "../Dashboard/Sidebar";
import UserContext from "../UserContext/UserContext";

function Create_Client() {
  const API_URL = process.env.REACT_APP_API_URL;
  
  const [username, setUsername] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [BusinessType,setBusinessTypes] = useState([]);
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
   },[BusinessType]);
   
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
const [formData, setFormData] = useState({
  reference_id: "",
  package_name:"",
  first_name: "",
  dsp_name:"",
  last_name: "",
  mobile: "",
  email: "",
  gender: "",
  dob: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  ip_address: "",
  mac_id: "",
  service_type: "",
  registration_date: '',
  created_by: '',
  street: '',
  connection_type: '',
  package_type: '',
  sales_exec: '',
  pppoe_user: '',
  pppoe_pass: '',
  installed_by: '',
  code: '',
  username: '',
  business_type: ''  // ✅ Add this
});

  const [downloadSpeed, setDownloadSpeed] = useState("");
const [uploadSpeed, setUploadSpeed] = useState("");
const [selectedService, setSelectedService] = useState(() => {
  if (hasPermission("add_package_type_hsi")) return "HSI";
  if (hasPermission("add_package_type_corporate")) return "Corporate";
  return "";
});

  const [Dsp, setDsps] = useState([]);
  const [Package,setPackages]=useState([]);
  const [message, setMessage] = useState('');
  const [Users, setUsers] = useState([]);
  const [role, setRole] = useState([]);
  const [userIdentity, setUserIdentity] = useState("");  // Logged-in username
  const token = sessionStorage.getItem('user');
  const [createdBy, setCreatedBy] = useState(username || "");
  const[service,setServices]=useState([]);
  const [sales,setSales]=useState([]);
  const [selectedSale,setSelectedSale]=useState("");
useEffect(() => {
const fetchUserRole = async () => {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      axios.get(`${API_URL}/api/Users`),
      axios.get(`${API_URL}/api/UserRoles`)
    ]);

    const currentUser = usersRes.data.find(u => u.username === username);
    const roleName = rolesRes.data.find(r => r.id === currentUser?.role_id)?.role_name;

    if (roleName){
 setRole(roleName);
    }
    else console.warn("Role not found for user:", username);
  } catch (err) {
    console.error("Error fetching user role:", err);
  }
};


  fetchUserRole();
}, [username]);



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


useEffect(() => {
  const fetchSalesUsers = async () => {
    try {
      const usersRes = await axios.get(`${API_URL}/api/Users`);
      const rolesRes = await axios.get(`${API_URL}/api/UserRoles`);

      const salesRole = rolesRes.data.find(r => r.role_name.toLowerCase() === "sales");

      if (!salesRole) return;

      const filteredUsers = usersRes.data.filter(u => u.role_id === salesRole.id);
      setSales(filteredUsers);
    } catch (err) {
      console.error("Error loading sales users:", err);
    }
  };

  fetchSalesUsers();
}, []);

useEffect(() => {
  if (!formData.package_type) {
    setFormData(prev => ({
      ...prev,
      package_type: "   download   upload",
      
    }));
  }
}, []);
useEffect(() => {
  const fetchLastReferenceId = async () => {
    if (!formData.code) return;

    try {
      const selectedDsp = Dsp.find(d => String(d.id) === String(formData.code));
      if (!selectedDsp || !selectedDsp.code) return;

      const res = await axios.get(`${API_URL}/api/Clients`);
      const clientsForDSP = res.data.filter(
        client =>
          client.reference_id &&
          client.reference_id.startsWith(selectedDsp.code)
      );

      let lastNumber = 0;

      clientsForDSP.forEach(client => {
        const match = client.reference_id.replace(selectedDsp.code, '');
        const num = parseInt(match, 10);
        if (!isNaN(num) && num > lastNumber) {
          lastNumber = num;
        }
      });

      const nextNumber = lastNumber + 1;
      const newRefId = `${selectedDsp.code}${nextNumber}`;

      setFormData(prev => ({
        ...prev,
        reference_id: newRefId
      }));
    } catch (error) {
      console.error("Error generating reference ID:", error);
    }
  };

  fetchLastReferenceId();
}, [formData.code, Dsp]);


 useEffect(() => {
  if (formData.code && Dsp.length > 0) {
    const selectedDsp = Dsp.find(d => String(d.id) === String(formData.code));
    if (selectedDsp && selectedDsp.code) {
      // Generate a 6-digit number starting with 1
      const randomNum = "1" + Math.floor(Math.random() * 100000).toString().padStart(5, "0");

      setFormData(prev => ({
        ...prev,
        reference_id: `${selectedDsp.code}${randomNum}`
      }));

      console.log("Selected DSP:", selectedDsp);
      console.log("Reference ID Set To:", `${selectedDsp?.code}${randomNum}`);
    }
  }
}, [formData.code, Dsp]);



const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "business_type") {
    const selectedType = BusinessType.find(t => String(t.id) === String(value))?.type || "";
    setFormData(prev => ({
      ...prev,
      business_type: selectedType
    }));
  } else if (name === "downloadSpeed") {
    setDownloadSpeed(value);
    setFormData(prev => ({
      ...prev,
      package_type: `${value} download ${uploadSpeed} upload`
    }));
  } else if (name === "uploadSpeed") {
    setUploadSpeed(value);
    setFormData(prev => ({
      ...prev,
      package_type: `${downloadSpeed} download ${value} upload`
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};




  useEffect(() => {
    const fetchDsp = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/Dsps`);
        setDsps(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setMessage("Failed to load roles");
      }
    };
    fetchDsp();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/Users`);

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching Users", error);
        setMessage("Failed to load Users");
      }
    };
    fetchUsers();
  }, []);
const handleSubmit = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("token");
  const username = sessionStorage.getItem("user");

  if (!token || !username) {
    setMessage("❌ User is not logged in or token is missing.");
    return;
  }

  const matchedUser = Users.find(user => user.username === username);
  if (!matchedUser) {
    setMessage("❌ Logged-in user not found.");
    return;
  }

  if (!formData.reference_id) {
    setMessage("❌ Reference ID is required.");
    return;
  }

const payload = {
  reference_id: formData.reference_id || null,
  first_name: formData.first_name || null,
  last_name: formData.last_name || null,
  mobile: formData.mobile || null,
  email: formData.email || null,
  gender: formData.gender || null,
  dob: formData.dob ? new Date(formData.dob).toISOString() : null,
  address: formData.address || null,
  street: formData.street || null,
  city: formData.city || null,
  state: formData.state || null,
  pincode: formData.pincode || null,
  ip_address: formData.ip_address || null,
  mac_id: formData.mac_id || null,
  service_type: selectedService || formData.service_type || null,
  package_type:
    selectedService === "Corporate"
      ? `${downloadSpeed} download ${uploadSpeed} upload`
      : formData.package_type || null,
  registration_date: formData.registration_date
    ? new Date(formData.registration_date).toISOString()
    : null,
  created_by: Number(matchedUser.id), // must be number, not string
  connection_type: formData.connection_type || null,
  sales_exec: formData.sales_exec || null,
  pppoe_user: formData.pppoe_user || null,
  pppoe_pass: formData.pppoe_pass || null,
  installed_by: formData.installed_by || null,
  business_type: formData.business_type || null,
  code: formData.code ? Number(formData.code) : null, // int? expected
};


  console.log("Submitting client:", payload);

  try {
    const response = await axios.post(`${API_URL}/api/Clients/CreateClient`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setMessage("✅ Client added successfully!");
    console.log("Client response:", response.data);

    // Reset form
    setFormData({
      reference_id: "",
      first_name: "",
      last_name: "",
      mobile: "",
      email: "",
      gender: "",
      dob: "",
      address: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      ip_address: "",
      mac_id: "",
      service_type: "",
      registration_date: "",
      created_by: "",
      connection_type: "",
      package_type: "",
      sales_exec: "",
      pppoe_user: "",
      pppoe_pass: "",
      installed_by: "",
      code: "",
      business_type: "",
    });
    setSelectedService("");
    setDownloadSpeed("");
    setUploadSpeed("");
  } catch (error) {
    console.error("Submit error:", error);
    if (error.response) {
      const errMsg = JSON.stringify(error.response.data);
      setMessage(`❌ Server Error: ${errMsg}`);
    } else {
      setMessage("❌ Unexpected error occurred.");
    }
  }
};










  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
      <Dashboard />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",  // horizontally center
          alignItems: "center",      // vertically center
          padding: "20px"
        }}
      >
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "400px",
            minWidth: "80%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            marginLeft: '14%',
            marginTop: '0%'
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add Client</h2>

          <label htmlFor="reference_id">Reference ID:</label>
          <input
            autoComplete="off"
            id="reference_id"
            type="text"
            name="reference_id"
            value={formData.reference_id}
            readOnly
            style={{
              marginBottom: "15px",
              padding: "8px",
              fontSize: "1rem",
              backgroundColor: "#f5f5f5",
            }}
          />

          {/* Container for 4 fields per row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="code">DSP:</label>
              <select
                autoComplete="off"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              >
                <option value="">Select DSP</option>
                {Dsp.map((dsp) => (
                  <option key={dsp.id} value={dsp.id}>
                    {dsp.code}
                  </option>
                ))}
              </select>
            </div>

          <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
  <label htmlFor="add_first_name">First Name:</label>
  <input
    autoComplete="off"
    id="add_first_name"
    type="text"
    name="first_name"
    onChange={handleChange}
    required
    disabled={!hasPermission("add_first_name")}  // disable if no permission
    style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
  />
</div>

<div style={{ flex: "1 1 23%", minWidth: "23%" }}>
  <label htmlFor="add_last_name">Last Name:</label>
  <input
    autoComplete="off"
    id="add_last_name"
    type="text"
    name="last_name"
    onChange={handleChange}
    required
    disabled={!hasPermission("add_last_name")}  // disable if no permission
    style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
  />
</div>
<select
  id="add_business_type"
  name="business_type"
  onChange={handleChange}
  required
  disabled={!hasPermission("add_business_type")}
  style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
>
  <option value="">-- Select Business Type --</option>

  {BusinessType.map((type) => (
    <option key={type.id} value={type.id}>
  {type.type}
</option>

  ))}
</select>


            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_mobile">Mobile:</label>
              <input
                autoComplete="off"
                id="add_mobile_c"
                type="text"
                name="mobile"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
                 disabled={!hasPermission("add_mobile_c")}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_email_c">Email:</label>
              <input
                autoComplete="off"
                id="add_email_c"
                type="email"
                name="email"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
                 disabled={!hasPermission("add_email_c")}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_dob">Date of Birth:</label>
              <input
                autoComplete="off"
                id="add_dob"
                type="date"
                name="dob"
                onChange={handleChange}
                required
                value={formData.dob}
                style={{
                  padding: "8px",
                  fontSize: "1rem",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                 disabled={!hasPermission("add_dob")}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_address">Address:</label>
              <input
                autoComplete="off"
                id="add_address"
                type="text"
                name="address"
                onChange={handleChange}
                required
                 disabled={!hasPermission("add_dob")}
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_city">City:</label>
              <input
                autoComplete="off"
                id="add_city"
                type="text"
                name="city"
                onChange={handleChange}
          
                required
                disabled={!hasPermission("add_city")}
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_state">State:</label>
              <input
                autoComplete="off"
                id="add_state"
                type="text"
                name="state"
                onChange={handleChange}
                 disabled={!hasPermission("add_state")}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_pincode">PinCode:</label>
              <input
                autoComplete="off"
                id="add_pincode"
                type="text"
                name="pincode"
                 disabled={!hasPermission("add_pincode")}
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_ip_address">IP Address:</label>
              <input
                autoComplete="off"
                id="add_ip_address"
                type="text"
                name="ip_address"
                onChange={handleChange}
                 disabled={!hasPermission("add_ip_address")}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_mac_id">MAC ID:</label>
              <input
                autoComplete="off"
                id="add_mac_id"
                type="text"
                name="mac_id"
                onChange={handleChange}
                 disabled={!hasPermission("add_mac_id")}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="add_gender">Gender:</label>
            <div>
              <label style={{ marginRight: "10px" }}>
                <input
                  autoComplete="off"
                  type="radio"
                  id="add_gender"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                  style={{ marginRight: "5px" }}
                   disabled={!hasPermission("add_gender")}
                />
                Male
              </label>
              <label>
                <input
                  autoComplete="off"
                  type="radio"
                  name="gender"
                  id="add_gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                  style={{ marginRight: "5px" }}
                   disabled={!hasPermission("add_gender")}
                />
                Female
              </label>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
        <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
  <label>Service</label>

  {/* Only show dropdown if user has permission */}
  {hasPermission("add_service_typec") ? (
    <select
      id="add_service_typec"
      value={selectedService}
      onChange={(e) => setSelectedService(e.target.value)}
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
      <option value="">Select Service</option>
      {service.map((s) => (
        <option key={s.id} value={s.service_name}>
          {s.service_name}
        </option>
      ))}
    </select>
  ) : (
    <select
      disabled
      style={{
        padding: "8px",
        fontSize: "1rem",
        width: "100%",
        backgroundColor: "#f0f0f0",
        cursor: "not-allowed",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      <option>No Access</option>
    </select>
  )}
</div>



           

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_registration_date">Registration Date</label>
              <input
                autoComplete="off"
                id="add_registration_date"
                type="date"
                name="registration_date"
                onChange={handleChange}
                required
                value={formData.registration_date}
                style={{
                  padding: "8px",
                  fontSize: "1rem",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                 disabled={!hasPermission("add_registration_date")}
              />
            </div>
          <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
    <label htmlFor="add_created_by">Created By :</label>

    {username === "admin" ? (
      <select
        id="add_created_by_client"
        value={createdBy}
        onChange={(e) => setCreatedBy(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "1rem",
          width: "100%",
          backgroundColor: "#ffffff",
          cursor: "pointer",
        }}
   
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
        id="add_created_by_client"
        type="text"
        value={username || "Unknown"}
        disabled
        style={{
          padding: "8px",
          fontSize: "1rem",
          width: "100%",
          backgroundColor: "#f0f0f0",
        }}

      />
    )}
  </div>




            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_street">Street</label>
              <input
                autoComplete="off"
                id="add_street"
                type="text"
                name="street"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
                disabled={!hasPermission("add_street")}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_connection_type">Connection Type</label>
              <input
                autoComplete="off"
                id="add_connection_type"
                type="text"
                name="connection_type"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
                disabled={!hasPermission("add_connection_type")}
              />
            </div>
<div style={{ flex: "1 1 48%", minWidth: "48%" }}>
  <label>Package Type</label>

  {/* HSI dropdown */}
  {selectedService === "HSI" && hasPermission("add_package_type_hsi") && (
    <select
      id="add_package_type_hsi"
      name="package_type"
      value={formData.package_type}
      onChange={handleChange}
      
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
  {selectedService === "Corporate" && hasPermission("add_package_type_corporate") && (
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
        disabled={!hasPermission("add_downloadSpeed")}
        value={downloadSpeed}
        onChange={(e) => {
          const val = e.target.value;
          setDownloadSpeed(val);
          setFormData(prev => ({
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
        disabled={!hasPermission("add_uploadSpeed")}
        value={uploadSpeed}
        onChange={(e) => {
          const val = e.target.value;
          setUploadSpeed(val);
          setFormData(prev => ({
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









  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_pppoe_pass">PPPOE Password</label>
              <input
              disabled={!hasPermission("add_pppoe_pass")}
                autoComplete="off"
                id="add_pppoe_pass"
                type="text"
                name="pppoe_pass"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>
       {typeof role === 'string' &&
  (role.toLowerCase() === "admin" || role.toLowerCase() === "sales manager") && (
    <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
      <label htmlFor="add_sales_exec">Sales Executive</label>
      <select
        id="add_sales_exec"
        name="sales_exec"
        disabled={!hasPermission("add_sales_exec")}
        value={formData.sales_exec}
        onChange={handleChange}
        style={{
          padding: "8px",
          fontSize: "1rem",
          width: "100%",
          backgroundColor: "#ffffff",
          cursor: "pointer",
        }}

      >
        <option value="">Select User</option>
        {sales.map((user) => (
          <option key={user.id} value={user.username}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
)}




            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_pppoe_user">PPPOE User</label>
              <input
              disabled={!hasPermission("add_pppoe_user")}
                autoComplete="off"
                id="add_pppoe_user"
                type="text"
                name="pppoe_user"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>
          </div>

        

            <div style={{ flex: "1 1 23%", minWidth: "23%" }}>
              <label htmlFor="add_installed_by">Installed By</label>
              <input
              disabled={!hasPermission("add_installed_by")}
                autoComplete="off"
                id="add_installed_by"
                type="text"
                name="installed_by"
                onChange={handleChange}
                required
                style={{ padding: "8px", fontSize: "1rem", width: "100%" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="Add-Client"
          >
            Add Client
          </button>
          {message && <p style={{ marginTop: "15px", textAlign: "center" }}>{message}</p>}
        </form>

      </div>
    </div>
  );
}

export default Create_Client;
