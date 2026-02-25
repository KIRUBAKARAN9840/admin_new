"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function GymsPage() {
  const [loading, setLoading] = useState(true);
  const [totalGyms, setTotalGyms] = useState(0);
  const [activeGyms, setActiveGyms] = useState(0);

  // Fetch gyms count data
  const fetchGymsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/gyms/total-count");

      if (response.data.success) {
        setTotalGyms(response.data.data.total_gyms);
        setActiveGyms(response.data.data.breakdown.green);
      }
    } catch (err) {
      console.error("Error fetching gyms data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymsData();
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
            {/* Total Gyms Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Total Gyms</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#FF5757" }}>
                    {totalGyms.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Registered gyms count
                  </div>
                </div>
              </div>
            </div>

            {/* Active Gyms Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Active Gyms</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#22c55e" }}>
                    {activeGyms.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Active (green) gyms
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
