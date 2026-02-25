"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function UsersStatsPage() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [payingUsers, setPayingUsers] = useState(0);
  const [repeatUsers, setRepeatUsers] = useState(0);

  // Fetch users stats data
  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/users-stats/data");

      if (response.data.success) {
        setTotalUsers(response.data.data.total_users);
        setActiveUsers(response.data.data.active_users);
        setPayingUsers(response.data.data.paying_users);
        setRepeatUsers(response.data.data.repeat_users);
      }
    } catch (err) {
      console.error("Error fetching users data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <div style={{ color: "#888" }}>Loading...</div>
        </div>
      ) : (
        <div className="section-container">
          <div className="row g-4">
            {/* Total Users Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Total Users</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#FF5757" }}>
                    {totalUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Registered users count
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Active Users</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#22c55e" }}>
                    {activeUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Active users (last 30 days)
                  </div>
                </div>
              </div>
            </div>

            {/* Total Paying Users Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Total Paying Users</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}>
                    {payingUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Unique users with payments
                  </div>
                </div>
              </div>
            </div>

            {/* Repeat Users Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Repeat Users</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#a855f7" }}>
                    {repeatUsers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Customers with 1+ payments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
