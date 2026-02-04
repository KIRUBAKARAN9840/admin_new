"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function SupportTickets() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketType = searchParams.get("type") || "gym"; // gym or client

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    issueType: "",
  });

  useEffect(() => {
    fetchTickets();
  }, [ticketType, pagination.page, filters.status, filters.issueType]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        sort_order: "desc",
      });

      // Filter by source - Gym = "Fittbot Business", Client = "Fittbot"
      params.append("source", ticketType === "gym" ? "Fittbot Business" : "Fittbot");

      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "") params.append("status", filters.status);
      if (filters.issueType) params.append("issue_type", filters.issueType);

      const response = await axiosInstance.get(`/admin/dashboard/support-tickets-list?${params.toString()}`);

      if (response.data.success) {
        setTickets(response.data.data.tickets);
        setPagination(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch tickets");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch tickets";
      setError(errorMsg);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchTickets();
  };

  const handleStatusChange = (status) => {
    setFilters({ ...filters, status, page: 1 });
    setPagination({ ...pagination, page: 1 });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "resolved":
        return "badge-resolved";
      case "working":
        return "badge-working";
      default:
        return "badge-pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "working":
        return "Working";
      default:
        return "Yet to Start";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        {/* Header with Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              className="btn btn-outline-secondary btn-sm mb-2"
              onClick={() => router.push("/portal/support/home")}
              style={{
                borderColor: "#444",
                color: "#ccc",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#222";
                e.target.style.borderColor = "#FF5757";
                e.target.style.color = "#FF5757";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "#444";
                e.target.style.color = "#ccc";
              }}
            >
              ← Back to Dashboard
            </button>
            <h3 className="section-heading mb-0">
              <span style={{ color: "#FF5757" }}>
                {ticketType === "gym" ? "Gym" : "Client"}
              </span>{" "}
              Support Tickets
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-4">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ticket ID, name, or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
                <button
                  className="btn"
                  type="submit"
                  style={{ backgroundColor: "#FF5757", border: "none", color: "#fff" }}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-8">
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${filters.status === "" ? "btn-danger" : "btn-outline-secondary"}`}
                onClick={() => handleStatusChange("")}
                style={filters.status === "" ? {} : { borderColor: "#444", color: "#ccc" }}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${filters.status === "resolved" ? "btn-danger" : "btn-outline-secondary"}`}
                onClick={() => handleStatusChange("resolved")}
                style={filters.status === "resolved" ? {} : { borderColor: "#444", color: "#ccc" }}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div className="text-center py-5">
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #3a3a3a",
                borderTop: "4px solid #FF5757",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ fontSize: "14px", color: "#ccc" }}>Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p style={{ fontSize: "16px", color: "#ef4444" }}>Error: {error}</p>
            <button
              className="btn btn-sm mt-3"
              onClick={fetchTickets}
              style={{ backgroundColor: "#FF5757", border: "none", color: "#fff" }}
            >
              Retry
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5">
            <p style={{ fontSize: "16px", color: "#888" }}>No tickets found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="table tickets-table"
            >
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => router.push(`/portal/support/tickets/${ticket.ticket_id}?source=${ticket.source}`)}
                  >
                    <td className="ticket-id">
                      {ticket.ticket_id.substring(0, 8)}...
                    </td>
                    <td className="ticket-name">{ticket.name}</td>
                    <td className="ticket-email">{ticket.email}</td>
                    <td className="ticket-subject">{ticket.subject}</td>
                    <td className="ticket-issue">
                      {ticket.issue}
                    </td>
                    <td className="ticket-status">
                      <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="ticket-date">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && tickets.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div style={{ color: "#888", fontSize: "14px" }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
            </div>
            <div className="btn-group">
              <button
                className="btn btn-sm"
                disabled={!pagination.hasPrev}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  color: pagination.hasPrev ? "#fff" : "#555",
                }}
              >
                Previous
              </button>
              <button
                className="btn btn-sm"
                disabled={!pagination.hasNext}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  color: pagination.hasNext ? "#fff" : "#555",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        table.tickets-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          background-color: #1a1a1a !important;
          color: #fff !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        table.tickets-table > thead {
          background-color: #222 !important;
          border-bottom: 2px solid #FF5757 !important;
        }

        table.tickets-table > thead > tr > th {
          padding: 12px !important;
          font-weight: 600 !important;
          text-align: left !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.tickets-table > tbody > tr {
          border-bottom: 1px solid #333 !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          background-color: transparent !important;
        }

        table.tickets-table > tbody > tr:hover {
          background-color: #222 !important;
        }

        table.tickets-table > tbody > tr:last-child {
          border-bottom: none !important;
        }

        table.tickets-table > tbody > tr > td {
          padding: 12px !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.tickets-table .ticket-id {
          font-family: monospace !important;
        }

        table.tickets-table .ticket-email {
          color: #888 !important;
        }

        table.tickets-table .ticket-issue {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        table.tickets-table .ticket-date {
          font-size: 14px !important;
          color: #888 !important;
        }

        table.tickets-table .ticket-status .badge {
          padding: 4px 10px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
        }

        .badge-resolved {
          background-color: #10b981 !important;
          color: white !important;
        }
        .badge-working {
          background-color: #f59e0b !important;
          color: white !important;
        }
        .badge-pending {
          background-color: #ef4444 !important;
          color: white !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
