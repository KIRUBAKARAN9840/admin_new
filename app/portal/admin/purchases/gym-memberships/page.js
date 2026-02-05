"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axios";

export default function GymMemberships() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const isFetchingRef = useRef(false);

  const fetchGymMemberships = useCallback(async (pageNum) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get("/api/admin/purchases/gym-memberships", {
        params: {
          page: pageNum,
          limit: 10,
        },
      });

      if (response.data.success) {
        setMemberships(response.data.data.memberships);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || "Failed to fetch gym memberships");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch gym memberships";
      setError(errorMsg);
      setMemberships([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchGymMemberships(page);
  }, [page, fetchGymMemberships]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatType = (type) => {
    if (type === "gym_membership") return "Gym Membership";
    if (type === "personal_training") return "Personal Training";
    return type || "N/A";
  };

  const formatAmount = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
  };

  return (
    <div>
      {/* Memberships Table */}
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
          <p style={{ fontSize: "14px", color: "#ccc" }}>Loading gym memberships...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#ef4444" }}>Error: {error}</p>
          <button
            className="btn btn-sm mt-3"
            onClick={() => fetchGymMemberships(page)}
            style={{ backgroundColor: "#FF5757", border: "none", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      ) : memberships.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#888" }}>No gym memberships found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table memberships-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Gym Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Purchased At</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((item) => (
                <tr key={item.id}>
                  <td className="client-name">{item.client_name || "N/A"}</td>
                  <td className="gym-name">{item.gym_name || "N/A"}</td>
                  <td className="type">{formatType(item.type)}</td>
                  <td className="amount">{formatAmount(item.amount)}</td>
                  <td className="purchased-at">{formatDate(item.purchased_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && memberships.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div style={{ color: "#888", fontSize: "14px" }}>
            Showing {((page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} memberships
          </div>
          <div className="btn-group">
            <button
              className="btn btn-sm"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPage(page - 1)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: pagination.hasPrev && !loading ? "#fff" : "#555",
                cursor: pagination.hasPrev && !loading ? "pointer" : "not-allowed",
              }}
            >
              Previous
            </button>
            <button
              className="btn btn-sm"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPage(page + 1)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                color: pagination.hasNext && !loading ? "#fff" : "#555",
                cursor: pagination.hasNext && !loading ? "pointer" : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        table.memberships-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          background-color: #1a1a1a !important;
          color: #fff !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        table.memberships-table > thead {
          background-color: #222 !important;
          border-bottom: 2px solid #FF5757 !important;
        }

        table.memberships-table > thead > tr > th {
          padding: 12px !important;
          font-weight: 600 !important;
          text-align: left !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.memberships-table > tbody > tr {
          border-bottom: 1px solid #333 !important;
          transition: background-color 0.2s ease !important;
          background-color: transparent !important;
        }

        table.memberships-table > tbody > tr:hover {
          background-color: #222 !important;
        }

        table.memberships-table > tbody > tr:last-child {
          border-bottom: none !important;
        }

        table.memberships-table > tbody > tr > td {
          padding: 12px !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.memberships-table .client-name {
          font-weight: 500 !important;
        }

        table.memberships-table .gym-name {
          color: #ccc !important;
        }

        table.memberships-table .type {
          font-weight: 500 !important;
        }

        table.memberships-table .amount {
          font-weight: 600 !important;
          color: #4ade80 !important;
        }

        table.memberships-table .purchased-at {
          font-size: 14px !important;
          color: #888 !important;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
