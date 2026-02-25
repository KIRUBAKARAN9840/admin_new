"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function GymsPage() {
  const [loading, setLoading] = useState(true);
  const [totalGyms, setTotalGyms] = useState(0);
  const [activeGyms, setActiveGyms] = useState(0);
  const [citiesData, setCitiesData] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  // Fetch gyms count data
  const fetchGymsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/gyms/total-count");

      if (response.data.success) {
        setTotalGyms(response.data.data.total_gyms);
        setActiveGyms(response.data.data.active_gyms);
      }
    } catch (err) {
      console.error("Error fetching gyms data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch gyms per city data
  const fetchCitiesData = async () => {
    try {
      setCitiesLoading(true);
      const response = await axiosInstance.get("/api/admin/gyms/per-city", {
        params: { limit: 100 }
      });

      if (response.data.success) {
        setCitiesData(response.data.data.cities);
      }
    } catch (err) {
      console.error("Error fetching cities data:", err);
    } finally {
      setCitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchGymsData();
    fetchCitiesData();
  }, []);

  // Calculate active gym ratio
  const activeRatio = totalGyms > 0 ? ((activeGyms / totalGyms) * 100).toFixed(1) : "0.0";

  // Calculate max count for bar chart scaling
  const maxCount = citiesData.length > 0 ? Math.max(...citiesData.map(c => c.count)) : 0;

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
                    Gyms with orders
                  </div>
                </div>
              </div>
            </div>

            {/* Active Gym Ratio Card */}
            <div className="col-xl-3 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Active Gym Ratio</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6" }}>
                    {activeRatio}%
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Active gyms percentage
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gyms per City Bar Chart */}
          <div className="row g-4" style={{ marginTop: "25px" }}>
            <div className="col-12">
              <div className="dashboard-card">
                <div className="card-header-custom">
                  <h6 className="card-title">Gyms per City</h6>
                </div>
                <div className="card-body-custom">
                  {citiesLoading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                      Loading chart data...
                    </div>
                  ) : citiesData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                      No data available
                    </div>
                  ) : (
                    <div style={{ padding: "20px" }}>
                      {/* Horizontal Scroll Container */}
                      <div style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        paddingBottom: "15px"
                      }}>
                        {/* Scrollbar styling */}
                        <style jsx>{`
                          div::-webkit-scrollbar {
                            height: 8px;
                          }
                          div::-webkit-scrollbar-track {
                            background: #1f2937;
                            border-radius: 4px;
                          }
                          div::-webkit-scrollbar-thumb {
                            background: #FF5757;
                            border-radius: 4px;
                          }
                          div::-webkit-scrollbar-thumb:hover {
                            background: #ff7b7b;
                          }
                        `}</style>

                        {/* Bars Container */}
                        <div style={{
                          display: "flex",
                          gap: "20px",
                          height: "300px",
                          minWidth: "min-content"
                        }}>
                          {citiesData.map((city, index) => {
                            const barHeight = maxCount > 0 ? (city.count / maxCount) * 100 : 0;
                            return (
                              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                {/* Count */}
                                <div style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#FF5757"
                                }}>
                                  {city.count}
                                </div>

                                {/* Bar Container */}
                                <div style={{
                                  width: "50px",
                                  height: "250px",
                                  backgroundColor: "#1f2937",
                                  borderRadius: "6px",
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "flex-end"
                                }}>
                                  {/* Vertical Bar */}
                                  <div style={{
                                    width: "100%",
                                    height: `${barHeight}%`,
                                    background: "linear-gradient(180deg, #FF5757 0%, #ff7b7b 100%)",
                                    borderRadius: "6px",
                                    transition: "height 0.6s ease-out"
                                  }} />
                                </div>

                                {/* City Name */}
                                <div style={{
                                  width: "80px",
                                  fontSize: "12px",
                                  color: "#ccc",
                                  textAlign: "center",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}>
                                  {city.city}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div style={{
                        marginTop: "10px",
                        paddingTop: "15px",
                        borderTop: "1px solid #374151",
                        fontSize: "12px",
                        color: "#888"
                      }}>
                        Showing {citiesData.length} cities by gym count
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
