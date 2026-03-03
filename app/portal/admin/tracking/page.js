"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaBuilding,
  FaClock,
  FaSpinner,
} from "react-icons/fa";
import axiosInstance from "@/lib/axios";

export default function AdminTrackingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Initialize page from sessionStorage or default to 1
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPage = sessionStorage.getItem('trackingPage');
      return savedPage ? parseInt(savedPage) : 1;
    }
    return 1;
  });
  const [pageInput, setPageInput] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Feedback History Modal State (no add feedback)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    clientId: null,
    clientName: "",
    loading: false,
    historyData: [],
  });

  const [user, setUser] = useState(null);

  const hasInitialized = useRef(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchClients = async (currentPage = 1) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 10,
      };

      const response = await axiosInstance.get(
        "/telecaller/client-tracking/clients-summary",
        { params },
      );

      if (response.data.status === 200) {
        setClients(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchClients(page);
    }
  }, []);

  // Reset page when navigating away from tracking page
  useEffect(() => {
    if (!pathname.includes('/portal/admin/tracking')) {
      sessionStorage.removeItem('trackingPage');
    }
  }, [pathname]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    sessionStorage.setItem('trackingPage', newPage.toString());
    setPageInput("");
    fetchClients(newPage);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
      handlePageChange(pageNum);
    } else {
      setPageInput("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (clientId) => {
    router.push(`/portal/admin/tracking/${clientId}`);
  };

  const openHistoryModal = async (client) => {
    setFeedbackModal((prev) => ({
      ...prev,
      isOpen: true,
      clientId: client.client_id,
      clientName: client.client_name,
      loading: true,
      historyData: [],
    }));
    try {
      const response = await axiosInstance.get(
        `/telecaller/client-tracking/call-feedback/${client.client_id}`,
      );
      if (response.data.status === 200) {
        setFeedbackModal((prev) => ({
          ...prev,
          historyData: response.data.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      setFeedbackModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      clientId: null,
      clientName: "",
      loading: false,
      historyData: [],
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "interested":
        return "bg-green-900/30 border-green-700 text-green-400";
      case "not_interested":
        return "bg-red-900/30 border-red-700 text-red-400";
      case "callback":
        return "bg-amber-900/30 border-amber-700 text-amber-400";
      case "no_answer":
        return "bg-teal-900/30 border-teal-700 text-teal-400";
      case "converted":
        return "bg-blue-900/30 border-blue-700 text-blue-400";
      case "follow_up":
        return "bg-purple-900/30 border-purple-700 text-purple-400";
      default:
        return "bg-gray-700 border-gray-600 text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    return (
      status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      status
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "0.5rem",
          }}
        >
          User Tracking
        </h1>
        <p style={{ color: "#9ca3af" }}>
          View client activity and engagement across gyms
        </p>
      </div>

      {/* Cards Section */}
      <div
        style={{
          backgroundColor: "#1f2937",
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "1px solid #374151",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#374151",
            borderBottom: "1px solid #4b5563",
          }}
        >
          <div
            style={{
              gridColumn: "span 3",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
            }}
          >
            Client Name
          </div>
          <div
            style={{
              gridColumn: "span 1",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
            }}
          >
            Gyms
          </div>
          <div
            style={{
              gridColumn: "span 2",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
            }}
          >
            Last Called By
          </div>
          <div
            style={{
              gridColumn: "span 3",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
            }}
          >
            Products
          </div>
          <div
            style={{
              gridColumn: "span 2",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
            }}
          >
            Last Activity
          </div>
          <div
            style={{
              gridColumn: "span 1",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#d1d5db",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Actions
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 0",
            }}
          >
            <FaSpinner
              style={{
                fontSize: "2rem",
                color: "#FF5757",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : clients.length === 0 ? (
          <div
            style={{
              padding: "3rem 0",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            No clients found
          </div>
        ) : (
          <div>
            {clients.map((client) => (
              <div
                key={client.client_id}
                onClick={() => handleViewDetails(client.client_id)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #374151",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#37415180";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, 1fr)",
                    gap: "1rem",
                    padding: "1rem 1.5rem",
                    alignItems: "center",
                  }}
                >
                  {/* Client Name Column */}
                  <div style={{ gridColumn: "span 3" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {client.dp ? (
                        <img
                          src={client.dp}
                          alt={client.client_name}
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "0.75rem",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "#374151",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "0.75rem",
                          }}
                        >
                          <FaUser style={{ fontSize: "1.25rem", color: "#9ca3af" }} />
                        </div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "white",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "180px",
                          }}
                        >
                          {client.client_name.length > 25
                            ? client.client_name.substring(0, 25) + "..."
                            : client.client_name}
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            color: "#9ca3af",
                          }}
                        >
                          {client.phone || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gyms Viewed Column */}
                  <div style={{ gridColumn: "span 1" }}>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#d1d5db" }}>
                      <FaBuilding style={{ fontSize: "1rem", marginRight: "0.25rem", color: "#60a5fa" }} />
                      <span style={{ fontWeight: "600" }}>
                        {client.total_gyms_viewed || 0}
                      </span>
                    </div>
                  </div>

                  {/* Last Called By Column */}
                  <div style={{ gridColumn: "span 2" }}>
                    <div style={{ fontSize: "0.875rem", color: "#d1d5db" }}>
                      {client.last_called_by ? (
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {client.last_called_by}
                        </span>
                      ) : (
                        <span style={{ color: "#6b7280" }}>Not called yet</span>
                      )}
                    </div>
                  </div>

                  {/* Interested Products Column */}
                  <div style={{ gridColumn: "span 3" }}>
                    {client.interested_products &&
                    client.interested_products.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {client.interested_products
                          .slice(0, 2)
                          .map((product, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "0.25rem 0.5rem",
                                backgroundColor: "#581c874d",
                                border: "1px solid #6b21a8",
                                color: "#d8b4fe",
                                fontSize: "0.75rem",
                                borderRadius: "0.25rem",
                              }}
                            >
                              {product}
                            </span>
                          ))}
                        {client.interested_products.length > 2 && (
                          <span
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#374151",
                              color: "#d1d5db",
                              fontSize: "0.75rem",
                              borderRadius: "0.25rem",
                            }}
                          >
                            +{client.interested_products.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        No interests
                      </span>
                    )}
                  </div>

                  {/* Last Activity Column */}
                  <div style={{ gridColumn: "span 2" }}>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#d1d5db" }}>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDateTime(client.last_viewed_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action Column - Only History Button */}
                  <div
                    style={{
                      gridColumn: "span 1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openHistoryModal(client);
                      }}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#9333ea",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      title="View call history"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#7e22ce";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#9333ea";
                      }}
                    >
                      <FaClock style={{ fontSize: "0.75rem", color: "white" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
            Showing {(page - 1) * pagination.limit + 1} to{" "}
            {Math.min(page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} clients
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev || loading}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#9ca3af",
                  cursor: (!pagination.hasPrev || loading) ? "not-allowed" : "pointer",
                  opacity: (!pagination.hasPrev || loading) ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasPrev && !loading) {
                    e.target.style.color = "white";
                    e.target.style.backgroundColor = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                  e.target.style.backgroundColor = "#1f2937";
                }}
              >
                <FaChevronLeft style={{ fontSize: "1.25rem" }} />
              </button>
              <span style={{ fontSize: "0.875rem", color: "#9ca3af", padding: "0 0.5rem" }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext || loading}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  color: "#9ca3af",
                  cursor: (!pagination.hasNext || loading) ? "not-allowed" : "pointer",
                  opacity: (!pagination.hasNext || loading) ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasNext && !loading) {
                    e.target.style.color = "white";
                    e.target.style.backgroundColor = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                  e.target.style.backgroundColor = "#1f2937";
                }}
              >
                <FaChevronRight style={{ fontSize: "1.25rem" }} />
              </button>
            </div>

            <form
              onSubmit={handlePageInputSubmit}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Go to:</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Page no."
                style={{
                  width: "5rem",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
              />
              <button
                type="submit"
                disabled={!pageInput || loading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                  cursor: (!pageInput || loading) ? "not-allowed" : "pointer",
                  opacity: (!pageInput || loading) ? 0.5 : 1,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (pageInput && !loading) e.target.style.backgroundColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#dc2626";
                }}
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feedback History Modal */}
      {feedbackModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#1f2937",
              borderRadius: "0.5rem",
              border: "1px solid #374151",
              width: "100%",
              maxWidth: "42rem",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #374151",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FaClock style={{ fontSize: "1.25rem", color: "#9333ea" }} />
                Call History - {feedbackModal.clientName}
              </h3>
              <button
                onClick={closeFeedbackModal}
                style={{
                  padding: "0.25rem",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem 1.5rem",
              }}
            >
              {feedbackModal.loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "3rem 0",
                  }}
                >
                  <FaSpinner
                    style={{
                      fontSize: "2rem",
                      color: "#ef4444",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
              ) : feedbackModal.historyData.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 0",
                    color: "#9ca3af",
                  }}
                >
                  <FaClock
                    style={{
                      fontSize: "3rem",
                      color: "#4b5563",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <p>No call history found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {feedbackModal.historyData.map((feedback) => (
                    <div
                      key={feedback.id}
                      style={{
                        backgroundColor: "#374151",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              color: "white",
                            }}
                          >
                            {feedback.executive_name || "Executive"}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            {formatDateTime(feedback.created_at)}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            borderRadius: "0.25rem",
                            border: "1px solid",
                          }}
                          className={getStatusColor(feedback.status)}
                        >
                          {getStatusLabel(feedback.status)}
                        </span>
                      </div>
                      {feedback.feedback && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#d1d5db",
                            backgroundColor: "#1f2937",
                            borderRadius: "0.375rem",
                            padding: "0.75rem",
                          }}
                        >
                          {feedback.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.75rem",
                padding: "1rem 1.5rem",
                borderTop: "1px solid #374151",
              }}
            >
              <button
                onClick={closeFeedbackModal}
                disabled={feedbackModal.loading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#374151",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                  cursor: feedbackModal.loading ? "not-allowed" : "pointer",
                  opacity: feedbackModal.loading ? 0.5 : 1,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!feedbackModal.loading) e.target.style.backgroundColor = "#4b5563";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#374151";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
