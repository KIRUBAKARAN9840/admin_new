"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function CashFlowPage() {
  const [loading, setLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [error, setError] = useState(null);

  // Opening Balance States
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [financialYear, setFinancialYear] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState("");
  const [savingOpeningBalance, setSavingOpeningBalance] = useState(false);
  const [editingOpeningBalance, setEditingOpeningBalance] = useState(null); // Track if editing an existing balance

  // Generate financial years (current year - 5 to current year + 1)
  const currentYear = new Date().getFullYear();
  const financialYears = [];
  for (let i = 5; i >= 0; i--) {
    const startYear = currentYear - i;
    const endYear = startYear + 1;
    financialYears.push(`${startYear}-${endYear}`);
  }

  const fetchCashFlowData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/admin/cash-flow/overview");
      if (response.data && response.data.success) {
        setCashFlowData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch cash flow data");
      }
    } catch (err) {
      console.error("Error fetching cash flow data:", err);
      setError(err.response?.data?.detail || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowData();
  }, []);

  const handleSaveOpeningBalance = async () => {
    if (!financialYear || !openingBalanceAmount) {
      alert("Please fill all fields");
      return;
    }

    setSavingOpeningBalance(true);
    try {
      const response = await axiosInstance.post("/api/admin/cash-flow/opening-balance", {
        financial_year: financialYear,
        amount: parseFloat(openingBalanceAmount)
      });

      if (response.data && response.data.success) {
        alert(response.data.message);
        handleCloseModal();
        fetchCashFlowData(); // Refresh overview data to get updated opening balances
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save opening balance");
    } finally {
      setSavingOpeningBalance(false);
    }
  };

  const handleEditOpeningBalance = (ob) => {
    setEditingOpeningBalance(ob);
    setFinancialYear(ob.financial_year);
    setOpeningBalanceAmount(ob.amount.toString());
    setShowOpeningBalanceModal(true);
  };

  const handleCloseModal = () => {
    setShowOpeningBalanceModal(false);
    setEditingOpeningBalance(null);
    setFinancialYear("");
    setOpeningBalanceAmount("");
  };

  const handleDeleteOpeningBalance = async (fy) => {
    if (!confirm(`Are you sure you want to delete opening balance for ${fy}?`)) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/admin/cash-flow/opening-balance/${fy}`);
      if (response.data && response.data.success) {
        alert(response.data.message);
        fetchCashFlowData(); // Refresh overview data to get updated opening balances
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete opening balance");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="dashboard-container">
      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}>
          <div style={{ color: "#888" }}>Loading...</div>
        </div>
      ) : error ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}>
          <div style={{ color: "#ef4444", textAlign: "center" }}>
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>Error</div>
            <div style={{ fontSize: "14px", color: "#888" }}>{error}</div>
            <button
              onClick={fetchCashFlowData}
              style={{
                marginTop: "15px",
                padding: "8px 16px",
                backgroundColor: "#FF5757",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="section-container">
          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "600", color: "white", margin: "0" }}>
                Cash Flow
              </h2>
              <p style={{ fontSize: "14px", color: "#9ca3af", margin: "4px 0 0 0" }}>
                Track cash outflows and payments
              </p>
            </div>
            <button
              onClick={() => setShowOpeningBalanceModal(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#FF5757",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e04848"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#FF5757"}
            >
              + Opening Balance
            </button>
          </div>

          {/* Opening Balance List */}
          {cashFlowData?.opening_balances && cashFlowData.opening_balances.length > 0 && (
            <div className="dashboard-card" style={{ marginBottom: "20px" }}>
              <div className="card-header-custom">
                <h6 className="card-title">Opening Balances</h6>
              </div>
              <div className="card-body-custom">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {cashFlowData.opening_balances.map((ob) => (
                    <div
                      key={ob.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        backgroundColor: "#1e1e1e",
                        borderRadius: "6px",
                        border: "1px solid #374151"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                          {ob.financial_year}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>
                          {formatCurrency(ob.amount)}
                        </div>
                        <button
                          onClick={() => handleEditOpeningBalance(ob)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOpeningBalance(ob.financial_year)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Last Month Outflow Card */}
          <div className="dashboard-card">
            <div className="card-header-custom">
              <h6 className="card-title">Last Month Outflow</h6>
              {cashFlowData?.month && (
                <div style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  backgroundColor: "#1f2937",
                  padding: "4px 10px",
                  borderRadius: "4px"
                }}>
                  {cashFlowData.month.month_name}
                </div>
              )}
            </div>
            <div className="card-body-custom">
              {/* Total Outflow */}
              <div style={{
                textAlign: "center",
                padding: "30px 20px",
                backgroundColor: "#1f2937",
                borderRadius: "8px",
                marginBottom: "20px"
              }}>
                <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "8px" }}>
                  Total Outflow
                </div>
                <div style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#ef4444"
                }}>
                  {formatCurrency(cashFlowData?.outflow?.total_outflow)}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                  {cashFlowData?.month && (
                    <span>{cashFlowData.month.start_date} to {cashFlowData.month.end_date}</span>
                  )}
                </div>
              </div>

              {/* Outflow Breakdown */}
              <div>
                <div style={{
                  fontSize: "14px",
                  color: "#fff",
                  marginBottom: "15px",
                  fontWeight: "600"
                }}>
                  Outflow Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Gym Payout */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    border: "1px solid #374151"
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                        Gym Payout
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                        Payments to gyms (after deductions)
                      </div>
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#4ade80"
                    }}>
                      {formatCurrency(cashFlowData?.outflow?.gym_payout)}
                    </div>
                  </div>

                  {/* GST Payable */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    border: "1px solid #374151"
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                        GST Payable
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                        Goods & Services Tax liability
                      </div>
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#3b82f6"
                    }}>
                      {formatCurrency(cashFlowData?.outflow?.gst_payable)}
                    </div>
                  </div>

                  {/* TDS Payable */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    border: "1px solid #374151"
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                        TDS Payable
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                        Tax Deducted at Source liability
                      </div>
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#f59e0b"
                    }}>
                      {formatCurrency(cashFlowData?.outflow?.tds_payable)}
                    </div>
                  </div>

                  {/* Expenses */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    border: "1px solid #374151"
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
                        Expenses
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                        Operational & Marketing expenses
                      </div>
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#8b5cf6"
                    }}>
                      {formatCurrency(cashFlowData?.outflow?.expenses)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {cashFlowData?.breakdown && (
                <div style={{ marginTop: "25px" }}>
                  <div style={{
                    fontSize: "14px",
                    color: "#fff",
                    marginBottom: "15px",
                    fontWeight: "600"
                  }}>
                    Detailed Breakdown by Revenue Source
                  </div>

                  {/* Note explaining outflow calculation */}
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#1f2937",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#9ca3af"
                  }}>
                    <strong style={{ color: "#fff" }}>Outflow = </strong> Gym Payout + GST Payable + TDS Payable + Expenses
                    <br />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Note: PG charges & commission are deducted before payout (retained by platform)</span>
                  </div>

                  {/* Membership */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    marginBottom: "12px"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      color: "#FF5757",
                      fontWeight: "600",
                      marginBottom: "12px"
                    }}>
                      Gym Membership
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Revenue:</span>
                        <span style={{ fontSize: "12px", color: "#fff" }}>
                          {formatCurrency(cashFlowData.breakdown.membership?.revenue)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#4ade80" }}>Payout (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.membership?.payout)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>PG Charges (deducted):</span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatCurrency(cashFlowData.breakdown.membership?.pg_charges)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#f59e0b" }}>TDS (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.membership?.tds)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>GST on Comm (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                          {formatCurrency(cashFlowData.breakdown.membership?.gst_on_commission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Pass */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    marginBottom: "12px"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      color: "#22c55e",
                      fontWeight: "600",
                      marginBottom: "12px"
                    }}>
                      Daily Pass
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Revenue:</span>
                        <span style={{ fontSize: "12px", color: "#fff" }}>
                          {formatCurrency(cashFlowData.breakdown.daily_pass?.revenue)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#4ade80" }}>Payout (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.daily_pass?.payout)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>PG Charges (deducted):</span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatCurrency(cashFlowData.breakdown.daily_pass?.pg_charges)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#f59e0b" }}>TDS (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.daily_pass?.tds)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>GST on Comm (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                          {formatCurrency(cashFlowData.breakdown.daily_pass?.gst_on_commission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px",
                    marginBottom: "12px"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      color: "#a855f7",
                      fontWeight: "600",
                      marginBottom: "12px"
                    }}>
                      Sessions
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Revenue:</span>
                        <span style={{ fontSize: "12px", color: "#fff" }}>
                          {formatCurrency(cashFlowData.breakdown.sessions?.revenue)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#4ade80" }}>Payout (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.sessions?.payout)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>PG Charges (deducted):</span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatCurrency(cashFlowData.breakdown.sessions?.pg_charges)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#f59e0b" }}>TDS (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData.breakdown.sessions?.tds)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>GST on Comm (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                          {formatCurrency(cashFlowData.breakdown.sessions?.gst_on_commission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fymble Subscription */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "6px"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      color: "#f472b6",
                      fontWeight: "600",
                      marginBottom: "12px"
                    }}>
                      Fymble Subscription
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Revenue:</span>
                        <span style={{ fontSize: "12px", color: "#fff" }}>
                          {formatCurrency(cashFlowData.breakdown.fittbot_subscription?.revenue)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>GST on Revenue (→ Outflow):</span>
                        <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                          {formatCurrency(cashFlowData.breakdown.fittbot_subscription?.gst_on_revenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outflow Summary */}
                  <div style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "#1f2937",
                    borderRadius: "6px",
                    border: "1px solid #374151"
                  }}>
                    <div style={{
                      fontSize: "13px",
                      color: "#fff",
                      fontWeight: "600",
                      marginBottom: "12px"
                    }}>
                      Outflow Summary (Cross-check)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#9ca3af" }}>Total Gym Payout:</span>
                        <span style={{ color: "#4ade80", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData?.outflow?.gym_payout)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#9ca3af" }}>Total GST Payable:</span>
                        <span style={{ color: "#3b82f6", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData?.outflow?.gst_payable)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#9ca3af" }}>Total TDS Payable:</span>
                        <span style={{ color: "#f59e0b", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData?.outflow?.tds_payable)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#9ca3af" }}>Total Expenses:</span>
                        <span style={{ color: "#8b5cf6", fontWeight: "500" }}>
                          {formatCurrency(cashFlowData?.outflow?.expenses)}
                        </span>
                      </div>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "14px",
                        fontWeight: "600",
                        paddingTop: "8px",
                        borderTop: "1px solid #374151",
                        marginTop: "4px"
                      }}>
                        <span style={{ color: "#fff" }}>Total Outflow:</span>
                        <span style={{ color: "#ef4444" }}>
                          {formatCurrency(cashFlowData?.outflow?.total_outflow)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opening Balance Modal */}
      {showOpeningBalanceModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#1f2937",
            borderRadius: "12px",
            padding: "24px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #374151"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white", margin: 0 }}>
                {editingOpeningBalance ? "Edit Opening Balance" : "Add Opening Balance"}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  lineHeight: "1"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Financial Year Dropdown */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  Financial Year *
                </label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  disabled={!!editingOpeningBalance}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: editingOpeningBalance ? "#374151" : "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: editingOpeningBalance ? "#9ca3af" : "white",
                    fontSize: "14px",
                    cursor: editingOpeningBalance ? "not-allowed" : "pointer"
                  }}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      {fy}
                    </option>
                  ))}
                </select>
                {editingOpeningBalance && (
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                    Financial year cannot be changed when editing
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={openingBalanceAmount}
                  onChange={(e) => setOpeningBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={handleCloseModal}
                  disabled={savingOpeningBalance}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: savingOpeningBalance ? "not-allowed" : "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOpeningBalance}
                  disabled={savingOpeningBalance}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#FF5757",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: savingOpeningBalance ? "not-allowed" : "pointer",
                    opacity: savingOpeningBalance ? 0.6 : 1
                  }}
                >
                  {savingOpeningBalance ? "Saving..." : (editingOpeningBalance ? "Update" : "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
