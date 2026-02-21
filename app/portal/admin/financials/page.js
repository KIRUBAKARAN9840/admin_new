"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function FinancialsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [financialsData, setFinancialsData] = useState(null);

  // Filter states
  const [dateFilter, setDateFilter] = useState("last_30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch financials data - using useCallback to prevent recreation
  const fetchFinancialsData = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const params = {};

      // Only add dates if they are provided (non-empty)
      if (start && end) {
        params.start_date = start;
        params.end_date = end;
      }

      console.log("Fetching financials data with params:", params);

      const response = await axiosInstance.get("/api/admin/financials/overview", { params });

      if (response.data.success) {
        setFinancialsData(response.data.data);
        console.log("Financials data received:", response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch financials data");
      }
    } catch (err) {
      console.error("Error fetching financials data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate date range based on filter
  const getDateRange = useCallback((filter) => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    switch (filter) {
      case "today":
        return { start: formatDate(today), end: formatDate(today) };
      case "last_7": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return { start: formatDate(sevenDaysAgo), end: formatDate(today) };
      }
      case "last_30": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return { start: formatDate(thirtyDaysAgo), end: formatDate(today) };
      }
      case "last_month": {
        const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const firstDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
        const lastDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);
        return { start: formatDate(firstDayOfLastMonth), end: formatDate(lastDayOfLastMonth) };
      }
      case "current_month": {
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: formatDate(firstDayOfCurrentMonth), end: formatDate(today) };
      }
      case "overall":
        // Use a very early date to get all-time data (matching reference API)
        return { start: "2020-01-01", end: formatDate(today) };
      case "custom":
        return { start: startDate, end: endDate };
      default: {
        const defaultThirtyDays = new Date(today);
        defaultThirtyDays.setDate(defaultThirtyDays.getDate() - 30);
        return { start: formatDate(defaultThirtyDays), end: formatDate(today) };
      }
    }
  }, [startDate, endDate]);

  // Handle date filter change
  const handleDateFilterChange = useCallback((value) => {
    setDateFilter(value);
    if (value === "custom") {
      setStartDate("");
      setEndDate("");
    } else {
      // For non-custom filters, calculate and fetch immediately
      const { start, end } = getDateRange(value);
      setStartDate(start);
      setEndDate(end);
      fetchFinancialsData(start, end);
    }
  }, [getDateRange, fetchFinancialsData]);

  // Fetch data when custom dates change (only if both are set and filter is custom)
  useEffect(() => {
    if (dateFilter === "custom" && startDate && endDate) {
      fetchFinancialsData(startDate, endDate);
    }
  }, [startDate, endDate, dateFilter, fetchFinancialsData]);

  // Initial load
  useEffect(() => {
    const { start, end } = getDateRange("last_30");
    setStartDate(start);
    setEndDate(end);
    fetchFinancialsData(start, end);
  }, []); // Empty dependency array - only run on mount

  const handleBack = () => {
    router.push("/portal/admin/home");
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      // Show max 2 decimal places, remove trailing zeros for whole numbers
      const formatted = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      return `₹${formatted}`;
    }
    return amount;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="section-container">
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
              <p style={{ fontSize: "14px", color: "#ccc" }}>
                Loading financials data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header with Filters */}
      <div className="section-container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={handleBack}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#3a3a3a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#2a2a2a")}
            >
              ← Back
            </button>
            <h3 className="section-heading" style={{ margin: 0 }}>
              <span style={{ color: "#FF5757" }}>Financials</span> Dashboard
            </h3>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              style={{
                padding: "10px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
              }}
            >
              <option value="today">Today</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="last_month">Last Month</option>
              <option value="current_month">Current Month</option>
              <option value="overall">Overall</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateFilter === "custom" && (
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#aaa" }}>
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "10px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#aaa" }}>
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: "10px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Financial Metrics */}
      <div className="section-container">
        <div className="row g-4">
          {/* Total Revenue Card */}
          <div className="col-xl-6 col-lg-6">
            <div className="dashboard-card">
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Total Revenue</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {financialsData ? formatCurrency(financialsData.totalRevenue) : "₹0"}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  All revenue sources combined
                </div>
                {financialsData && financialsData.revenueSourceBreakdown && (
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>
                      Revenue Breakdown:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Daily Pass:</span>
                        <span style={{ color: "#fff" }}>{formatCurrency(financialsData.revenueSourceBreakdown.daily_pass)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Sessions:</span>
                        <span style={{ color: "#fff" }}>{formatCurrency(financialsData.revenueSourceBreakdown.sessions)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Gym Membership:</span>
                        <span style={{ color: "#fff" }}>{formatCurrency(financialsData.revenueSourceBreakdown.gym_membership)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Fymble Subscription:</span>
                        <span style={{ color: "#FF5757" }}>{formatCurrency(financialsData.revenueSourceBreakdown.fittbot_subscription)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actual Gym Payout Card */}
          <div className="col-xl-6 col-lg-6">
            <div className="dashboard-card">
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Actual Gym Payout</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {financialsData ? formatCurrency(financialsData.actualGymPayout) : "₹0"}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Excluding Fymble Subscription
                </div>
                {financialsData && financialsData.payoutBreakdown && (
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>
                      Payout Breakdown:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Membership:</span>
                        <span style={{ color: "#4ade80" }}>{formatCurrency(financialsData.payoutBreakdown.membership.revenue)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Daily Pass:</span>
                        <span style={{ color: "#4ade80" }}>{formatCurrency(financialsData.payoutBreakdown.daily_pass.revenue)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>Sessions:</span>
                        <span style={{ color: "#4ade80" }}>{formatCurrency(financialsData.payoutBreakdown.sessions.revenue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deductions Breakdown */}
      {financialsData && financialsData.totalDeductions && (
        <div className="section-container">
          <h5 className="section-heading" style={{ marginBottom: "20px" }}>
            Total Deductions
          </h5>
          <div className="row g-4">
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Commission</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.totalDeductions.commission)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                    Platform commission
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">PG Deduction</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.totalDeductions.pg_deduction)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                    Payment gateway charges
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">TDS Deduction</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.totalDeductions.tds_deduction)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                    Tax deducted at source
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Total Deductions</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px", color: "#ef4444" }}>
                    {formatCurrency(financialsData.totalDeductions.total)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                    Sum of all deductions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Net Revenue Section */}
      {financialsData && financialsData.netRevenue && (
        <div className="section-container">
          <h5 className="section-heading" style={{ marginBottom: "20px", textAlign: "center" }}>
            <span style={{ color: "#FF5757" }}>Net</span> Revenue
          </h5>
          <div className="row g-4">
            {/* Total Net Revenue Card */}
            <div className="col-xl-12">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title" style={{ textAlign: "center" }}>Total Net Revenue</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ textAlign: "center" }}>
                    {formatCurrency(financialsData.netRevenue)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px", textAlign: "center" }}>
                    Revenue after GST deductions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Net Revenue Breakdown by Category */}
      {financialsData && financialsData.netRevenueBreakdown && (
        <div className="section-container">
          <h5 className="section-heading" style={{ marginBottom: "20px" }}>
            <span style={{ color: "#FF5757" }}>Net</span> Revenue Breakdown
          </h5>
          <div className="row g-4">
            {/* Fymble Subscription Net Revenue */}
            <div className="col-xl-6 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Fymble Subscription</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.netRevenueBreakdown.fittbot_subscription.net_revenue)}
                  </div>
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                      <span style={{ color: "#888" }}>Total Revenue:</span>
                      <span style={{ color: "#fff" }}>{formatCurrency(financialsData.netRevenueBreakdown.fittbot_subscription.revenue)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#ef4444" }}>GST (18%):</span>
                      <span style={{ color: "#ef4444" }}>-{formatCurrency(financialsData.netRevenueBreakdown.fittbot_subscription.gst)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gym Membership Net Revenue */}
            <div className="col-xl-6 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Gym Membership</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.netRevenueBreakdown.gym_membership.net_revenue)}
                  </div>
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                      <span style={{ color: "#888" }}>Total Revenue:</span>
                      <span style={{ color: "#fff" }}>{formatCurrency(financialsData.netRevenueBreakdown.gym_membership.revenue)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#ef4444" }}>GST on Commission (18%):</span>
                      <span style={{ color: "#ef4444" }}>-{formatCurrency(financialsData.netRevenueBreakdown.gym_membership.gst_on_comm)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Pass Net Revenue */}
            <div className="col-xl-6 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Daily Pass</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.netRevenueBreakdown.daily_pass.net_revenue)}
                  </div>
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                      <span style={{ color: "#888" }}>Total Revenue:</span>
                      <span style={{ color: "#fff" }}>{formatCurrency(financialsData.netRevenueBreakdown.daily_pass.revenue)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#ef4444" }}>GST on Commission (18%):</span>
                      <span style={{ color: "#ef4444" }}>-{formatCurrency(financialsData.netRevenueBreakdown.daily_pass.gst_on_comm)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions Net Revenue */}
            <div className="col-xl-6 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Sessions</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "24px" }}>
                    {formatCurrency(financialsData.netRevenueBreakdown.sessions.net_revenue)}
                  </div>
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                      <span style={{ color: "#888" }}>Total Revenue:</span>
                      <span style={{ color: "#fff" }}>{formatCurrency(financialsData.netRevenueBreakdown.sessions.revenue)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#ef4444" }}>GST on Commission (18%):</span>
                      <span style={{ color: "#ef4444" }}>-{formatCurrency(financialsData.netRevenueBreakdown.sessions.gst_on_comm)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Metrics */}
      <div className="section-container">
        <h5 className="section-heading" style={{ marginBottom: "20px" }}>
          Other Metrics
        </h5>
        <div className="row g-4">
          <div className="col-xl-6 col-lg-6">
            <div
              className="dashboard-card"
              style={{
                opacity: 0.5,
                cursor: "not-allowed"
              }}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Gross Profit</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number" style={{ color: "#888" }}>
                  Coming Soon
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Revenue minus operational costs
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-6">
            <div
              className="dashboard-card"
              style={{
                opacity: 0.5,
                cursor: "not-allowed"
              }}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">EBITA</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number" style={{ color: "#888" }}>
                  Coming Soon
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Earnings before interest, taxes, and amortization
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
