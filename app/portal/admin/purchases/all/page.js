"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function AllPurchases() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, search]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: 10,
      };

      if (search) params.search = search;

      const response = await axiosInstance.get("/api/admin/purchases/all-purchases", {
        params,
      });

      if (response.data.success) {
        setPurchases(response.data.data.purchases);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || "Failed to fetch purchases");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch purchases";
      setError(errorMsg);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchPurchases();
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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

  const formatScheduleDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
  };

  const getDisplayValue = (purchase) => {
    if (purchase.type === "Daily Pass") {
      return purchase.days_total || "N/A";
    } else {
      return purchase.session_display || "N/A";
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-4">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by client or gym name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
      </div>

      {/* Purchases Table */}
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
          <p style={{ fontSize: "14px", color: "#ccc" }}>Loading purchases...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#ef4444" }}>Error: {error}</p>
          <button
            className="btn btn-sm mt-3"
            onClick={fetchPurchases}
            style={{ backgroundColor: "#FF5757", border: "none", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#888" }}>No purchases found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table purchases-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>Client Name</th>
                <th>Gym Name</th>
                <th>Type</th>
                <th>Sessions / Days</th>
                <th>Amount</th>
                <th>Purchased At</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                const hasSchedule = purchase.type === "Session" && purchase.session_schedule?.length > 0;
                const isExpanded = expandedRows.has(purchase.id);

                return (
                  <React.Fragment key={purchase.id}>
                    <tr>
                      <td style={{ padding: "8px !important" }}>
                        {hasSchedule && (
                          <button
                            onClick={() => toggleRow(purchase.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#FF5757",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontSize: "16px",
                              transition: "transform 0.2s",
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                          >
                            ▶
                          </button>
                        )}
                      </td>
                      <td className="client-name">{purchase.client_name || "N/A"}</td>
                      <td className="gym-name">{purchase.gym_name || "N/A"}</td>
                      <td className="type">{purchase.type}</td>
                      <td className="days-total">{getDisplayValue(purchase)}</td>
                      <td className="amount">{formatAmount(purchase.amount)}</td>
                      <td className="purchased-at">{formatDate(purchase.purchased_at)}</td>
                    </tr>
                    {isExpanded && hasSchedule && (
                      <tr className="schedule-row">
                        <td colSpan="7" style={{ padding: "0 !important" }}>
                          <div
                            style={{
                              backgroundColor: "#151515",
                              padding: "16px",
                              borderBottom: "1px solid #333",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#FF5757",
                                marginBottom: "12px",
                              }}
                            >
                              Session Schedule
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                              {purchase.session_schedule.map((schedule, idx) => (
                                <div
                                  key={`${purchase.id}-schedule-${idx}`}
                                  style={{
                                    backgroundColor: "#1a1a1a",
                                    border: "1px solid #333",
                                    borderRadius: "6px",
                                    padding: "10px 14px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <div style={{ color: "#fff", fontWeight: "500" }}>
                                    {formatScheduleDate(schedule.date)}
                                  </div>
                                  <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
                                    {schedule.start_time}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && purchases.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div style={{ color: "#888", fontSize: "14px" }}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} purchases
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

      <style jsx global>{`
        table.purchases-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          background-color: #1a1a1a !important;
          color: #fff !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        table.purchases-table > thead {
          background-color: #222 !important;
          border-bottom: 2px solid #FF5757 !important;
        }

        table.purchases-table > thead > tr > th {
          padding: 12px !important;
          font-weight: 600 !important;
          text-align: left !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.purchases-table > tbody > tr {
          border-bottom: 1px solid #333 !important;
          transition: background-color 0.2s ease !important;
          background-color: transparent !important;
        }

        table.purchases-table > tbody > tr:hover {
          background-color: #222 !important;
        }

        table.purchases-table > tbody > tr:last-child {
          border-bottom: none !important;
        }

        table.purchases-table > tbody > tr > td {
          padding: 12px !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.purchases-table .client-name {
          font-weight: 500 !important;
        }

        table.purchases-table .gym-name {
          color: #ccc !important;
        }

        table.purchases-table .type {
          font-weight: 500 !important;
        }

        table.purchases-table .amount {
          font-weight: 600 !important;
          color: #4ade80 !important;
        }

        table.purchases-table .purchased-at {
          font-size: 14px !important;
          color: #888 !important;
        }

        table.purchases-table .schedule-row {
          background-color: #151515 !important;
        }

        table.purchases-table .schedule-row:hover {
          background-color: #151515 !important;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
