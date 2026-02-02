"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { FaSearch, FaPhone, FaChevronRight } from "react-icons/fa";

export default function TelecallerManagers() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredManagers, setFilteredManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    // Filter managers based on search term
    if (searchTerm) {
      const filtered = managers.filter((manager) =>
        manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.mobile_number.includes(searchTerm)
      );
      setFilteredManagers(filtered);
    } else {
      setFilteredManagers(managers);
    }
  }, [searchTerm, managers]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/telecaller-managers/list");

      if (response.data.success) {
        setManagers(response.data.data.managers || []);
        setFilteredManagers(response.data.data.managers || []);
      } else {
        console.error("Failed to fetch managers:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        {/* Stats Summary */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          <div style={{
            backgroundColor: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "200px",
            flex: 1,
          }}>
            <div style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
              Total Managers
            </div>
            <div style={{ fontSize: "32px", fontWeight: "600", color: "#fff" }}>
              {managers.length}
            </div>
          </div>
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
            <FaSearch
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
              placeholder="Search by name or mobile number..."
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
                  borderTop: "4px solid #FF5757",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p style={{ fontSize: "14px", color: "#ccc" }}>
                Loading managers...
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
                      letterSpacing: "0.5px"
                    }}>
                      Name
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
                      Mobile Number
                    </th>
                    <th style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ccc",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Team Count
                    </th>
                    <th style={{ width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{
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
                          {searchTerm ? "No managers found" : "No managers found"}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Managers will appear here"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.id}
                        style={{
                          borderBottom: index !== filteredManagers.length - 1 ? "1px solid #333" : "none",
                          transition: "background-color 0.2s",
                          cursor: "pointer",
                        }}
                        onClick={() => router.push(`/portal/admin/telecaller-managers/${manager.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2a2a2a"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "16px", color: "#ccc" }}>
                          {manager.name}
                        </td>
                        <td style={{ padding: "16px", color: "#ccc" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            <FaPhone style={{ color: "#FF5757", fontSize: "12px" }} />
                            {manager.mobile_number}
                          </div>
                        </td>
                        <td style={{
                          padding: "16px",
                          textAlign: "center",
                          color: "#ccc"
                        }}>
                          <span style={{
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                            color: "#f59e0b",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}>
                            {manager.team_count || 0}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <FaChevronRight style={{ color: "#666", fontSize: "12px" }} />
                        </td>
                      </tr>
                    ))
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
