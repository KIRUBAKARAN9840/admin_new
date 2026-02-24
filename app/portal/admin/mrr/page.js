"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function MRR() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mrrData, setMrrData] = useState({
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
    arr: 0,
  });
  const [error, setError] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchMRRData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/mrr/data");

      if (response.data.success) {
        setMrrData({
          currentMonthRevenue: response.data.data.currentMonthRevenue,
          previousMonthRevenue: response.data.data.previousMonthRevenue,
          arr: response.data.data.arr,
        });
      } else {
        throw new Error(response.data.message || "Failed to load MRR data");
      }
    } catch (err) {
      console.error("Error fetching MRR data:", err);
      setError("Failed to load MRR data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMRRData();
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
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
            <span style={{ color: "#FF5757" }}>MRR</span> Dashboard
          </h3>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "12px 20px",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

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
            {/* Current Month Revenue Card */}
            <div className="col-xl-4 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Current Month Revenue</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700" }}>
                    {formatCurrency(mrrData.currentMonthRevenue)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Revenue for this month
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Month Revenue Card */}
            <div className="col-xl-4 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">Previous Month Revenue</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700" }}>
                    {formatCurrency(mrrData.previousMonthRevenue)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Revenue for last month
                  </div>
                </div>
              </div>
            </div>

            {/* ARR Card */}
            <div className="col-xl-4 col-lg-6">
              <div className="dashboard-card">
                <div className="card-header-custom extra-space">
                  <h6 className="card-title">ARR</h6>
                </div>
                <div className="card-body-custom">
                  <div className="metric-number" style={{ fontSize: "32px", fontWeight: "700", color: "#FF5757" }}>
                    {formatCurrency(mrrData.arr)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
                    Annual Recurring Revenue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
