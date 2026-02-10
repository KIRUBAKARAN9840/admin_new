"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import * as XLSX from "xlsx";

export default function RevenueAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("all");
  const [gymId, setGymId] = useState("");

  useEffect(() => {
    // Set default date range (last 30 days to today)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);

    // Fetch gyms list
    fetchGyms();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueAnalytics();
    }
  }, [startDate, endDate, source, gymId]);

  const fetchGyms = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/dashboard/overview");
      if (response.data.success && response.data.data.business) {
        // You might want to add a gyms list endpoint, for now using gym breakdown
        setGyms(response.data.data.business.gyms || []);
      }
    } catch (err) {
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      if (source !== "all") {
        params.source = source;
      }
      if (gymId) {
        params.gym_id = gymId;
      }

      const response = await axiosInstance.get("/api/admin/dashboard/revenue-analytics", {
        params,
      });

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch revenue analytics");
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleBack = () => {
    router.push("/portal/admin/home");
  };

  const handleExport = () => {
    if (!analyticsData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ["REVENUE ANALYTICS REPORT"],
      [""],
      ["Report Details"],
      ["Generated On", new Date().toLocaleString('en-IN')],
      [""],
      ["Filters Applied"],
      ["Start Date", formatDate(analyticsData.filters.startDate)],
      ["End Date", formatDate(analyticsData.filters.endDate)],
      ["Source", analyticsData.filters.source === "all" ? "All Sources" : (sourceLabels[analyticsData.filters.source] || analyticsData.filters.source)],
      ["Gym", analyticsData.filters.gymId === "all" ? "All Gyms" : analyticsData.filters.gymId],
      [""],
      ["Total Revenue"],
      ["Amount (INR)", analyticsData.totalRevenue],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Revenue by Source Sheet
    const sourceData = [
      ["Source", "Amount (INR)", "Percentage"],
      ...Object.entries(analyticsData.sourceSplitRupees).map(([key, value]) => [
        sourceLabels[key] || key,
        value,
        ((value / analyticsData.totalRevenue) * 100).toFixed(2) + "%"
      ])
    ];
    const sourceWs = XLSX.utils.aoa_to_sheet(sourceData);
    XLSX.utils.book_append_sheet(wb, sourceWs, "By Source");

    // Revenue Over Time Sheet
    if (analyticsData.revenueOverTime && analyticsData.revenueOverTime.length > 0) {
      const timeData = [
        ["Date", "Revenue (INR)"],
        ...analyticsData.revenueOverTime.map(item => [
          formatDate(item.date),
          item.revenue
        ])
      ];
      const timeWs = XLSX.utils.aoa_to_sheet(timeData);
      XLSX.utils.book_append_sheet(wb, timeWs, "Over Time");
    }

    // Revenue by Gym Sheet
    if (analyticsData.gymBreakdown && analyticsData.gymBreakdown.length > 0) {
      const gymData = [
        ["Gym ID", "Gym Name", "Revenue (INR)"],
        ...analyticsData.gymBreakdown.map(gym => [
          gym.gym_id,
          gym.gym_name,
          gym.revenue
        ])
      ];
      const gymWs = XLSX.utils.aoa_to_sheet(gymData);
      XLSX.utils.book_append_sheet(wb, gymWs, "By Gym");
    }

    // Generate and download Excel file
    const fileName = `revenue_analytics_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const sourceLabels = {
    daily_pass: "Daily Pass",
    sessions: "Sessions",
    fittbot_subscription: "Fymble Subscription",
    gym_membership: "Gym Membership"
  };

  const sourceColors = {
    daily_pass: "#ffffffff",
    sessions: "#4CAF50",
    fittbot_subscription: "#9C27B0",
    gym_membership: "#2196F3"
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#0f0f0f", minHeight: "100vh", color: "#ffffff" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={handleBack}
            style={{
              background: "transparent",
              border: "1px solid #FF5757",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "20px",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 87, 87, 0.1)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            ←
          </button>
          <h1 style={{ fontSize: "28px", fontWeight: "600", margin: 0 }}>Total Revenue Analytics</h1>
        </div>
        {!loading && analyticsData && (
          <button
            onClick={handleExport}
            style={{
              background: "#FF5757",
              border: "none",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#e64c4c"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#FF5757"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Excel
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #2a2a2a"
      }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
              }}
            >
              <option value="all">All Sources</option>
              <option value="daily_pass">Daily Pass</option>
              <option value="sessions">Sessions</option>
              <option value="fittbot_subscription">Fittbot Subscription</option>
              <option value="gym_membership">Gym Membership</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#aaa" }}>
              Gym
            </label>
            <select
              value={gymId}
              onChange={(e) => setGymId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
              }}
            >
              <option value="">All Gyms</option>
              {analyticsData?.gymBreakdown?.map((gym) => (
                <option key={gym.gym_id} value={gym.gym_id.toString()}>
                  {gym.gym_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #3a3a3a",
            borderTop: "3px solid #FF5757",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
        </div>
      ) : analyticsData ? (
        <div>
          {/* Total Revenue Card */}
          <div style={{
            backgroundColor: "#1a1a1a",
            padding: "30px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #2a2a2a",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "10px", margin: 0 }}>
              Total Revenue
            </p>
            <h2 style={{
              fontSize: "48px",
              fontWeight: "700",
              margin: "10px 0",
              color: "#ffffffff"
            }}>
              {formatCurrency(analyticsData.totalRevenue)}
            </h2>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "10px", margin: 0 }}>
              {formatDate(analyticsData.filters.startDate)} - {formatDate(analyticsData.filters.endDate)}
              {analyticsData.filters.source !== "all" && ` • ${sourceLabels[analyticsData.filters.source] || analyticsData.filters.source}`}
              {analyticsData.filters.gymId !== "all" && ` • Gym ${analyticsData.filters.gymId}`}
            </p>
          </div>

          {/* Source-wise Breakdown */}
          <div style={{
            backgroundColor: "#1a1a1a",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #2a2a2a"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
              Revenue by Source
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              {Object.entries(analyticsData.sourceSplitRupees).map(([key, value]) => (
                <div key={key} style={{
                  backgroundColor: "#2a2a2a",
                  padding: "12px 14px",
                  borderRadius: "6px",
                  border: `1px solid ${sourceColors[key] || "#888"}`
                }}>
                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
                    {sourceLabels[key] || key}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: sourceColors[key] || "#888" }}>
                    {formatCurrency(value)}
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "3px" }}>
                    {((value / analyticsData.totalRevenue) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            {/* Revenue Over Time Chart */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2a2a2a"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
                Revenue Over Time
              </h3>
              {analyticsData.revenueOverTime && analyticsData.revenueOverTime.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {analyticsData.revenueOverTime.map((item, index) => {
                      const maxRevenue = Math.max(...analyticsData.revenueOverTime.map(d => d.revenue));
                      const barWidth = (item.revenue / maxRevenue) * 100;

                      return (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ minWidth: "100px", fontSize: "12px", color: "#888" }}>
                            {formatDate(item.date)}
                          </div>
                          <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "4px", height: "24px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${barWidth}%`,
                                height: "100%",
                                backgroundColor: "#FFB32E",
                                transition: "width 0.3s ease"
                              }}
                            />
                          </div>
                          <div style={{ minWidth: "80px", textAlign: "right", fontSize: "13px", fontWeight: "500" }}>
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>No data available</p>
              )}
            </div>

            {/* Source-wise Split Chart - Pie Chart */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "28px",
              borderRadius: "12px",
              border: "1px solid #2a2a2a"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "28px" }}>
                Source Distribution
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                {/* Pie Chart */}
                <div style={{ position: "relative", width: "280px", height: "280px", flexShrink: 0 }}>
                  <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
                    {(() => {
                      const entries = Object.entries(analyticsData.sourceSplitRupees);
                      let currentAngle = 0;
                      const total = analyticsData.totalRevenue;

                      return entries.map(([key, value]) => {
                        const percentage = (value / total) * 100;
                        const angle = (value / total) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;

                        const x1 = 140 + 115 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 140 + 115 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 140 + 115 * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = 140 + 115 * Math.sin((endAngle * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const pathData = angle === 360
                          ? `M 140 140 m -115 0 a 115 115 0 1 0 230 0 a 115 115 0 1 0 -230 0`
                          : `M 140 140 L ${x1} ${y1} A 115 115 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        currentAngle += angle;

                        return (
                          <path
                            key={key}
                            d={pathData}
                            fill={sourceColors[key] || "#888"}
                            stroke="#1a1a1a"
                            strokeWidth="3"
                            style={{
                              transition: "transform 0.2s, opacity 0.2s",
                              cursor: "pointer",
                              transformOrigin: "140px 140px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.opacity = "0.85";
                              e.target.style.transform = "scale(1.03)";
                              setHoveredSlice({ key, value, percentage });
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.opacity = "1";
                              e.target.style.transform = "scale(1)";
                              setHoveredSlice(null);
                            }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  {/* Center donut hole */}
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    backgroundColor: "#1a1a1a",
                    pointerEvents: "none",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px"
                  }}>
                    {hoveredSlice ? (
                      <>
                        <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px", fontWeight: "500", textAlign: "center" }}>
                          {sourceLabels[hoveredSlice.key] || hoveredSlice.key}
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: sourceColors[hoveredSlice.key] || "#888", lineHeight: "1.2" }}>
                          {hoveredSlice.percentage.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                          {formatCurrency(hoveredSlice.value)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff", lineHeight: "1", letterSpacing: "1px" }}>
                          FYMBLE
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend with Total */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: "180px" }}>
                  {/* Total Display */}
                  <div style={{
                    padding: "16px 20px",
                    backgroundColor: "#2a2a2a",
                    borderRadius: "8px",
                    border: "1px solid #3a3a3a",
                    marginBottom: "16px"
                  }}>
                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Total Revenue
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff", lineHeight: "1" }}>
                      {formatCurrency(analyticsData.totalRevenue)}
                    </div>
                  </div>

                  {/* Legend Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Object.entries(analyticsData.sourceSplitRupees).map(([key, value]) => {
                      const percentage = (value / analyticsData.totalRevenue) * 100;

                      return (
                        <div key={key} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          backgroundColor: "#2a2a2a",
                          borderRadius: "6px",
                          border: "1px solid #3a3a3a",
                          transition: "border-color 0.2s"
                        }}>
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "3px",
                              backgroundColor: sourceColors[key] || "#888",
                              flexShrink: 0,
                              boxShadow: `0 2px 4px ${sourceColors[key]}40`
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", color: "#fff", fontWeight: "500", marginBottom: "1px" }}>
                              {sourceLabels[key] || key}
                            </div>
                            <div style={{ fontSize: "10px", color: "#888" }}>
                              {formatCurrency(value)}
                            </div>
                          </div>
                          <div style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: sourceColors[key] || "#888",
                            flexShrink: 0,
                            minWidth: "50px",
                            textAlign: "right"
                          }}>
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Line Chart */}
          {analyticsData.revenueOverTime && analyticsData.revenueOverTime.length > 0 && (
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #2a2a2a"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
                Revenue Trend
              </h3>
              <div style={{
                position: "relative",
                height: "350px",
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden"
              }}>
                <svg
                  width="100%"
                  height="100%"
                  style={{
                    overflow: "visible",
                    minWidth: `${Math.max(800, analyticsData.revenueOverTime.length * 80)}px`
                  }}
                >
                  {(() => {
                    const data = analyticsData.revenueOverTime;
                    const pointSpacing = 80;
                    const padding = { top: 20, right: 30, bottom: 60, left: 100 };
                    const chartWidth = Math.max(800, data.length * pointSpacing) - padding.left - padding.right;
                    const chartHeight = 350 - padding.top - padding.bottom;
                    const maxRevenue = Math.max(...data.map(d => d.revenue));

                    // Create scales
                    const xScale = (index) => padding.left + index * pointSpacing;
                    const yScale = (revenue) => padding.top + chartHeight - ((revenue - 0) / (maxRevenue - 0 || 1)) * chartHeight;

                    // Create points for line
                    const linePoints = data.map((d, i) => `${xScale(i)},${yScale(d.revenue)}`).join(" ");

                    // Create area fill points
                    const areaPoints = `${xScale(0)},${padding.top + chartHeight} ${linePoints} ${xScale(data.length - 1)},${padding.top + chartHeight}`;

                    return (
                      <>
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((percent) => {
                          const y = padding.top + chartHeight - (percent / 100) * chartHeight;
                          const revenueValue = (maxRevenue * percent) / 100;
                          return (
                            <g key={percent}>
                              <line
                                x1={padding.left}
                                y1={y}
                                x2={padding.left + Math.max(chartWidth, data.length * pointSpacing)}
                                y2={y}
                                stroke="#2a2a2a"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                              />
                              <text
                                x={padding.left - 10}
                                y={y + 4}
                                fill="#888"
                                fontSize="12"
                                textAnchor="end"
                                fontWeight="500"
                              >
                                {formatCurrency(revenueValue)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Area fill under line */}
                        <polygon
                          points={areaPoints}
                          fill="url(#gradient)"
                          opacity="0.3"
                        />

                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FF5757" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#FF5757" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Line */}
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="#FF5757"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ filter: "drop-shadow(0 4px 8px rgba(255, 87, 87, 0.3))" }}
                        />

                        {/* Data points and labels */}
                        {data.map((d, i) => {
                          const x = xScale(i);
                          const y = yScale(d.revenue);

                          return (
                            <g key={i}>
                              {/* Vertical line on hover effect area */}
                              <line
                                x1={x}
                                y1={padding.top}
                                x2={x}
                                y2={padding.top + chartHeight}
                                stroke="#FF5757"
                                strokeWidth="1"
                                opacity="0.1"
                              />

                              {/* Data point circle */}
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#FF5757"
                                stroke="#1a1a1a"
                                strokeWidth="2"
                                style={{
                                  cursor: "pointer",
                                  transition: "r 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.setAttribute("r", "9")}
                                onMouseLeave={(e) => e.target.setAttribute("r", "6")}
                              />

                              {/* Date labels on x-axis */}
                              <text
                                x={x}
                                y={padding.top + chartHeight + 20}
                                fill="#aaa"
                                fontSize="11"
                                fontWeight="500"
                                textAnchor="middle"
                              >
                                {formatDate(d.date)}
                              </text>

                              {/* Revenue value above point */}
                              <text
                                x={x}
                                y={y - 12}
                                fill="#ffffff"
                                fontSize="12"
                                fontWeight="700"
                                textAnchor="middle"
                              >
                                {formatCurrency(d.revenue)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Y-axis line */}
                        <line
                          x1={padding.left}
                          y1={padding.top}
                          x2={padding.left}
                          y2={padding.top + chartHeight}
                          stroke="#3a3a3a"
                          strokeWidth="2"
                        />

                        {/* X-axis line */}
                        <line
                          x1={padding.left}
                          y1={padding.top + chartHeight}
                          x2={padding.left + Math.max(chartWidth, data.length * pointSpacing)}
                          y2={padding.top + chartHeight}
                          stroke="#3a3a3a"
                          strokeWidth="2"
                        />
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Gym-wise Breakdown */}
          {analyticsData.gymBreakdown && analyticsData.gymBreakdown.length > 0 && (
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #2a2a2a"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
                Revenue by Gym
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {analyticsData.gymBreakdown.slice(0, 20).map((gym) => (
                  <div key={gym.gym_id} style={{
                    backgroundColor: "#2a2a2a",
                    padding: "16px",
                    borderRadius: "8px",
                  }}>
                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
                      {gym.gym_name}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                      {formatCurrency(gym.revenue)}
                    </div>
                  </div>
                ))}
              </div>
              {analyticsData.gymBreakdown.length > 20 && (
                <p style={{ fontSize: "13px", color: "#888", marginTop: "16px", textAlign: "center" }}>
                  Showing top 20 gyms out of {analyticsData.gymBreakdown.length}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>No data available</p>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
