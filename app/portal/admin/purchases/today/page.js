"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function TodaySchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get("/api/admin/purchases/today-schedule");

      if (response.data.success) {
        setSchedule(response.data.data.schedule);
        setTodayDate(response.data.data.date);
      } else {
        throw new Error(response.data.message || "Failed to fetch today's schedule");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch today's schedule";
      setError(errorMsg);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const formatAmount = (amount) => {
  //   return `₹${amount?.toFixed(2) || "0.00"}`;
  // };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "#FFA500";
      case "attended":
        return "#4ade80";
      case "missed":
        return "#ef4444";
      case "rescheduled":
        return "#3b82f6";
      case "canceled":
        return "#888";
      default:
        return "#ccc";
    }
  };

  return (
    <div>
      {/* Date Header */}
      <div className="mb-4">
        <h5 style={{ color: "#888", fontSize: "14px", fontWeight: "400", marginBottom: "0" }}>
          Schedule for:
        </h5>
        <p style={{ color: "#fff", fontSize: "18px", fontWeight: "600" }}>
          {todayDate ? formatDate(todayDate) : "Today"}
        </p>
      </div>

      {/* Schedule */}
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
          <p style={{ fontSize: "14px", color: "#ccc" }}>Loading schedule...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#ef4444" }}>Error: {error}</p>
          <button
            className="btn btn-sm mt-3"
            onClick={fetchTodaySchedule}
            style={{ backgroundColor: "#FF5757", border: "none", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "16px", color: "#888" }}>No schedule found for today</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table schedule-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Gym Name</th>
                <th>Type</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                {/* <th>Amount</th> */}
                <th>Purchased At</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.id}>
                  <td className="client-name">{item.client_name || "N/A"}</td>
                  <td className="gym-name">{item.gym_name || "N/A"}</td>
                  <td className="type">{item.type}</td>
                  <td className="scheduled-date">{formatDate(item.scheduled_date)}</td>
                  <td className="status">
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: getStatusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  {/* <td className="amount">{formatAmount(item.amount)}</td> */}
                  <td className="purchased-at">{formatDateTime(item.purchased_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        table.schedule-table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          background-color: #1a1a1a !important;
          color: #fff !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        table.schedule-table > thead {
          background-color: #222 !important;
          border-bottom: 2px solid #FF5757 !important;
        }

        table.schedule-table > thead > tr > th {
          padding: 12px !important;
          font-weight: 600 !important;
          text-align: left !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.schedule-table > tbody > tr {
          border-bottom: 1px solid #333 !important;
          transition: background-color 0.2s ease !important;
          background-color: transparent !important;
        }

        table.schedule-table > tbody > tr:hover {
          background-color: #222 !important;
        }

        table.schedule-table > tbody > tr:last-child {
          border-bottom: none !important;
        }

        table.schedule-table > tbody > tr > td {
          padding: 12px !important;
          color: #fff !important;
          border: none !important;
          background-color: transparent !important;
        }

        table.schedule-table .client-name {
          font-weight: 500 !important;
        }

        table.schedule-table .gym-name {
          color: #ccc !important;
        }

        table.schedule-table .scheduled-date {
          font-weight: 500 !important;
        }

        table.schedule-table .days-total {
          font-weight: 500 !important;
        }

        table.schedule-table .amount {
          font-weight: 600 !important;
          color: #4ade80 !important;
        }

        table.schedule-table .purchased-at {
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
