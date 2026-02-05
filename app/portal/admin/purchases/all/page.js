"use client";
import { useState, useEffect } from "react";
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

  const formatAmount = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`;
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
                <th>Client Name</th>
                <th>Gym Name</th>
                <th>Days Total</th>
                <th>Amount</th>
                <th>Purchased At</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="client-name">{purchase.client_name || "N/A"}</td>
                  <td className="gym-name">{purchase.gym_name || "N/A"}</td>
                  <td className="days-total">{purchase.days_total || 0}</td>
                  <td className="amount">{formatAmount(purchase.amount)}</td>
                  <td className="purchased-at">{formatDate(purchase.purchased_at)}</td>
                </tr>
              ))}
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

        table.purchases-table .amount {
          font-weight: 600 !important;
          color: #4ade80 !important;
        }

        table.purchases-table .purchased-at {
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
