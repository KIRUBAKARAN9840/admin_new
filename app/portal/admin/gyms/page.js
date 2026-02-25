"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function GymsPage() {
  const [loading, setLoading] = useState(true);
  const [totalGyms, setTotalGyms] = useState(0);
  const [activeGyms, setActiveGyms] = useState(0);
  const [citiesData, setCitiesData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [viewMode, setViewMode] = useState("city"); // "city" or "state"
  const router = useRouter();

  // Fetch all gyms data in a single API call
  const fetchGymsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/gyms/data", {
        params: { limit: 100 }
      });

      if (response.data.success) {
        setTotalGyms(response.data.data.total_gyms);
        setActiveGyms(response.data.data.active_gyms);
        setCitiesData(response.data.data.cities);
        setStatesData(response.data.data.states || []);
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

  // Calculate active gym ratio - 2 decimal places
  const activeRatio = totalGyms > 0 ? ((activeGyms / totalGyms) * 100).toFixed(2) : "0.00";

  // Get current data based on view mode
  const currentData = viewMode === "city" ? citiesData : statesData;
  const currentLabel = viewMode === "city" ? "city" : "state";

  // Calculate max count for bar chart scaling
  const maxCount = currentData.length > 0 ? Math.max(...currentData.map(c => c.count)) : 0;

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

            {/* Revenue per Gym Card - Clickable */}
            <div
              className="col-xl-3 col-lg-6"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/portal/admin/gyms/revenue")}
            >
              <div
                className="dashboard-card"
                style={{
                  transition: "transform 0.2s, box-shadow 0.2s",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 87, 87, 0.2)";
                  e.currentTarget.style.borderColor = "#FF5757";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Revenue per Gym</h6>
                </div>
                <div className="card-body-custom">
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    View revenue details by gym
                  </div>
                  <div style={{ fontSize: "11px", color: "#FF5757", marginTop: "6px", fontWeight: "500" }}>
                    Click to view details →
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gyms per City/State Bar Chart */}
          <div className="row g-4" style={{ marginTop: "25px" }}>
            <div className="col-12">
              <div className="dashboard-card">
                <div className="card-header-custom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h6 className="card-title">Gyms per {viewMode === "city" ? "City" : "State"}</h6>
                  {/* Toggle Buttons */}
                  <div style={{ display: "flex", gap: "8px", backgroundColor: "#1f2937", borderRadius: "6px", padding: "4px" }}>
                    <button
                      onClick={() => setViewMode("city")}
                      style={{
                        padding: "6px 16px",
                        fontSize: "12px",
                        fontWeight: "500",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: viewMode === "city" ? "#FF5757" : "transparent",
                        color: viewMode === "city" ? "#fff" : "#ccc",
                        transition: "all 0.2s"
                      }}
                    >
                      City
                    </button>
                    <button
                      onClick={() => setViewMode("state")}
                      style={{
                        padding: "6px 16px",
                        fontSize: "12px",
                        fontWeight: "500",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: viewMode === "state" ? "#FF5757" : "transparent",
                        color: viewMode === "state" ? "#fff" : "#ccc",
                        transition: "all 0.2s"
                      }}
                    >
                      State
                    </button>
                  </div>
                </div>
                <div className="card-body-custom">
                  {currentData.length === 0 ? (
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
                          {currentData.map((item, index) => {
                            const barHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            const label = viewMode === "city" ? item.city : item.state;
                            return (
                              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                {/* Count */}
                                <div style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#FF5757"
                                }}>
                                  {item.count}
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

                                {/* City/State Name */}
                                <div style={{
                                  width: "80px",
                                  fontSize: "12px",
                                  color: "#ccc",
                                  textAlign: "center",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}>
                                  {label}
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
                        Showing {currentData.length} {viewMode === "city" ? "cities" : "states"} by gym count
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
