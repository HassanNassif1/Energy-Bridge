import './Login.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UserContext from './UserContext/UserContext';
import LoginForm from './Users/LoginForm';
import Sidebar from './Dashboard/Sidebar';
import Dashboard from './Dashboard/Dashboard';
import Users from './Users/Users';
import Create_Client from './Clients/Create_Clients';
import View_Clients from './Clients/View_Clients';
import PrivateRoute from './Security/PrivateRoute';
import AutoLogoutWrapper from './Security/AutoLogoutWrapper';
import View_Brand from './Brand/View_Brand';
import View_Packages from './Packages/View_Packages';
import View_Dsps from './Dsps/View_Dsps';
import View_Supplier from './Supplier/View_Supplier';
import View_Tickets from './Tickets/View_Tickets';
import View_Types from './Types/View_Types';
import View_Stock from './Stock/View_Stock';
import ToastMessage from './Toast/ToastMessage';
import NotificationBell from './NotificationBell';
import Permissions from './Users/Permissions';
import Unauthorized from './Security/Unauthorized';
import BusinessType from './BusinessTypes/BusinessType';
import TicketHistoryDetails from './Tickets/TicketHistoryDetails';
import './index.css';
import ChristmasEffect from "./ChristmasEffect/ChristmasEffect";
import WhatsApp from './Whatsapp/WhatsApp';
// CSS imports
import "./TicketHistoryDetails.css";

import './Permissions.css';
import './NotificationBell.css';
import './LoginForm.css';
import './Dashboard.css';
import './AddUser.css';
import './AddClient.css';
import './View_Clients.css';
import 'react-toastify/dist/ReactToastify.css';
import TicketDetails from './Tickets/TicketDetails';
import GetClientsTickets from './Tickets/GetClientsTickets';
import UserHistoryPage from './Users/UserHistory';
import UsersStatusTable from './Users/UserStatusTable';


function App() {
     const API_URL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          sessionStorage.setItem("userLogged", data.username);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ username }}>
      {/* <ChristmasEffect /> */}
     
      <ToastMessage />
      <BrowserRouter>
       <NotificationBell />
   
        <Routes>
          <Route path="/" element={<LoginForm />} />

          {/* Unauthorized Page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Secure Routes */}
          <Route
            path="/Dashboard"
            element={
              <PrivateRoute requiredPermission="ViewDashboard">
                <AutoLogoutWrapper><Dashboard /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
             <Route
            path="/BusinessTypes"
            element={
              <PrivateRoute requiredPermission="BusinessTypes">
                <AutoLogoutWrapper><BusinessType /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          
         
          
       

          <Route
            path="/Sidebar"
            element={
              <PrivateRoute>
                <AutoLogoutWrapper><Sidebar /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/Users"
            element={
              <PrivateRoute requiredPermission="Users">
                <AutoLogoutWrapper><Users /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
              <Route
            path="/UserHistory"
            element={
              <PrivateRoute requiredPermission="UserHistory">
                <AutoLogoutWrapper><UserHistoryPage /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
            <Route
            path="/UsersLogged"
            element={
              <PrivateRoute requiredPermission="UsersLogged">
                <AutoLogoutWrapper><UsersStatusTable /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
          

          <Route
            path="/Permissions"
            element={
              <PrivateRoute requiredPermission="Permissions">
                <AutoLogoutWrapper><Permissions /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

           <Route
            path="/ViewClientTicket"
            element={
              <PrivateRoute requiredPermission="ViewClientTicket">
                <AutoLogoutWrapper><GetClientsTickets /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/ViewTickets"
            element={
              <PrivateRoute requiredPermission="ViewTickets">
                <AutoLogoutWrapper><View_Tickets /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
             <Route
            path="/ViewTicketsHistory"
            element={
              <PrivateRoute requiredPermission="ViewTicketsHistory">
                <AutoLogoutWrapper><TicketHistoryDetails /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/AddClient"
            element={
              <PrivateRoute requiredPermission="AddClient">
                <AutoLogoutWrapper><Create_Client /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/ViewClients"
            element={
              <PrivateRoute requiredPermission="ViewClients">
                <AutoLogoutWrapper><View_Clients /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/Stock"
            element={
              <PrivateRoute requiredPermission="ViewStock">
                <AutoLogoutWrapper><View_Stock /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/Types"
            element={
              <PrivateRoute requiredPermission="ViewCategory">
                <AutoLogoutWrapper><View_Types /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/Suppliers"
            element={
              <PrivateRoute requiredPermission="ViewSuppliers">
                <AutoLogoutWrapper><View_Supplier /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/Brands"
            element={
              <PrivateRoute requiredPermission="ViewBrand">
                <AutoLogoutWrapper><View_Brand /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />
<Route path="/ticket/:id" element={<TicketDetails/>}/>
<Route 
path="/Sidebar"
element={
  <PrivateRoute>
    <AutoLogoutWrapper><Sidebar/></AutoLogoutWrapper>
  </PrivateRoute>
}/>
          <Route
            path="/ViewPackages"
            element={
              <PrivateRoute requiredPermission="ViewPackages">
                <AutoLogoutWrapper><View_Packages /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/ViewDsps"
            element={
              <PrivateRoute requiredPermission="ViewDsps">
                <AutoLogoutWrapper><View_Dsps /></AutoLogoutWrapper>
              </PrivateRoute>
            }
          />

          <Route 
          path="/WhatsApp"
          element={
            <PrivateRoute requiredPermission="WhatsApp">
<AutoLogoutWrapper><WhatsApp/></AutoLogoutWrapper>
            </PrivateRoute>
          }
          />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
