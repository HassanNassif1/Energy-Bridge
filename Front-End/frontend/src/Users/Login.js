import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL;
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/checklogin`, {
      username,
      password
    });

    const token = response.data.token;
    sessionStorage.setItem('token', token);

    const decoded = jwtDecode(token);
    const user = {
      id: parseInt(decoded.UserId),
      username: decoded.username || decoded.unique_name || decoded.Name || "",
      roleId: decoded.roleId || "",
      status: decoded.status || "not active",
      isLogged: decoded.isLogged === "True" // convert string to boolean
    };


    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    return user; // ✅ Return user instead of redirecting

  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw new Error("Something went wrong during login");
  }
};


export default login;
