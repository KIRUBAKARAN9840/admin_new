"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
} from "react-icons/fa";

export default function UnverifiedSplitup() {
  const router = useRouter();
  // State variables
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("red"); // 'red' or 'hold'
  const [gyms, setGyms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Add spinner animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchGyms = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        type: activeTab,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await axiosInstance.get("/api/admin/unverified-gyms/splitup", {
        params,
      });

      if (response.data.success) {
        setGyms(response.data.data.gyms || []);
        setTotalCount(response.data.data.total);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error(response.data.message || "Failed to fetch gyms");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, activeTab, debouncedSearchTerm]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading && gyms.length === 0) {
    return (
      <div className="users-container">
        <div className="users-header">
          <button
            className="back-button"
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              color: "#FF5757",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.color = "#ff4545"}
            onMouseLeave={(e) => e.target.style.color = "#FF5757"}
          >
            <FaChevronLeft size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
            <h2 className="users-title" style={{ margin: 0 }}>
              <span style={{ color: "#FF5757" }}>Unverified</span> Splitup
            </h2>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
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
            <p style={{ fontSize: "14px", color: "#ccc" }}>
              Loading gyms...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <button
          className="back-button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#FF5757",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "#ff4545"}
          onMouseLeave={(e) => e.target.style.color = "#FF5757"}
        >
          <FaChevronLeft size={16} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
          <h2 className="users-title" style={{ margin: 0 }}>
            <span style={{ color: "#FF5757" }}>Unverified</span> Splitup
          </h2>
        </div>
        <div className="users-count">Total: {totalCount} gyms</div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              setActiveTab("red");
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === "red" ? "#ef4444" : "#2a2a2a",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "red" ? "600" : "400",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaTag size={16} />
            Red Gyms
          </button>
          <button
            onClick={() => {
              setActiveTab("hold");
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === "hold" ? "#eab308" : "#2a2a2a",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "hold" ? "600" : "400",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaTag size={16} />
            Hold Gyms
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: "300px",
            maxWidth: "500px",
          }}
        >
          <FaSearch
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
            }}
          />
          <input
            type="text"
            placeholder="Search by gym name, owner, mobile, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 15px 12px 45px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#1e1e1e",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #333",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "#2a2a2a",
                  borderBottom: "1px solid #333",
                }}
              >
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Gym Name
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Owner
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Mobile
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  City
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ccc",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody>
              {gyms.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "60px",
                      textAlign: "center",
                      color: "#888",
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <FaTag
                        size={48}
                        style={{
                          opacity: 0.3,
                          color: activeTab === "red" ? "#ef4444" : "#eab308",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                      {searchTerm
                        ? `No ${activeTab} gyms found`
                        : `No ${activeTab} gyms found`}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} gyms will appear here`}
                    </div>
                  </td>
                </tr>
              ) : (
                gyms.map((gym, index) => (
                  <tr
                    key={gym.gym_id}
                    style={{
                      borderBottom:
                        index !== gyms.length - 1 ? "1px solid #333" : "none",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2a2a2a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ padding: "16px", color: "#fff" }}>
                      {gym.gym_name || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "#ccc" }}>
                      {gym.owner_name || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "#ccc" }}>
                      {gym.contact_number || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "#ccc" }}>
                      {gym.city || gym.location || "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor:
                            activeTab === "red"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(234, 179, 8, 0.2)",
                          color: activeTab === "red" ? "#ef4444" : "#eab308",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          textTransform: "capitalize",
                        }}
                      >
                        {gym.type}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "#888", fontSize: "14px" }}>
                      {formatDate(gym.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderTop: "1px solid #333",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div style={{ color: "#888", fontSize: "14px" }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              gyms
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    currentPage === 1 ? "#333" : "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  color: currentPage === 1 ? "#666" : "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1)
                    e.target.style.backgroundColor = "#3a3a3a";
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1)
                    e.target.style.backgroundColor = "#2a2a2a";
                }}
              >
                <FaChevronLeft size={12} />
                Previous
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  backgroundColor: "#2a2a2a",
                  padding: "4px",
                  borderRadius: "6px",
                  border: "1px solid #444",
                }}
              >
                {[...Array(totalPages)].slice(0, 5).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: isActive ? "#FF5757" : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        color: isActive ? "#fff" : "#ccc",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: isActive ? "600" : "400",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.target.style.backgroundColor = "#3a3a3a";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 12px",
                  backgroundColor:
                    currentPage === totalPages ? "#333" : "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  color: currentPage === totalPages ? "#666" : "#fff",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages)
                    e.target.style.backgroundColor = "#3a3a3a";
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages)
                    e.target.style.backgroundColor = "#2a2a2a";
                }}
              >
                Next
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
