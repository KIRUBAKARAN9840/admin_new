"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../../layout";
import axiosInstance from "@/lib/axios";
import { FaTag, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [fittbotTotalUsersFilter, setFittbotTotalUsersFilter] =
    useState("overall");
  const [fittbotRevenueFilter, setFittbotRevenueFilter] = useState("overall");
  const [businessGymOwnersFilter, setBusinessGymOwnersFilter] =
    useState("month");
  const [businessGymsFilter, setBusinessGymsFilter] = useState("month");
  const [fittbotSubscriptionsFilter, setFittbotSubscriptionsFilter] =
    useState("total");
  const { role } = useRole();

  // Custom date range states - separate for each metric
  const [customDateRange, setCustomDateRange] = useState({
    show: false,
    startDate: "",
    endDate: "",
    activeMetric: null, // 'totalUsers' | 'revenue' | 'gymOwners' | 'gyms'
  });
  const [customRangeData, setCustomRangeData] = useState({
    totalUsers: { value: 0, applied: false, startDate: "", endDate: "" },
    revenue: { value: "₹0", applied: false, startDate: "", endDate: "" },
    gymOwners: { value: 0, applied: false, startDate: "", endDate: "" },
    gyms: { value: 0, applied: false, startDate: "", endDate: "" },
  });

  const [loading, setLoading] = useState(true);
  const [lastMonthRevenue, setLastMonthRevenue] = useState("₹0");
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState("₹0");
  const [dashboardData, setDashboardData] = useState({
    fittbot: {
      totalUsers: { today: 0, week: 0, month: 0, overall: 0 },
      revenue: { today: "₹0", week: "₹0", month: "₹0", overall: "₹0" },
      subscribedUsers: { today: 0, week: 0, month: 0, overall: 0 },
      monthlyActiveUsers: 0,
      totalPayingUsers: 0,
      monthlyRevenueTrends: [],
    },
    business: {
      gymOwners: { today: 0, week: 0, month: 0, overall: 0 },
      gyms: { today: 0, week: 0, month: 0, overall: 0 },
      dailyPassGyms: 0,
      verifiedGyms: { verified: 0, total: 0 },
      unverifiedGyms: 0,
      unverifiedSplitup: { red: 0, hold: 0 },
    },
    plans: {
      freeTrial: 0,
      complimentary: 0,
      fittbotSubscriptions: { total: 0, gold: 0, platinum: 0, diamond: 0 },
    },
    rewards: {
      total: 0,
      interested: 0,
    },
    support: {
      totalTickets: { gym: 0, client: 0 },
      unresolvedTickets: { gym: 0, client: 0 },
      resolvedToday: 0,
    },
    gymPlans: {
      sessionPlans: 0,
      membershipPlans: 0,
      dailyPass: 0,
    },
    gymPhotos: {
      studio: 0,
      onboard: 0,
      noUploads: 0,
    },
    recurringSubscribers: {
      total: 0,
    },
    rewardProgram: {
      totalParticipants: 0,
    },
  });

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

  useEffect(() => {
    fetchDashboardData();
  }, [fittbotTotalUsersFilter, fittbotRevenueFilter, businessGymOwnersFilter, businessGymsFilter, customRangeData.gymOwners.applied, customRangeData.gyms.applied]);

  // Fetch last month revenue on mount
  useEffect(() => {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
    const lastDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDate = formatDate(firstDayOfLastMonth);
    const endDate = formatDate(lastDayOfLastMonth);

    fetchLastMonthRevenue(startDate, endDate);
  }, []);

  const fetchLastMonthRevenue = async (startDate, endDate) => {
    try {
      const params = {
        fittbot_filter: "custom",
        business_filter: "month",
        custom_start_date: startDate,
        custom_end_date: endDate,
      };

      const response = await axiosInstance.get("/api/admin/dashboard/overview", {
        params,
      });

      if (response.data.success && response.data.data.fittbot.revenue.custom) {
        setLastMonthRevenue(response.data.data.fittbot.revenue.custom);
      }
    } catch (err) {
      console.error("Error fetching last month revenue:", err);
    }
  };

  // Fetch current month revenue on mount
  useEffect(() => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();

    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDate = formatDate(firstDayOfCurrentMonth);
    const endDate = formatDate(today);

    fetchCurrentMonthRevenue(startDate, endDate);
  }, []);

  const fetchCurrentMonthRevenue = async (startDate, endDate) => {
    try {
      const params = {
        fittbot_filter: "custom",
        business_filter: "month",
        custom_start_date: startDate,
        custom_end_date: endDate,
      };

      const response = await axiosInstance.get("/api/admin/dashboard/overview", {
        params,
      });

      if (response.data.success && response.data.data.fittbot.revenue.custom) {
        setCurrentMonthRevenue(response.data.data.fittbot.revenue.custom);
      }
    } catch (err) {
      console.error("Error fetching current month revenue:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const params = {
        fittbot_filter: "month", // Always fetch base data
        business_filter: businessGymOwnersFilter,
      };

      const response = await axiosInstance.get("/api/admin/dashboard/overview", {
        params,
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data"
        );
      }

      // Fetch recurring subscribers count
      try {
        const recurringResponse = await axiosInstance.get("/api/admin/dashboard/recurring-subscribers");
        if (recurringResponse.data.success && recurringResponse.data.data) {
          setDashboardData(prev => ({
            ...prev,
            recurringSubscribers: {
              total: recurringResponse.data.data.total || 0
            }
          }));
        } else {
        }
      } catch (recurringErr) {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom data for a specific metric
  const fetchCustomMetricData = async (metric, startDate, endDate) => {
    try {
      const params = {
        fittbot_filter: "custom",
        business_filter: "month",
        custom_start_date: startDate,
        custom_end_date: endDate,
      };

      const response = await axiosInstance.get("/api/admin/dashboard/overview", {
        params,
      });

      if (response.data.success) {
        const customValue = response.data.data.fittbot[metric].custom;
        setCustomRangeData(prev => ({
          ...prev,
          [metric]: {
            value: customValue,
            applied: true,
            startDate,
            endDate,
          }
        }));
      }
    } catch (err) {
    }
  };

  const handleCustomDateApply = async () => {
    if (customDateRange.startDate && customDateRange.endDate && customDateRange.activeMetric) {
      const metric = customDateRange.activeMetric;

      // Map metric to the correct filter setter, response key, and data section
      const metricConfig = {
        totalUsers: {
          filterKey: "totalUsers",
          responseKey: "totalUsers",
          dataSection: "fittbot",
          filterSetter: setFittbotTotalUsersFilter,
          apiFilter: "fittbot_filter",
        },
        revenue: {
          filterKey: "revenue",
          responseKey: "revenue",
          dataSection: "fittbot",
          filterSetter: setFittbotRevenueFilter,
          apiFilter: "fittbot_filter",
        },
        gymOwners: {
          filterKey: "gymOwners",
          responseKey: "gymOwners",
          dataSection: "business",
          filterSetter: setBusinessGymOwnersFilter,
          apiFilter: "business_filter",
        },
        gyms: {
          filterKey: "gyms",
          responseKey: "gyms",
          dataSection: "business",
          filterSetter: setBusinessGymsFilter,
          apiFilter: "business_filter",
        },
      };

      const config = metricConfig[metric];

      try {
        setLoading(true);

        // Build params based on which section the metric belongs to
        const params = {
          fittbot_filter: "month",
          business_filter: "month",
          custom_start_date: customDateRange.startDate,
          custom_end_date: customDateRange.endDate,
        };
        params[config.apiFilter] = "custom";

        const response = await axiosInstance.get("/api/admin/dashboard/overview", {
          params,
        });

        if (response.data.success) {
          // Set only this metric's filter to custom
          config.filterSetter("custom");
          // Hide the modal
          setCustomDateRange({ ...customDateRange, show: false, activeMetric: null });

          // Update custom range data for this metric only
          setCustomRangeData(prev => ({
            ...prev,
            [metric]: {
              value: response.data.data[config.dataSection][config.responseKey].custom || (metric === "revenue" ? "₹0" : 0),
              applied: true,
              startDate: customDateRange.startDate,
              endDate: customDateRange.endDate,
            }
          }));
        } else {
          throw new Error(
            response.data.message || "Failed to fetch dashboard data"
          );
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCustomDateClose = () => {
    setCustomDateRange({ show: false, startDate: "", endDate: "", activeMetric: null });
  };

  const openCustomDateModal = (metric) => {
    setCustomDateRange({
      show: true,
      startDate: customRangeData[metric].startDate || "",
      endDate: customRangeData[metric].endDate || "",
      activeMetric: metric,
    });
  };

  // Use monthly revenue trends from API
  const monthlyRevenueData = dashboardData.fittbot.monthlyRevenueTrends;

  // Helper function to format gym plan metrics as fraction with percentage
  const formatGymPlanMetric = (value, total) => {
    if (!total || total === 0) {
      return (
        <div>
          <div style={{ fontSize: "32px", fontWeight: "600", color: "#fff" }}>
            {value} / 0
          </div>
          <div style={{ fontSize: "16px", color: "#888", marginTop: "4px" }}>
            N/A
          </div>
        </div>
      );
    }
    const percentage = Math.round((value / total) * 100);
    return (
      <div>
        <div style={{ fontSize: "32px", fontWeight: "600", color: "#fff" }}>
          {value} / {total}
        </div>
        <div style={{ fontSize: "16px", color: "#4ade80", marginTop: "4px" }}>
          {percentage}%
        </div>
      </div>
    );
  };

  // Track select element state for custom range re-click detection
  const selectValueOnFocusRef = useRef(null);
  const selectBlurTimeoutRef = useRef(null);

  const handleSelectFocus = (e) => {
    // Store the value when dropdown opens
    selectValueOnFocusRef.current = e.target.value;
  };

  const handleSelectBlur = (e, metric) => {
    const valueOnBlur = e.target.value;

    if (selectBlurTimeoutRef.current) {
      clearTimeout(selectBlurTimeoutRef.current);
    }

    selectBlurTimeoutRef.current = setTimeout(() => {
      
      if (
        selectValueOnFocusRef.current === "custom" &&
        valueOnBlur === "custom" &&
        customRangeData[metric].applied
      ) {
        openCustomDateModal(metric);
      }
      selectValueOnFocusRef.current = null;
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (selectBlurTimeoutRef.current) {
        clearTimeout(selectBlurTimeoutRef.current);
      }
    };
  }, []);

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
                Loading dashboard data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Custom Date Range Modal */}
      {customDateRange.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCustomDateClose}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: "30px",
              borderRadius: "12px",
              minWidth: "400px",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#FF5757",
                marginBottom: "20px",
                fontSize: "20px",
              }}
            >
              Custom Date Range
            </h3>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#ccc",
                  fontSize: "14px",
                }}
              >
                Start Date:
              </label>
              <input
                type="date"
                value={customDateRange.startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setCustomDateRange({ ...customDateRange, startDate: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#ccc",
                  fontSize: "14px",
                }}
              >
                End Date:
              </label>
              <input
                type="date"
                value={customDateRange.endDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setCustomDateRange({ ...customDateRange, endDate: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCustomDateClose}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#555")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#444")}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateApply}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#FF5757",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: customDateRange.startDate && customDateRange.endDate ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  opacity: customDateRange.startDate && customDateRange.endDate ? 1 : 0.5,
                }}
                onMouseEnter={(e) =>
                  customDateRange.startDate && customDateRange.endDate
                    ? (e.target.style.backgroundColor = "#e64c4c")
                    : null
                }
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#FF5757")}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fittbot Section */}
      <div className="section-container">
        <h5 className="section-heading">
          <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#fff" }}>mble Users</span>
        </h5>
        <div className="row g-4">
          {/* Total Users Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/users")}
            >
              <div className="card-header-custom">
                <h6 className="card-title">Total Fymble Users</h6>
                <select
                  className="filter-dropdown"
                  value={fittbotTotalUsersFilter}
                  onChange={(e) => {
                    // Clear any pending blur timeout
                    if (selectBlurTimeoutRef.current) {
                      clearTimeout(selectBlurTimeoutRef.current);
                      selectBlurTimeoutRef.current = null;
                    }

                    const value = e.target.value;
                    if (value === "custom") {
                      setFittbotTotalUsersFilter("custom");
                      openCustomDateModal("totalUsers");
                    } else {
                      setFittbotTotalUsersFilter(value);
                      setCustomRangeData(prev => ({
                        ...prev,
                        totalUsers: { value: 0, applied: false, startDate: "", endDate: "" }
                      }));
                    }
                  }}
                  onFocus={handleSelectFocus}
                  onBlur={(e) => handleSelectBlur(e, "totalUsers")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="overall">Overall</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {fittbotTotalUsersFilter === "custom" && customRangeData.totalUsers.applied
                    ? customRangeData.totalUsers.value
                    : dashboardData.fittbot.totalUsers[fittbotTotalUsersFilter]}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Active Users Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="dashboard-card">
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Monthly Active Users</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.fittbot.monthlyActiveUsers || 0}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Last 30 days
                </div>
              </div>
            </div>
          </div>

          {/* Total Paying Users Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="dashboard-card">
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Total Paying Users</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.fittbot.totalPayingUsers || 0}
                </div>
                {/* <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Unique users who made payments
                </div> */}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fymble Business Section */}
      <div className="section-container">
        <h3 className="section-heading">
          {" "}
          <span style={{ color: "#FF5757" }}>G</span><span style={{ color: "#fff" }}>yms</span>
        </h3>
        <div className="row g-4">
          {/* Gym Owners Card - Commented out */}
          {/*
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/gymowners")}
            >
              <div className="card-header-custom">
                <h6 className="card-title">Actual Gyms</h6>
                <select
                  className="filter-dropdown"
                  value={businessGymOwnersFilter}
                  onChange={(e) => {
                    if (selectBlurTimeoutRef.current) {
                      clearTimeout(selectBlurTimeoutRef.current);
                      selectBlurTimeoutRef.current = null;
                    }

                    const value = e.target.value;
                    if (value === "custom") {
                      setBusinessGymOwnersFilter("custom");
                      openCustomDateModal("gymOwners");
                    } else {
                      setBusinessGymOwnersFilter(value);
                      setCustomRangeData(prev => ({
                        ...prev,
                        gymOwners: { value: 0, applied: false, startDate: "", endDate: "" }
                      }));
                    }
                  }}
                  onFocus={handleSelectFocus}
                  onBlur={(e) => handleSelectBlur(e, "gymOwners")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="overall">Overall</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {businessGymOwnersFilter === "custom" && customRangeData.gymOwners.applied
                    ? customRangeData.gymOwners.value
                    : dashboardData.business.gymOwners[businessGymOwnersFilter]}
                </div>
              </div>
            </div>
          </div>
          */}

          {/* Gyms Card - Commented out */}
          {/*
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/stats")}
            >
              <div className="card-header-custom">
                <h6 className="card-title">Onboarded Gyms</h6>
                <select
                  className="filter-dropdown"
                  value={businessGymsFilter}
                  onChange={(e) => {
                    if (selectBlurTimeoutRef.current) {
                      clearTimeout(selectBlurTimeoutRef.current);
                      selectBlurTimeoutRef.current = null;
                    }

                    const value = e.target.value;
                    if (value === "custom") {
                      setBusinessGymsFilter("custom");
                      openCustomDateModal("gyms");
                    } else {
                      setBusinessGymsFilter(value);
                      setCustomRangeData(prev => ({
                        ...prev,
                        gyms: { value: 0, applied: false, startDate: "", endDate: "" }
                      }));
                    }
                  }}
                  onFocus={handleSelectFocus}
                  onBlur={(e) => handleSelectBlur(e, "gyms")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="overall">Overall</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {businessGymsFilter === "custom" && customRangeData.gyms.applied
                    ? customRangeData.gyms.value
                    : dashboardData.business.gyms[businessGymsFilter]}
                </div>
              </div>
            </div>
          </div>
          */}

          {/* Verified Gyms Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/verified-gyms")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Verified Gyms</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.business.verifiedGyms?.verified || 0} / {dashboardData.business.verifiedGyms?.total || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Unverified Gyms Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/unverified-gyms")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Unverified Gyms</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.business.unverifiedGyms || 0} / {dashboardData.business.verifiedGyms?.total || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Unverified Splitup Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/unverified-splitup")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Unverified Splitup</h6>
              </div>
              <div className="card-body-custom">
                <div style={{ display: "flex", gap: "20px" }}>
                  {/* Red Section */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
                      <FaTag size={24} style={{ color: "#ef4444" }} />
                    </div>
                    <div className="metric-number" style={{ fontSize: "24px" }}>
                      {dashboardData.business.unverifiedSplitup?.red || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      Red
                    </div>
                  </div>

                  {/* Hold Section */}
                  <div style={{ flex: 1, textAlign: "center", borderLeft: "1px solid #333" }}>
                    <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
                      <FaTag size={24} style={{ color: "#eab308" }} />
                    </div>
                    <div className="metric-number" style={{ fontSize: "24px" }}>
                      {dashboardData.business.unverifiedSplitup?.hold || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      Hold
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Metrics Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Revenue</span> Metrics
        </h3>
        <div className="row g-4">
          {/* Total Revenue Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/revenue")}
            >
              <div className="card-header-custom">
                <h6 className="card-title">Total Revenue</h6>
                <select
                  className="filter-dropdown"
                  value={fittbotRevenueFilter}
                  onChange={(e) => {
                    // Clear any pending blur timeout
                    if (selectBlurTimeoutRef.current) {
                      clearTimeout(selectBlurTimeoutRef.current);
                      selectBlurTimeoutRef.current = null;
                    }

                    const value = e.target.value;
                    if (value === "custom") {
                      setFittbotRevenueFilter("custom");
                      openCustomDateModal("revenue");
                    } else if (value === "lastMonth") {
                      // Calculate previous calendar month date range
                      const now = new Date();
                      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                      const firstDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
                      const lastDayOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);

                      // Format dates as YYYY-MM-DD
                      const formatDate = (date) => date.toISOString().split('T')[0];
                      const startDate = formatDate(firstDayOfLastMonth);
                      const endDate = formatDate(lastDayOfLastMonth);

                      // Fetch data for last month
                      fetchCustomMetricData("revenue", startDate, endDate);
                      setFittbotRevenueFilter("lastMonth");
                    } else {
                      setFittbotRevenueFilter(value);
                      setCustomRangeData(prev => ({
                        ...prev,
                        revenue: { value: "₹0", applied: false, startDate: "", endDate: "" }
                      }));
                    }
                  }}
                  onFocus={handleSelectFocus}
                  onBlur={(e) => handleSelectBlur(e, "revenue")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="overall">Overall</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {fittbotRevenueFilter === "lastMonth" && customRangeData.revenue.applied
                    ? customRangeData.revenue.value
                    : fittbotRevenueFilter === "custom" && customRangeData.revenue.applied
                    ? customRangeData.revenue.value
                    : dashboardData.fittbot.revenue[fittbotRevenueFilter]}
                </div>
              </div>
            </div>
          </div>

          {/* Last Month Revenue Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/revenue")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Last Month Revenue</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {lastMonthRevenue}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  {(() => {
                    const now = new Date();
                    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                                       "July", "August", "September", "October", "November", "December"];
                    return `${monthNames[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Current Month Revenue Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/revenue")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Current Month Revenue</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {currentMonthRevenue}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  {(() => {
                    const now = new Date();
                    const monthNames = ["January", "February", "March", "April", "May", "June",
                                       "July", "August", "September", "October", "November", "December"];
                    const dayNames = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th",
                                       "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
                                       "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
                    const day = now.getDate();
                    return `${monthNames[now.getMonth()]} 1 - ${dayNames[day - 1] || day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}`;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* MoM (Month-over-Month) Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/revenue")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">MoM</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {(() => {
                    // Parse revenue strings to numbers (remove ₹ and commas)
                    const parseRevenue = (revenueStr) => {
                      if (typeof revenueStr === 'number') return revenueStr;
                      if (!revenueStr || revenueStr === "₹0") return 0;
                      return parseFloat(revenueStr.replace(/[₹,]/g, '')) || 0;
                    };

                    const lastMonth = parseRevenue(lastMonthRevenue);
                    const currentMonth = parseRevenue(currentMonthRevenue);

                    // Calculate MoM percentage
                    if (lastMonth === 0) {
                      return currentMonth > 0 ? "+∞%" : "0%";
                    }

                    const momPercentage = ((currentMonth - lastMonth) / lastMonth) * 100;
                    const sign = momPercentage >= 0 ? "+" : "";
                    const arrowColor = momPercentage >= 0 ? "#4ade80" : "#ef4444";
                    const ArrowIcon = momPercentage >= 0 ? FaArrowUp : FaArrowDown;

                    return (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span>{`${sign}${momPercentage.toFixed(1)}%`}</span>
                        <span style={{ color: arrowColor }}>
                          <ArrowIcon size={24} />
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  {(() => {
                    const parseRevenue = (revenueStr) => {
                      if (typeof revenueStr === 'number') return revenueStr;
                      if (!revenueStr || revenueStr === "₹0") return 0;
                      return parseFloat(revenueStr.replace(/[₹,]/g, '')) || 0;
                    };

                    const lastMonth = parseRevenue(lastMonthRevenue);
                    const currentMonth = parseRevenue(currentMonthRevenue);

                    if (lastMonth === 0) {
                      return currentMonth > 0 ? "vs Last Month (₹0)" : "vs Last Month";
                    }

                    const momPercentage = ((currentMonth - lastMonth) / lastMonth) * 100;
                    const color = momPercentage >= 0 ? "#4ade80" : "#ef4444";
                    const label = momPercentage >= 0 ? "Growth" : "Decline";

                    return (
                      <span style={{ color }}>
                        {label} vs Last Month
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#fff" }}>mble</span> Subscriptions
        </h3>
        <div className="row g-4">
          {/* Free Trial Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/freetrial")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Free Trial</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.plans.freeTrial}
                </div>
                <div className="metric-change positive">Active Users</div>
              </div>
            </div>
          </div>

          {/* Fymble Subscriptions Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/fittbot-subscriptions")}
            >
              <div className="card-header-custom">
                <h6 className="card-title">Fymble Subscriptions</h6>
                <select
                  className="filter-dropdown"
                  value={fittbotSubscriptionsFilter}
                  onChange={(e) => {
                    setFittbotSubscriptionsFilter(e.target.value);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="total">Total</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {
                    dashboardData.plans.fittbotSubscriptions[
                      fittbotSubscriptionsFilter
                    ]
                  }
                </div>
                <div className="metric-change positive">
                  {fittbotSubscriptionsFilter === "total"
                    ? "All Plans"
                    : fittbotSubscriptionsFilter === "gold"
                    ? "1 Month"
                    : fittbotSubscriptionsFilter === "platinum"
                    ? "6 Months"
                    : "12 Months"}
                </div>
              </div>
            </div>
          </div>

          {/* Complimentary Subscriptions Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/complimentary")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Complimentary Subscriptions</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.plans.complimentary}
                </div>
                <div className="metric-change positive">Fymble Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gym Plans Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Gym</span> Plans
        </h3>
        <div className="row g-4">
          {/* Session Plans Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.href = "/portal/admin/gymplans?type=session")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Session Plans</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {formatGymPlanMetric(dashboardData.gymPlans.sessionPlans, dashboardData.gymPlans.totalGyms)}
                </div>
              </div>
            </div>
          </div>

          {/* Membership Plans Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.href = "/portal/admin/gymplans?type=membership")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Membership Plans</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {formatGymPlanMetric(dashboardData.gymPlans.membershipPlans, dashboardData.gymPlans.totalGyms)}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Pass Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.href = "/portal/admin/gymplans?type=dailyPass")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Daily Pass</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {formatGymPlanMetric(dashboardData.gymPlans.dailyPass, dashboardData.gymPlans.totalGyms)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gym Photos Details Section - Commented out */}
      {/*
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Gym</span> Photos Details
        </h3>
        <div className="row g-4">
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/gymphotos?type=studio")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Verified Studio</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.gymPhotos.studio || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/gymphotos?type=onboard")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Pending Photo verification</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.gymPhotos.onboard || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/gymphotos?type=noUploads")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Photos Not Uploaded</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.gymPhotos.noUploads || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Recurring Subscribers Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Recurring</span> Subscribers
        </h3>
        <div className="row g-4">
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/recurring-subscribers")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Total Recurring Subscribers</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.recurringSubscribers?.total ?? 0}
                </div>
                <div className="metric-description">
                  Clients subscribed multiple times
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward Program Participants Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Reward Program</span> Participants
        </h3>
        <div className="row g-4">
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/reward-participants")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Total Participants</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.rewardProgram?.totalParticipants ?? 0}
                </div>
                <div className="metric-description">
                  Reward program opt-ins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets Section */}
      <div className="section-container">
        <h3 className="section-heading">
          <span style={{ color: "#FF5757" }}>Support</span> Tickets
        </h3>
        <div className="row g-4">
          {/* Gym Support Tickets Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/tickets?type=gym")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Gym</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.support.totalTickets.gym}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Total support tickets
                </div>
              </div>
            </div>
          </div>

          {/* Client Support Tickets Card */}
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div
              className="dashboard-card"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/tickets?type=client")}
            >
              <div className="card-header-custom extra-space">
                <h6 className="card-title">Client</h6>
              </div>
              <div className="card-body-custom">
                <div className="metric-number">
                  {dashboardData.support.totalTickets.client}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                  Total support tickets
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
