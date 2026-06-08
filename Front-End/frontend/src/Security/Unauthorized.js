import React from "react";

function Unauthorized() {
  return (
    <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>
      <h2>403 - Access Denied</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}

export default Unauthorized;
