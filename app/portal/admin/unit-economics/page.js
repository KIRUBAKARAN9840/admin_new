"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function UnitEconomicsPage() {
  const [loading, setLoading] = useState(true);
  const [unitEconomicsData, setUnitEconomicsData] = useState(null);
  const [dateFilter, setDateFilter] = useState("last_30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize dates based on the initial filter
  const getInitialDates = () => {
    const today = new Date();

    if (dateFilter === "today") {
      return {
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
    } else if (dateFilter === "last_7") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        start: sevenDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
    } else if (dateFilter === "last_30") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
    } else if (dateFilter === "last_month") {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
      const lastDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);
      return {
        start: firstDayOfLastMonth.toISOString().split('T')[0],
        end: lastDayOfLastMonth.toISOString().split('T')[0]
      };
    } else if (dateFilter === "current_month") {
      const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: firstDayOfCurrentMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      };
    }
    // Default to last_30
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const initialDates = getInitialDates();
  const [currentStartDate, setCurrentStartDate] = useState(initialDates.start);
  const [currentEndDate, setCurrentEndDate] = useState(initialDates.end);

  useEffect(() => {
    // Set date range based on filter selection
    const today = new Date();

    if (dateFilter === "today") {
      setCurrentEndDate(today.toISOString().split('T')[0]);
      setCurrentStartDate(today.toISOString().split('T')[0]);
    } else if (dateFilter === "last_7") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      setCurrentEndDate(today.toISOString().split('T')[0]);
      setCurrentStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    } else if (dateFilter === "last_30") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setCurrentEndDate(today.toISOString().split('T')[0]);
      setCurrentStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    } else if (dateFilter === "last_month") {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
      const lastDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);
      setCurrentEndDate(lastDayOfLastMonth.toISOString().split('T')[0]);
      setCurrentStartDate(firstDayOfLastMonth.toISOString().split('T')[0]);
    } else if (dateFilter === "current_month") {
      const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setCurrentEndDate(today.toISOString().split('T')[0]);
      setCurrentStartDate(firstDayOfCurrentMonth.toISOString().split('T')[0]);
    }
  }, [dateFilter]);

  const fetchUnitEconomicsAnalytics = async (isOverall = false) => {
    setLoading(true);
    try {
      let url = "/api/admin/unit-economics/cac";
      const params = [];

      if (!isOverall) {
        if (dateFilter === "custom" && startDate && endDate) {
          params.push(`start_date=${startDate}`, `end_date=${endDate}`);
        } else if (dateFilter !== "overall") {
          params.push(`start_date=${currentStartDate}`, `end_date=${currentEndDate}`);
        }
      }

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const response = await axiosInstance.get(url);
      if (response.data && response.data.success) {
        setUnitEconomicsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching unit economics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter === "overall") {
      fetchUnitEconomicsAnalytics(true);
    } else if (dateFilter === "custom" && startDate && endDate) {
      fetchUnitEconomicsAnalytics(false);
    } else if (["today", "last_7", "last_30", "last_month", "current_month"].includes(dateFilter)) {
      fetchUnitEconomicsAnalytics(false);
    }
  }, [dateFilter, currentStartDate, currentEndDate, startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardStyle = {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "12px",
    padding: "1.5rem",
  };

  const inputStyle = {
    backgroundColor: "#374151",
    border: "1px solid #4b5563",
    borderRadius: "6px",
    color: "white",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "white", margin: "0 0 0.25rem 0" }}>Unit Economics</h1>
        <p style={{ color: "#9ca3af", margin: "0", fontSize: "0.875rem" }}>Track your Customer Acquisition Cost and other unit economics metrics</p>
      </div>

      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="today">Today</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="last_month">Last Month</option>
              <option value="current_month">Current Month</option>
              <option value="overall">Overall</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* CAC Card and Supporting Metrics */}
      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}>
          <div style={{ color: "#888" }}>Loading...</div>
        </div>
      ) : unitEconomicsData ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {/* Main CAC Card */}
          <div style={{
            background: "linear-gradient(135deg, #FF5757 0%, #ff8585 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(255, 87, 87, 0.3)",
          }}>
            <div style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Customer Acquisition Cost
            </div>
            <div style={{ color: "#ffffff", fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {formatCurrency(unitEconomicsData.cac)}
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.75rem" }}>
              Cost to acquire one customer
            </div>
          </div>

          {/* Total Expenses Card */}
          <div style={cardStyle}>
            <div style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Total Expenses
            </div>
            <div style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              {formatCurrency(unitEconomicsData.totalExpenses)}
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
              Marketing and operational expenses
            </div>
          </div>

          {/* Total New Users Card */}
          <div style={cardStyle}>
            <div style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Total New Users
            </div>
            <div style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              {unitEconomicsData.totalNewUsers.toLocaleString()}
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
              New customers acquired
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}>
          <div style={{ color: "#888" }}>No data available</div>
        </div>
      )}
    </div>
  );
}
