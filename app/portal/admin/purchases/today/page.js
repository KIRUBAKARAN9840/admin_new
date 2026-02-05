"use client";

export default function TodaySchedule() {
  return (
    <>
      {/* Empty State */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          backgroundColor: "#1a1a1a",
          borderRadius: "12px",
          border: "1px solid #333",
        }}
      >
        <p style={{ fontSize: "18px", color: "#888" }}>
          No schedule data available yet.
        </p>
      </div>
    </>
  );
}
