"use client";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Completed() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dummy data for completed sessions
  const dummySessionData = {
    "2025-12-15": [
      {
        id: 1,
        slot: "10:00 - 10:30 AM",
        client_name: "Aarav Sharma",
        duration: "25:28 min",
        status: "Completed",
        age: 28,
        goal: "Weight Loss",
        current_weight: 85,
        target_weight: 75,
        activity_level: "Highly Active",
        customer_feedback:
          "Session was incredibly calming and rejuvenating. The guide was very attentive and ensured everyone was comfortable throughout. I felt relaxed, refreshed, and more focused after the session. The relaxed ambience and structured exercises made the overall experience delightful. Highly recommend attending future sessions for continued wellness.",
        nutritionist_feedback:
          "Great progress! Continue with the current meal plan and increase protein intake slightly.",
        video_link: "https://example.com/video1",
      },
      {
        id: 2,
        slot: "11:00 - 11:30 AM",
        client_name: "Meera Kapoor",
        duration: "28:15 min",
        status: "Completed",
        age: 32,
        goal: "Muscle Gain",
        current_weight: 62,
        target_weight: 68,
        activity_level: "Highly Active",
        customer_feedback:
          "Excellent session! Very informative and helpful. The nutritionist provided clear guidance.",
        nutritionist_feedback:
          "Patient is following the diet plan well. Suggested adding more complex carbs post-workout.",
        video_link: "https://example.com/video2",
      },
    ],
    "2025-12-14": [
      {
        id: 3,
        slot: "02:00 - 02:30 PM",
        client_name: "Rohan Verma",
        duration: "30:45 min",
        status: "Completed",
        age: 25,
        goal: "Maintain Weight",
        current_weight: 70,
        target_weight: 70,
        activity_level: "Moderately Active",
        customer_feedback:
          "Very professional and knowledgeable. Answered all my questions patiently.",
        nutritionist_feedback:
          "Good adherence to plan. Continue current routine and stay hydrated.",
        video_link: "https://example.com/video3",
      },
    ],
    "2025-12-13": [
      {
        id: 4,
        slot: "09:00 - 09:30 AM",
        client_name: "Priya Singh",
        duration: "27:30 min",
        status: "Completed",
        age: 30,
        goal: "Weight Loss",
        current_weight: 78,
        target_weight: 65,
        activity_level: "Moderately Active",
        customer_feedback:
          "The session was helpful. Got good tips on portion control and meal timing.",
        nutritionist_feedback:
          "Showing good progress. Recommended reducing dinner carbs and adding more vegetables.",
        video_link: "https://example.com/video4",
      },
      {
        id: 5,
        slot: "11:45 - 12:15 PM",
        client_name: "Sanya Joshi",
        duration: "29:10 min",
        status: "Completed",
        age: 26,
        goal: "Weight Loss",
        current_weight: 72,
        target_weight: 60,
        activity_level: "Lightly Active",
        customer_feedback:
          "Really appreciated the personalized approach. Looking forward to the next session.",
        nutritionist_feedback:
          "Client needs to increase water intake. Discussed strategies for emotional eating.",
        video_link: "https://example.com/video5",
      },
    ],
  };

  // Generate 30 days from today (going backwards for completed sessions)
  const generateCalendarDates = () => {
    const allDates = [];
    const startDate = new Date(today);

    // Go back 30 days from today
    for (let i = 29; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i);
      allDates.push(date);
    }

    // Group by month
    const datesByMonth = {};
    allDates.forEach((date) => {
      const monthKey = `${date.getMonth()}-${date.getFullYear()}`;
      if (!datesByMonth[monthKey]) {
        datesByMonth[monthKey] = {
          month: date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          dates: [],
        };
      }
      datesByMonth[monthKey].dates.push(date);
    });

    return Object.values(datesByMonth);
  };

  const monthsData = generateCalendarDates();

  const getSessionsForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return dummySessionData[formattedDate] || [];
  };

  const getSessionCount = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const sessions = dummySessionData[formattedDate];
    return sessions ? sessions.length : 0;
  };

  useEffect(() => {
    if (selectedDate) {
      const sessionData = getSessionsForDate(selectedDate);
      setSessions(sessionData);
    }
  }, [selectedDate]);

  const handleDateClick = (date) => {
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      setSelectedDate(null);
      setSessions([]);
    } else {
      setSelectedDate(date);
    }
    setExpandedRow(null);
  };

  const isSelected = (date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  };

  const renderMonth = (monthData) => {
    const dates = monthData.dates;
    const weeks = [];
    let currentWeek = [];

    // Add empty slots for the first week
    const firstDay = dates[0].getDay();
    const emptySlots = firstDay;

    for (let i = 0; i < emptySlots; i++) {
      currentWeek.push(null);
    }

    dates.forEach((date) => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Add remaining dates
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return (
      <div key={monthData.month} style={{ marginBottom: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              margin: 0,
            }}
          >
            {monthData.month}
          </h3>
        </div>

        {/* Week day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#999",
                  textTransform: "uppercase",
                }}
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "10px",
              }}
            >
              {week.map((date, dateIndex) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${dateIndex}`}
                      style={{
                        minHeight: "70px",
                      }}
                    />
                  );
                }

                const selected = isSelected(date);
                const isToday = date.toDateString() === today.toDateString();
                const count = getSessionCount(date);
                const isFuture = date > today;

                return (
                  <div
                    key={dateIndex}
                    onClick={() => !isFuture && handleDateClick(date)}
                    style={{
                      background: selected
                        ? "#FF5757"
                        : isToday
                        ? "#2a2a2a"
                        : "#252525",
                      border:
                        isToday && !selected
                          ? "2px solid #FF5757"
                          : "1px solid #333",
                      borderRadius: "8px",
                      padding: "12px 8px",
                      textAlign: "center",
                      cursor: isFuture ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      minHeight: "70px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isFuture ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!selected && !isFuture) {
                        e.currentTarget.style.background = "#2a2a2a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected && !isFuture) {
                        e.currentTarget.style.background = isToday
                          ? "#2a2a2a"
                          : "#252525";
                      }
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        color: selected
                          ? "white"
                          : isToday
                          ? "#FF5757"
                          : "#ccc",
                        fontWeight: "600",
                        marginBottom: count > 0 ? "4px" : "0",
                      }}
                    >
                      {date.getDate()}
                    </div>
                    {count > 0 && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: selected ? "white" : "#FF5757",
                          fontWeight: "600",
                        }}
                      >
                        {count} session{count > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2 className="users-title">
          <span style={{ color: "#FF5757" }}>Completed</span> Sessions
        </h2>
      </div>

      {/* Calendar */}
      <div
        style={{
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {monthsData.map((monthData) => renderMonth(monthData))}
      </div>

      {/* Sessions Table */}
      {selectedDate && (
        <div className="table-container">
          <h3
            style={{
              color: "white",
              marginBottom: "1rem",
              fontSize: "16px",
              padding: "10px",
            }}
          >
            Completed Sessions for {formatDate(selectedDate)}
          </h3>
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Slot</th>
                  <th>Client Name</th>
                  <th>Duration</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th>Video link</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <>
                      <tr
                        key={session.id}
                        onClick={() =>
                          setExpandedRow(expandedRow === index ? null : index)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{index + 1}</td>
                        <td>{session.slot}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#00C853",
                              }}
                            />
                            {session.client_name}
                          </div>
                        </td>
                        <td>{session.duration}</td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFeedback(session.nutritionist_feedback);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#2196F3",
                              cursor: "pointer",
                              fontSize: "13px",
                              textDecoration: "underline",
                            }}
                          >
                            View Feedback
                          </button>
                        </td>
                        <td>
                          <span
                            style={{
                              color: "#4CAF50",
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <a
                            href={session.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              color: "#2196F3",
                              textDecoration: "underline",
                              fontSize: "13px",
                            }}
                          >
                            View Video
                          </a>
                        </td>
                        <td>
                          {expandedRow === index ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr>
                          <td colSpan="8">
                            <div
                              style={{
                                background: "#252525",
                                padding: "1rem",
                                borderRadius: "4px",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(5, 1fr)",
                                  gap: "1rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#999",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Age
                                  </div>
                                  <div
                                    style={{ fontSize: "14px", color: "#ccc" }}
                                  >
                                    {session.age}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#999",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Goal
                                  </div>
                                  <div
                                    style={{ fontSize: "14px", color: "#ccc" }}
                                  >
                                    {session.goal}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#999",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Current Weight
                                  </div>
                                  <div
                                    style={{ fontSize: "14px", color: "#ccc" }}
                                  >
                                    {session.current_weight
                                      ? `${session.current_weight} Kgs`
                                      : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#999",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Target Weight
                                  </div>
                                  <div
                                    style={{ fontSize: "14px", color: "#ccc" }}
                                  >
                                    {session.target_weight
                                      ? `${session.target_weight} Kgs`
                                      : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#999",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Activity level
                                  </div>
                                  <div
                                    style={{ fontSize: "14px", color: "#ccc" }}
                                  >
                                    {session.activity_level || "-"}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#999",
                                    marginBottom: "8px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Feedback
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "#ccc",
                                    lineHeight: "1.6",
                                    backgroundColor: "#1e1e1e",
                                    padding: "12px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {session.customer_feedback}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No completed sessions for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nutritionist Feedback Modal */}
      {showFeedbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "2rem",
              minWidth: "400px",
              maxWidth: "600px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1.5rem",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Nutritionist Feedback
            </h3>

            <div
              style={{
                fontSize: "14px",
                color: "#ccc",
                lineHeight: "1.6",
                backgroundColor: "#252525",
                padding: "16px",
                borderRadius: "4px",
                marginBottom: "1.5rem",
              }}
            >
              {selectedFeedback}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  background: "#FF5757",
                  border: "none",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
