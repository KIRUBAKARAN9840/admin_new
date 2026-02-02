"use client";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    reason: "",
  });
  const [completionData, setCompletionData] = useState({
    duration: "",
    feedback: "",
    interestedInProduct: "",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dummy data for sessions
  const dummySessionData = {
    "2025-12-18": [
      {
        id: 1,
        slot: "10:00 - 10:30 AM",
        client_name: "Aarav Sharma",
        meeting_link: null,
        status: "Pending",
        age: 28,
        goal: "Weight Loss",
        current_weight: 85,
        target_weight: 75,
        activity_level: "Moderate",
      },
      {
        id: 2,
        slot: "11:00 - 11:30 AM",
        client_name: "Meera Kapoor",
        meeting_link: "https://meet.google.com/abc-defg-hij",
        status: "Scheduled",
        age: 32,
        goal: "Muscle Gain",
        current_weight: 62,
        target_weight: 68,
        activity_level: "High",
      },
      {
        id: 3,
        slot: "02:00 - 02:30 PM",
        client_name: "Rohan Verma",
        meeting_link: "https://meet.google.com/xyz-abcd-efg",
        status: "Rescheduled",
        age: 25,
        goal: "Maintain Weight",
        current_weight: 70,
        target_weight: 70,
        activity_level: "Low",
      },
    ],
    "2025-12-19": [
      {
        id: 4,
        slot: "09:00 - 09:30 AM",
        client_name: "Priya Singh",
        meeting_link: "https://meet.google.com/priya-session",
        status: "Scheduled",
        age: 30,
        goal: "Weight Loss",
        current_weight: 78,
        target_weight: 65,
        activity_level: "Moderate",
      },
      {
        id: 5,
        slot: "03:00 - 03:30 PM",
        client_name: "Vikram Reddy",
        meeting_link: null,
        status: "Pending",
        age: 35,
        goal: "Muscle Gain",
        current_weight: 80,
        target_weight: 85,
        activity_level: "Very High",
      },
    ],
    "2025-12-20": [
      {
        id: 6,
        slot: "10:30 - 11:00 AM",
        client_name: "Ananya Patel",
        meeting_link: "https://meet.google.com/ananya-meet",
        status: "Scheduled",
        age: 27,
        goal: "Weight Loss",
        current_weight: 72,
        target_weight: 62,
        activity_level: "Moderate",
      },
    ],
    "2025-12-22": [
      {
        id: 7,
        slot: "11:00 - 11:30 AM",
        client_name: "Kabir Malhotra",
        meeting_link: null,
        status: "Pending",
        age: 29,
        goal: "Maintain Weight",
        current_weight: 75,
        target_weight: 75,
        activity_level: "High",
      },
      {
        id: 8,
        slot: "04:00 - 04:30 PM",
        client_name: "Sneha Iyer",
        meeting_link: "https://meet.google.com/sneha-call",
        status: "Scheduled",
        age: 26,
        goal: "Weight Loss",
        current_weight: 68,
        target_weight: 58,
        activity_level: "Low",
      },
    ],
    "2025-12-25": [
      {
        id: 9,
        slot: "10:00 - 10:30 AM",
        client_name: "Arjun Nair",
        meeting_link: "https://meet.google.com/arjun-session",
        status: "Rescheduled",
        age: 31,
        goal: "Muscle Gain",
        current_weight: 73,
        target_weight: 80,
        activity_level: "Very High",
      },
    ],
  };

  // Generate 30 days from today
  const generateCalendarDates = () => {
    const allDates = [];
    const startDate = new Date(today);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
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

  const handleGenerateLink = (sessionId) => {
    // Simulate generating a link
    const updatedSessions = sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            meeting_link: `https://meet.google.com/generated-${sessionId}`,
            status: "Scheduled",
          }
        : session
    );
    setSessions(updatedSessions);
  };

  const isRescheduledWithoutLink = (session) => {
    return session.status === "Rescheduled" && !session.meeting_link;
  };

  const handleReschedule = (session) => {
    setSelectedSession(session);
    setShowRescheduleModal(true);
  };

  const submitReschedule = () => {
    // Simulate rescheduling - reset meeting link so they need to generate a new one
    const updatedSessions = sessions.map((session) =>
      session.id === selectedSession.id
        ? { ...session, status: "Rescheduled", meeting_link: null }
        : session
    );
    setSessions(updatedSessions);
    setShowRescheduleModal(false);
    setRescheduleData({ date: "", time: "", reason: "" });
    alert(
      `Session rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`
    );
  };

  const handleMarkAsCompleted = (session) => {
    setSelectedSession(session);
    setShowCompletionModal(true);
  };

  const submitCompletion = () => {
    if (!completionData.duration || !completionData.feedback || !completionData.interestedInProduct) {
      alert("Please fill all fields");
      return;
    }

    // Simulate marking as completed
    const updatedSessions = sessions.map((session) =>
      session.id === selectedSession.id
        ? { ...session, status: "Completed", ...completionData }
        : session
    );
    setSessions(updatedSessions);
    setShowCompletionModal(false);
    setCompletionData({ duration: "", feedback: "", interestedInProduct: "" });
    alert("Session marked as completed!");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { color: "#FFA500", backgroundColor: "rgba(255, 165, 0, 0.1)" };
      case "Scheduled":
        return { color: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)" };
      case "Rescheduled":
        return { color: "#2196F3", backgroundColor: "rgba(33, 150, 243, 0.1)" };
      case "Completed":
        return { color: "#00C853", backgroundColor: "rgba(0, 200, 83, 0.1)" };
      default:
        return { color: "#999", backgroundColor: "rgba(153, 153, 153, 0.1)" };
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

                return (
                  <div
                    key={dateIndex}
                    onClick={() => handleDateClick(date)}
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
                      cursor: "pointer",
                      transition: "all 0.2s",
                      minHeight: "70px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.background = "#2a2a2a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
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
                          fontSize: "14px",
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
          <span style={{ color: "#FF5757" }}>Session</span> Calendar
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
            Sessions for {formatDate(selectedDate)}
          </h3>
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Slot</th>
                  <th>Client Name</th>
                  <th>Meeting Link</th>
                  <th>Status</th>
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
                        <td>{session.client_name}</td>
                        <td>
                          {session.status === "Rescheduled" ? (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#999",
                                fontStyle: "italic",
                              }}
                            >
                              -
                            </span>
                          ) : !session.meeting_link ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateLink(session.id);
                              }}
                              style={{
                                background: "#FF5757",
                                border: "none",
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Generate Link
                            </button>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  if (session.status === "Completed") {
                                    e.preventDefault();
                                  } else {
                                    e.stopPropagation();
                                  }
                                }}
                                style={{
                                  background: session.status === "Completed" ? "#666" : "#4CAF50",
                                  border: "none",
                                  color: "white",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  textDecoration: "none",
                                  fontSize: "12px",
                                  cursor: session.status === "Completed" ? "not-allowed" : "pointer",
                                  opacity: session.status === "Completed" ? 0.5 : 1,
                                }}
                              >
                                Join Meeting
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReschedule(session);
                                }}
                                disabled={session.status === "Completed"}
                                style={{
                                  background: "transparent",
                                  border: "1px solid #444",
                                  color: "#ccc",
                                  padding: "6px 8px",
                                  borderRadius: "4px",
                                  cursor: session.status === "Completed" ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  opacity: session.status === "Completed" ? 0.5 : 1,
                                }}
                              >
                                <FaEdit size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {session.status === "Scheduled" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsCompleted(session);
                              }}
                              style={{
                                ...getStatusStyle(session.status),
                                padding: "6px 14px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                border: "2px solid #4CAF50",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 4px rgba(76, 175, 80, 0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(76, 175, 80, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(76, 175, 80, 0.2)";
                              }}
                            >
                              {session.status} ✓
                            </button>
                          ) : (
                            <span
                              style={{
                                ...getStatusStyle(session.status),
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {session.status}
                            </span>
                          )}
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
                          <td colSpan="6">
                            <div
                              style={{
                                background: "#252525",
                                padding: "1rem",
                                borderRadius: "4px",
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gap: "1rem",
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
                                  {session.age || "-"}
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
                                  {session.goal || "-"}
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
                                    ? `${session.current_weight} kg`
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
                                    ? `${session.target_weight} kg`
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
                                  Activity Level
                                </div>
                                <div
                                  style={{ fontSize: "14px", color: "#ccc" }}
                                >
                                  {session.activity_level || "-"}
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
                    <td colSpan="6" className="no-data">
                      No sessions scheduled for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
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
        >
          <div
            style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "2rem",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1.5rem",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Complete Session
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Meeting Duration
              </label>
              <input
                type="text"
                placeholder="e.g., 25:30 min"
                value={completionData.duration}
                onChange={(e) =>
                  setCompletionData({ ...completionData, duration: e.target.value })
                }
                style={{
                  width: "100%",
                  background: "#252525",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Feedback/Advice
              </label>
              <textarea
                value={completionData.feedback}
                onChange={(e) =>
                  setCompletionData({
                    ...completionData,
                    feedback: e.target.value,
                  })
                }
                rows={4}
                placeholder="Enter your feedback or advice for the client..."
                style={{
                  width: "100%",
                  background: "#252525",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Interested in Nutrition Product
              </label>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    color: "#ccc",
                  }}
                >
                  <input
                    type="radio"
                    name="interestedInProduct"
                    value="Yes"
                    checked={completionData.interestedInProduct === "Yes"}
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        interestedInProduct: e.target.value,
                      })
                    }
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                  Yes
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    color: "#ccc",
                  }}
                >
                  <input
                    type="radio"
                    name="interestedInProduct"
                    value="No"
                    checked={completionData.interestedInProduct === "No"}
                    onChange={(e) =>
                      setCompletionData({
                        ...completionData,
                        interestedInProduct: e.target.value,
                      })
                    }
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                  No
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletionData({ duration: "", feedback: "", interestedInProduct: "" });
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
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
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
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
        >
          <div
            style={{
              background: "#1e1e1e",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "2rem",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1.5rem",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Reschedule Meeting
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
                style={{
                  width: "100%",
                  background: "#252525",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Time
              </label>
              <input
                type="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, time: e.target.value })
                }
                style={{
                  width: "100%",
                  background: "#252525",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#ccc",
                  fontSize: "13px",
                  marginBottom: "0.5rem",
                }}
              >
                Reason
              </label>
              <textarea
                value={rescheduleData.reason}
                onChange={(e) =>
                  setRescheduleData({
                    ...rescheduleData,
                    reason: e.target.value,
                  })
                }
                rows={3}
                style={{
                  width: "100%",
                  background: "#252525",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleData({ date: "", time: "", reason: "" });
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
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
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
