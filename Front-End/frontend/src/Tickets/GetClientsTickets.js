import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const STATUS_TABS = ["ALL", "OPEN", "PENDING", "IN PROGRESS", "CLOSED"];

const GetClientsTickets = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
const dateInputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #f1bcbc",
  backgroundColor: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#c60000",
};

const clearBtnStyle = {
  padding: "10px 16px",
  borderRadius: 20,
  background: "#c60000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

const chipStyle = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid #c60000",
  background: "#fff",
  color: "#c60000",
  cursor: "pointer",
  fontWeight: 600,
};

const [singleDate, setSingleDate] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  /* ===================== TABLE COLUMNS ===================== */
const columns = [
  {
    name: "Tick ID",
    selector: r => r.id,
    sortable: true,
    maxWidth: "110px",
  },

  {
    name: "Ref ID",
    selector: r => r.client_id,
    sortable: true,
    maxWidth: "130px",
  },

  {
    name: "Client Name",
    selector: r => r.client_name,
    sortable: true,
    minWidth: "180px",
    wrap: true,
  },

  {
    name: "Subject",
    selector: r => r.subject,
    sortable: true,
    wrap: true,
    minWidth: "220px",
  },

  {
    name: "Category",
    selector: r => r.category,
    sortable: true,
    minWidth: "130px",
  },

  {
    name: "Severity",
    selector: r => r.severity,
    sortable: true,
    minWidth: "110px",
  },

  {
    name: "Status",
    selector: r => r.status,
    cell: r => <StatusBadge status={r.status} />,
    sortable: true,
    maxWidth: "150px",
    center: true,
  },

  {
    name: "Created At",
    selector: r => r.created_at,
    sortable: true,
    minWidth: "140px",
    center: true,
    cell: r => (
      <span style={{ fontWeight: 600 }}>
        {new Date(r.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
];


  /* ===================== FETCH DATA ===================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsRes = await axios.get(
          `${API_URL}/api/Clients`,
          authHeader
        );

        const ticketsRes = await axios.get(
          `${API_URL}/api/Tickets`,
          authHeader
        );

        const mappedTickets = ticketsRes.data.map(ticket => {
          const client = clientsRes.data.find(
            c => c.reference_id === ticket.client_id
          );

          return {
            ...ticket,
            reference_id: client?.reference_id || "N/A",
            client_name: client
              ? `${client.first_name} ${client.last_name}`
              : "Unknown Client",
          };
        });

        setTickets(mappedTickets);
        setFilteredTickets(mappedTickets);
      } catch (err) {
        console.error("FETCH ERROR:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
const StatusBadge = ({ status }) => {
  const colors = {
    OPEN: "#007bff",
    PENDING: "#ffc107",
    "IN PROGRESS": "#17a2b8",
    CLOSED: "#28a745",
  };

  return (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        backgroundColor: colors[status?.toUpperCase()] || "#6c757d",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.85rem",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

  /* ===================== FILTER LOGIC ===================== */
useEffect(() => {
  let data = [...tickets];

  // STATUS FILTER
  if (activeStatus !== "ALL") {
    data = data.filter(
      t => t.status?.toUpperCase() === activeStatus
    );
  }

  // SEARCH FILTER
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    data = data.filter(t =>
      `${t.client_name} ${t.subject} ${t.client_id} ${t.reference_id}`
        .toLowerCase()
        .includes(q)
    );
  }

  // SINGLE DATE FILTER
  if (singleDate) {
    const start = new Date(singleDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(singleDate);
    end.setHours(23, 59, 59, 999);

    data = data.filter(t => {
      const created = new Date(t.created_at);
      return created >= start && created <= end;
    });
  }

  // DATE RANGE FILTER
  if (!singleDate && fromDate) {
    data = data.filter(
      t => new Date(t.created_at) >= new Date(fromDate)
    );
  }

  if (!singleDate && toDate) {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);

    data = data.filter(
      t => new Date(t.created_at) <= endOfDay
    );
  }

  setFilteredTickets(data);
}, [
  searchText,
  activeStatus,
  singleDate,
  fromDate,
  toDate,
  tickets,
]);

const customStyles = {
  table: {
    style: {
      width: "100%",
      background: "white",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      borderRadius: "12px",
      fontSize: "1rem",
      border: "none",
    },
  },

  headRow: {
    style: {
      backgroundColor: "#c60000",
      color: "#fff",
      fontSize: "1.05rem",
      minHeight: "56px",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      border: "none",
    },
  },

  headCells: {
    style: {
      padding: "14px 16px",
      color: "#fff",
      fontWeight: "700",
      textAlign: "center",
      border: "none",
    },
  },

  rows: {
    style: {
      border: "none",
      transition: "all 0.2s ease",
      '&:hover': {
        backgroundColor: "#fff5f5",
      },
    },
  },

  cells: {
    style: {
      padding: "14px 12px",
      textAlign: "center",
      border: "none",
      fontWeight: 500,
    },
  },
};


  if (loading) return <p>Loading tickets...</p>;



  /* ===================== RENDER ===================== */
  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => navigate("/ViewTickets")}
        style={{
          marginBottom: 10,
          padding: "8px 14px",
          backgroundColor: "#c60000",
          color: "#fff",
          border: "none",
          borderRadius: 6,
        }}
      >
        ⬅ Back
      </button>

      <h2 style={{ color: "#c60000" }}>Clients Tickets</h2>

      {/* STATUS BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
        {STATUS_TABS.map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor:
                activeStatus === status ? "#c60000" : "#e0e0e0",
              color: activeStatus === status ? "#fff" : "#000",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by client, subject, reference ID..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          padding: 10,
          width: 340,
          borderRadius: 6,
          border: "1px solid #ccc",
          marginBottom: 20,
        }}
      />
{/* DATE FILTER BAR */}
<div
  style={{
    background: "linear-gradient(135deg, #fff5f5, #ffecec)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    boxShadow: "0 8px 20px rgba(198,0,0,0.12)",
  }}
>
  <div
    style={{
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      alignItems: "flex-end",
    }}
  >
    {/* SINGLE DATE */}
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#c60000" }}>
        📅 One Day
      </label>
      <input
        type="date"
        value={singleDate}
        onChange={e => {
          setSingleDate(e.target.value);
          setFromDate("");
          setToDate("");
        }}
        style={dateInputStyle}
      />
    </div>

    <span style={{ fontWeight: 700, color: "#999", marginBottom: 10 }}>
      OR
    </span>

    {/* RANGE */}
    <div>
      <label style={labelStyle}>From</label>
      <input
        type="date"
        value={fromDate}
        onChange={e => {
          setFromDate(e.target.value);
          setSingleDate("");
        }}
        style={dateInputStyle}
      />
    </div>

    <div>
      <label style={labelStyle}>To</label>
      <input
        type="date"
        value={toDate}
        onChange={e => {
          setToDate(e.target.value);
          setSingleDate("");
        }}
        style={dateInputStyle}
      />
    </div>

    {/* CLEAR */}
    {(singleDate || fromDate || toDate) && (
      <button
        onClick={() => {
          setSingleDate("");
          setFromDate("");
          setToDate("");
        }}
        style={clearBtnStyle}
      >
        ✖ Clear
      </button>
    )}
  </div>

  {/* QUICK PRESETS */}
  <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
    {[
      {
        label: "Today",
        action: () => {
          const today = new Date().toISOString().split("T")[0];
          setSingleDate(today);
          setFromDate("");
          setToDate("");
        },
      },
      {
        label: "Last 7 Days",
        action: () => {
          const today = new Date();
          const past = new Date();
          past.setDate(today.getDate() - 6);

          setFromDate(past.toISOString().split("T")[0]);
          setToDate(today.toISOString().split("T")[0]);
          setSingleDate("");
        },
      },
      {
        label: "This Month",
        action: () => {
          const now = new Date();
          const first = new Date(now.getFullYear(), now.getMonth(), 1);
          const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          setFromDate(first.toISOString().split("T")[0]);
          setToDate(last.toISOString().split("T")[0]);
          setSingleDate("");
        },
      },
    ].map(preset => (
      <button
        key={preset.label}
        onClick={preset.action}
        style={chipStyle}
      >
        {preset.label}
      </button>
    ))}
  </div>
</div>

      {/* TABLE */}
      {filteredTickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
      <DataTable 
  columns={columns}
  data={filteredTickets}
  pagination
  striped
  highlightOnHover
  customStyles={customStyles}
/>

      )}
    </div>
  );
};

export default GetClientsTickets;
