"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function TelecallerConvertedClients() {
  const router = useRouter();
  const params = useParams();
  const telecallerId = params.telecallerId;

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [telecaller, setTelecaller] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalClients, setTotalClients] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await axiosInstance.get(
        `/api/admin/user-conversion/telecallers/${telecallerId}/converted-clients`,
        { params }
      );

      if (response.data.success) {
        setClients(response.data.data.clients);
        setTelecaller(response.data.data.telecaller);
        setTotalClients(response.data.data.total);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [telecallerId, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleBack = () => {
    router.push("/portal/admin/user-conversion");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(totalClients / itemsPerPage);

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="users-container">
        <div className="users-header">
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <FaChevronLeft /> Back to Telecallers
          </button>
          <h2 className="users-title" style={{ marginLeft: "20px" }}>
            Converted Clients
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            padding: "40px",
          }}
        >
          <div style={{ textAlign: "center" }}>
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
            <p style={{ fontSize: "14px", color: "#ccc" }}>Loading clients...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.color = "#fff"}
          onMouseLeave={(e) => e.target.style.color = "#9ca3af"}
        >
          <FaChevronLeft /> Back to Telecallers
        </button>
        <div style={{ marginLeft: "20px", flex: 1 }}>
          <h2 className="users-title">
            {telecaller?.name && (
              <>
                <span style={{ color: "#FF5757" }}>{telecaller.name}</span>
                {" "}
                <span style={{ color: "#ccc", fontSize: "16px", fontWeight: "400" }}>
                  - Converted Clients
                </span>
              </>
            )}
          </h2>
        </div>
        <div className="users-count">Total: {totalClients} clients</div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="row pb-0">
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, mobile, or client ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-sm-12">
            <select
              className="filter-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Gym</th>
                <th>Purchased Plan</th>
                <th>Converted Date</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.conversion_id}>
                    <td>
                      <div className="user-name">{client.name || "-"}</div>
                      {client.email && (
                        <div className="user-contact" style={{ fontSize: "12px", color: "#888" }}>
                          {client.email}
                        </div>
                      )}
                    </td>
                    <td>{client.contact || "-"}</td>
                    <td>{client.gym_name || "-"}</td>
                    <td>
                      <span
                        className="plan-badge"
                        style={{
                          backgroundColor: client.purchased_plan ? "rgba(79, 140, 79, 0.1)" : "rgba(255, 0, 0, 0.1)",
                          borderColor: client.purchased_plan ? "green" : "red",
                          color: client.purchased_plan ? "#4ade80" : "#ef4444",
                        }}
                      >
                        {client.purchased_plan || "No Plan"}
                      </span>
                    </td>
                    <td>{formatDate(client.converted_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No converted clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalClients)} of {totalClients}{" "}
            entries
          </div>

          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {getPaginationNumbers().map((page, index) => (
              <button
                key={index}
                className={`pagination-btn ${page === currentPage ? "active" : ""} ${
                  page === "..." ? "dots" : ""
                }`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
