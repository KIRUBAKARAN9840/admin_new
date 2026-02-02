"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { FaArrowLeft, FaPhone, FaBuilding } from "react-icons/fa";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "follow_up", label: "Follow Up" },
  { key: "converted", label: "Converted" },
  { key: "rejected", label: "Rejected" },
  { key: "no_response", label: "No Response" },
  { key: "out_of_service", label: "Out of Service" },
];

const TAB_COLORS = {
  pending: "#f59e0b",
  follow_up: "#3b82f6",
  converted: "#10b981",
  rejected: "#ef4444",
  no_response: "#8b5cf6",
  out_of_service: "#6b7280",
};

export default function TelecallerDetails() {
  const router = useRouter();
  const params = useParams();
  const managerId = params.id;
  const telecallerId = params.telecallerId;

  const [loading, setLoading] = useState(true);
  const [telecaller, setTelecaller] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGyms, setFilteredGyms] = useState([]);

  const fetchTelecallerDetails = useCallback(async (status) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/admin/telecaller-managers/${managerId}/telecallers/${telecallerId}/details`,
        { params: status ? { status } : {} }
      );

      if (response.data.success) {
        setTelecaller(response.data.data.telecaller);
        setGyms(response.data.data.gyms || []);
        setFilteredGyms(response.data.data.gyms || []);
        setCounts(response.data.data.counts || {});
      } else {
        console.error("Failed to fetch telecaller details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching telecaller details:", error);
    } finally {
      setLoading(false);
    }
  }, [managerId, telecallerId]);

  useEffect(() => {
    if (telecallerId) {
      fetchTelecallerDetails(activeTab);
    }
  }, [telecallerId, activeTab, fetchTelecallerDetails]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = gyms.filter((gym) => {
        const gymDetails = gym.gym_details || {};
        return (
          gymDetails.gym_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gymDetails.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gymDetails.contact_phone?.includes(searchTerm) ||
          gymDetails.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gymDetails.city?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredGyms(filtered);
    } else {
      setFilteredGyms(gyms);
    }
  }, [searchTerm, gyms]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        {/* Header with Back Button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px"
        }}>
          <button
            onClick={() => router.push(`/portal/admin/telecaller-managers/${managerId}`)}
            style={{
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "8px",
              padding: "10px 16px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3a3a"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#2a2a2a"}
          >
            <FaArrowLeft size={14} />
            Back
          </button>
          <div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#fff",
              margin: "0",
            }}>
              {telecaller?.name || "Telecaller"}&apos;s Gyms
            </h1>
            <p style={{
              color: "#888",
              fontSize: "14px",
              margin: "4px 0 0 0",
            }}>
              Viewing assigned gyms and their call status
            </p>
          </div>
        </div>

        {/* Telecaller Info Card */}
        {telecaller && (
          <div style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div>
              <div style={{ color: "#888", fontSize: "14px", marginBottom: "4px" }}>
                Telecaller Name
              </div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>
                {telecaller.name}
              </div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: "14px", marginBottom: "4px" }}>
                Mobile Number
              </div>
              <div style={{
                fontSize: "16px",
                color: "#ccc",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <FaPhone style={{ color: "#FF5757", fontSize: "14px" }} />
                {telecaller.mobile_number}
              </div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: "14px", marginBottom: "4px" }}>
                Total Gyms
              </div>
              <div style={{ fontSize: "32px", fontWeight: "600", color: "#FF5757" }}>
                {Object.values(counts).reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          borderBottom: "1px solid #333",
          paddingBottom: "0"
        }}>
          {TABS.map((tab) => {
            const count = counts[tab.key] || 0;
            const isActive = activeTab === tab.key;
            const color = TAB_COLORS[tab.key];

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: isActive ? "rgba(255, 87, 87, 0.1)" : "transparent",
                  border: "none",
                  borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
                  borderRadius: "8px 8px 0 0",
                  color: isActive ? color : "#888",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "400",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  marginBottom: isActive ? "-1px" : "0",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "#2a2a2a";
                    e.target.style.color = "#ccc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#888";
                  }
                }}
              >
                {tab.label}
                <span style={{
                  backgroundColor: isActive ? `${color}33` : "#333",
                  color: isActive ? color : "#666",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div style={{
            position: "relative",
            flex: 1,
            minWidth: "300px",
            maxWidth: "500px"
          }}>
            <FaBuilding
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888"
              }}
            />
            <input
              type="text"
              placeholder="Search by gym name, contact person, phone, area, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px 12px 45px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: "40px",
          }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid #3a3a3a",
                  borderTop: `4px solid ${TAB_COLORS[activeTab]}`,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p style={{ fontSize: "14px", color: "#ccc" }}>
                Loading gyms...
              </p>
            </div>
          </div>
        ) : (
          /* Table */
          <div style={{
            backgroundColor: "#1e1e1e",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #333"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{
                    backgroundColor: "#2a2a2a",
                    borderBottom: "1px solid #333"
                  }}>
                    <th style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      maxWidth: "250px",
                      width: "250px"
                    }}>
                      Gym Name
                    </th>
                    <th style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Phone
                    </th>
                    <th style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Location
                    </th>
                    <th style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Last Call
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGyms.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "#888"
                      }}>
                        <div style={{ marginBottom: "16px" }}>
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ opacity: 0.3 }}
                          >
                            <path
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                              fill="#888"
                            />
                          </svg>
                        </div>
                        <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                          {searchTerm ? "No gyms found" : `No gyms in ${TABS.find(t => t.key === activeTab)?.label}`}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Gyms will appear here once assigned"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredGyms.map((gym, index) => {
                      const gymDetails = gym.gym_details || {};
                      const statusColor = TAB_COLORS[gym.call_status] || "#888";

                      return (
                        <tr
                          key={gym.log_id || gym.gym_id}
                          style={{
                            borderBottom: index !== filteredGyms.length - 1 ? "1px solid #333" : "none",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a2a2a"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={{ padding: "16px", color: "#fff", fontWeight: "500", maxWidth: "250px", wordBreak: "break-word" }}>
                            {gymDetails.gym_name || "N/A"}
                          </td>
                          <td style={{ padding: "16px", color: "#ccc" }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <FaPhone style={{ color: "#FF5757", fontSize: "12px" }} />
                              {gymDetails.contact_phone || "N/A"}
                            </div>
                          </td>
                          <td style={{ padding: "16px", color: "#888", fontSize: "14px" }}>
                            <div>
                              <div>{gymDetails.area || "N/A"}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {gymDetails.city || "N/A"}, {gymDetails.state || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              backgroundColor: `${statusColor}22`,
                              color: statusColor,
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                              textTransform: "capitalize"
                            }}>
                              {gym.call_status?.replace(/_/g, " ") || "Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "16px", color: "#888", fontSize: "14px" }}>
                            {gym.created_at
                              ? new Date(gym.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Never"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
