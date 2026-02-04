"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  FaSearch,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Users() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gymFromUrl = searchParams.get("gym") || "";

  // Ref to track if we need to skip initial fetch (for state restoration)
  const skipInitialFetchRef = useRef(false);

  // State variables
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(gymFromUrl);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(gymFromUrl);
  const [planFilter, setPlanFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [clientCounts, setClientCounts] = useState({
    active_clients: 0,
    inactive_clients: 0,
    total_clients: 0
  });
  const [onlineOfflineCounts, setOnlineOfflineCounts] = useState({
    online_members: 0,
    offline_members: 0,
    total_members: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
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

  // Fetch plans for filter and restore state if returning
  useEffect(() => {
    fetchAvailablePlans();
    fetchClientCounts();
    fetchOnlineOfflineCounts();

    // Check if we're returning from user detail page
    const savedState = sessionStorage.getItem('usersListState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isReturning) {
          // Restore all state
          setSearchTerm(state.searchTerm || gymFromUrl);
          setDebouncedSearchTerm(state.searchTerm || gymFromUrl);
          setPlanFilter(state.planFilter || "all");
          setDateFilter(state.dateFilter || "all");
          setCustomStartDate(state.customStartDate || "");
          setCustomEndDate(state.customEndDate || "");
          setSortOrder(state.sortOrder || "desc");
          setCurrentPage(state.currentPage || 1);
          setItemsPerPage(state.itemsPerPage || 10);

          // Clear the returning flag
          const updatedState = { ...state, isReturning: false };
          sessionStorage.setItem('usersListState', JSON.stringify(updatedState));

          // Skip the initial fetch since we'll fetch after state is restored
          skipInitialFetchRef.current = true;
        }
      } catch (e) {
      }
    }
  }, [gymFromUrl]);

  const fetchAvailablePlans = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/users/plans");
      if (response.data.success) {
        setAvailablePlans(response.data.data);
      }
    } catch (error) {
    }
  };

  const fetchClientCounts = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/users/client-counts");
      if (response.data.success) {
        setClientCounts(response.data.data);
      }
    } catch (error) {
    }
  };

  const fetchOnlineOfflineCounts = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/users/online-offline-counts");
      if (response.data.success) {
        setOnlineOfflineCounts(response.data.data);
      }
    } catch (error) {
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort_order: sortOrder,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (planFilter && planFilter !== "all") {
        params.plan = planFilter;
      }

      if (dateFilter && dateFilter !== "all") {
        params.date_filter = dateFilter;
        if (dateFilter === "custom" && customStartDate && customEndDate) {
          params.custom_start_date = customStartDate;
          params.custom_end_date = customEndDate;
        }
      }

      const response = await axiosInstance.get("/api/admin/users", { params });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.total);
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, planFilter, debouncedSearchTerm, sortOrder, dateFilter, customStartDate, customEndDate]);

  // Fetch users when filters change
  useEffect(() => {
    // Skip fetch if we're restoring state (will fetch after restoration)
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    fetchUsers();
  }, [fetchUsers]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      searchTerm,
      planFilter,
      dateFilter,
      customStartDate,
      customEndDate,
      sortOrder,
      currentPage,
      itemsPerPage,
      isReturning: false
    };
    sessionStorage.setItem('usersListState', JSON.stringify(stateToSave));
  }, [searchTerm, planFilter, dateFilter, customStartDate, customEndDate, sortOrder, currentPage, itemsPerPage]);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === "search") setSearchTerm(value);
    if (filterType === "plan") setPlanFilter(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleExportClick = () => {
    setShowExportConfirm(true);
  };

  const handleExportUsers = async () => {
    try {
      setShowExportConfirm(false);
      setExportLoading(true);

      const response = await axiosInstance.get("/api/admin/users/export/all");

      if (response.data.success) {
        // Dynamically import xlsx library
        const XLSX = await import("xlsx");

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Prepare data for export
        const headers = ["Name", "Mobile", "Gym Name", "Plan", "Joined Date"];
        const rows = response.data.data.map((user) => [
          user.name || "-",
          user.contact || "-",
          user.gym_name || "-",
          user.plan_name || "No",
          user.created_at
            ? new Date(user.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        ]);
        const sheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Download file
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "users_all_time.xlsx");
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(response.data.message || "Failed to export users");
      }
    } catch (error) {
      alert("Failed to export users data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

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

  if (loading && users.length === 0) {
    return (
      <div className="users-container">
        <div className="users-header">
          <h2 className="users-title">
            <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#4a6fa5" }}>mble</span> Users
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
            <p style={{ fontSize: "14px", color: "#ccc" }}>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "2rem",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1rem",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Export Users Data
            </h3>
            <p
              style={{
                color: "#ccc",
                fontSize: "14px",
                marginBottom: "2rem",
                lineHeight: "1.5",
              }}
            >
              Do you want to export all users data? This will download an Excel
              file containing all user records.
            </p>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowExportConfirm(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExportUsers}
                style={{
                  background: "#FF5757",
                  border: "none",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {showCustomDateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "2rem",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1.5rem",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Custom Date Range
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "14px",
                  marginBottom: "0.5rem",
                }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "14px",
                  marginBottom: "0.5rem",
                }}
              >
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowCustomDateModal(false);
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateFilter("custom");
                    setCurrentPage(1);
                    setShowCustomDateModal(false);
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                style={{
                  background:
                    customStartDate && customEndDate
                      ? "#FF5757"
                      : "#666",
                  border: "none",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor:
                    customStartDate && customEndDate
                      ? "pointer"
                      : "not-allowed",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="users-header">
        <h2 className="users-title">
          <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#4a6fa5" }}>mble</span> Users
          {gymFromUrl && (
            <span
              style={{ fontSize: "14px", color: "#666", marginLeft: "10px" }}
            >
              - {gymFromUrl}
            </span>
          )}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={handleExportClick}
            disabled={exportLoading}
            style={{
              background: exportLoading ? "#666" : "#FF5757",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: exportLoading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {exportLoading ? (
              <>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Exporting...
              </>
            ) : (
              <>
                <span style={{ fontSize: "16px" }}>📥</span>
                Export
              </>
            )}
          </button>
          <div className="users-count">Total: {totalUsers} users</div>
        </div>
      </div>

      {/* Client Counts Cards */}
      <div style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <div
          onClick={() => router.push("/portal/admin/active-clients")}
          style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            flex: 1,
            border: "1px solid #444",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
            Active Clients
          </div>
          <div style={{ fontSize: "32px", fontWeight: "600", color: "#10b981" }}>
            {clientCounts.active_clients.toLocaleString()}
          </div>
        </div>

        <div
          onClick={() => router.push("/portal/admin/inactive-clients")}
          style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            flex: 1,
            border: "1px solid #444",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
            Inactive Clients
          </div>
          <div style={{ fontSize: "32px", fontWeight: "600", color: "#ef4444" }}>
            {clientCounts.inactive_clients.toLocaleString()}
          </div>
        </div>

        <div
          onClick={() => router.push("/portal/admin/online-members")}
          style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            flex: 1,
            border: "1px solid #444",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
            Online Members
          </div>
          <div style={{ fontSize: "32px", fontWeight: "600", color: "#3b82f6" }}>
            {onlineOfflineCounts.online_members.toLocaleString()}
          </div>
        </div>

        <div
          onClick={() => router.push("/portal/admin/offline-members")}
          style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            flex: 1,
            border: "1px solid #444",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
            Offline Members
          </div>
          <div style={{ fontSize: "32px", fontWeight: "600", color: "#8b5cf6" }}>
            {onlineOfflineCounts.offline_members.toLocaleString()}
          </div>
        </div>
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
                placeholder="Search by name, mobile, gym..."
                value={searchTerm}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-sm-12">
            <select
              className="filter-select"
              value={planFilter}
              onChange={(e) => handleFilterChange("plan", e.target.value)}
            >
              <option value="all">All Plans</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.plan_name}>
                  {plan.plan_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-6 col-sm-12">
            <select
              className="filter-select"
              value={dateFilter}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setShowCustomDateModal(true);
                } else {
                  setDateFilter(value);
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setCurrentPage(1);
                }
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="col-lg-2 col-md-6 col-sm-12">
            <button
              className="sort-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
              Sort Date
            </button>
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
                <th>Gym Name</th>
                <th>Plan</th>
                <th>Joined Date</th>
                <th>Last Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.client_id}
                    onClick={() => {
                      // Save current state before navigating
                      const currentState = {
                        searchTerm,
                        planFilter,
                        dateFilter,
                        customStartDate,
                        customEndDate,
                        sortOrder,
                        currentPage,
                        itemsPerPage,
                        isReturning: true
                      };
                      sessionStorage.setItem('usersListState', JSON.stringify(currentState));
                      router.push(`/portal/admin/users/${user.client_id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div className="user-name">{user.name || "-"}</div>
                    </td>
                    <td>{user.contact || "-"}</td>
                    <td>{user.gym_name || "-"}</td>
                    <td>
                      <span
                        className="plan-badge"
                        style={{
                          color: user.plan_name ? "#FFFFFF" : "red",
                          backgroundColor: user.plan_name
                            ? "rgba(79, 140, 79, 0.1)"
                            : "rgba(255, 0, 0, 0.1)",
                          borderColor: user.plan_name ? "green" : "red",
                        }}
                      >
                        {user.plan_name || "No"}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{formatDate(user.last_purchase_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No users found matching your criteria
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
            {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers}{" "}
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
                className={`pagination-btn ${
                  page === currentPage ? "active" : ""
                } ${page === "..." ? "dots" : ""}`}
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
  
