"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function PurchasesLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (pathname.includes("/today")) {
      setActiveTab("today");
    } else {
      setActiveTab("all");
    }
  }, [pathname]);

  const tabs = [
    { id: "all", name: "All Purchases", path: "/portal/admin/purchases/all" },
    { id: "today", name: "Today's Schedule", path: "/portal/admin/purchases/today" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        {/* Header */}
        <h3 className="section-heading mb-4">
          <span style={{ color: "#FF5757" }}>Purchases</span>
        </h3>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            borderBottom: "2px solid #333",
            marginBottom: "2rem",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              style={{
                padding: "12px 24px",
                background: "transparent",
                border: "none",
                color: activeTab === tab.id ? "#FF5757" : "#888",
                fontSize: "16px",
                fontWeight: activeTab === tab.id ? "600" : "400",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #FF5757" : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = "#aaa";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = "#888";
                }
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area - Child routes will be rendered here */}
        {children}
      </div>
    </div>
  );
}
