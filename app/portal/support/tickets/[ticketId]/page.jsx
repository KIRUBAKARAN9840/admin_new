"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function TicketDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const ticketId = params.ticketId;
  const source = searchParams.get("source") || "Fittbot Business";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const isMounted = useRef(true);

  // Track fetched IDs to avoid duplicate calls
  const fetchedIdRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Only fetch if ticketId or source has changed
    const currentKey = `${ticketId}-${source}`;
    if (fetchedIdRef.current === currentKey) {
      return;
    }
    fetchedIdRef.current = currentKey;

    const fetchData = async () => {
      if (!isMounted.current) return;

      try {
        setLoading(true);
        setError(null);

        const endpoint = source === "Fittbot Business" ? "/api/admin/dashboard/gym-ticket-detail" : "/api/admin/dashboard/client-ticket-detail";
        const response = await axiosInstance.get(`${endpoint}?ticket_id=${ticketId}`);

        if (response.data.success && isMounted.current) {
          setTicket(response.data.data);
        } else if (isMounted.current) {
          throw new Error(response.data.message || "Failed to fetch ticket details");
        }
      } catch (err) {
        if (!isMounted.current) return;
        const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch ticket details";
        setError(errorMsg);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [ticketId, source]);

  const handleMarkResolved = async () => {
    try {
      const endpoint = source === "Fittbot Business" ? "/api/admin/dashboard/gym-ticket-resolve" : "/api/admin/dashboard/client-ticket-resolve";
      await axiosInstance.post(endpoint, { ticket_id: ticketId });

      // Manually refresh after marking resolved
      if (isMounted.current) {
        setLoading(true);
        const endpointDetail = source === "Fittbot Business" ? "/api/admin/dashboard/gym-ticket-detail" : "/api/admin/dashboard/client-ticket-detail";
        const response = await axiosInstance.get(`${endpointDetail}?ticket_id=${ticketId}`);

        if (response.data.success && isMounted.current) {
          setTicket(response.data.data);
        }
        setLoading(false);
      }
    } catch (err) {
      alert("Failed to mark ticket as resolved");
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === "resolved" ? "badge-resolved" : "badge-pending";
  };

  const getStatusLabel = (status) => {
    return status === "resolved" ? "Resolved" : "Pending";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="section-container">
          <div className="text-center py-5">
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
            <p style={{ fontSize: "14px", color: "#ccc" }}>Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="dashboard-container">
        <div className="section-container">
          <button
            className="btn btn-outline-secondary btn-sm mb-4"
            onClick={() => router.back()}
            style={{
              borderColor: "#444",
              color: "#ccc",
              backgroundColor: "transparent",
            }}
          >
            ← Back
          </button>
          <div className="text-center py-5">
            <p style={{ fontSize: "16px", color: "#ef4444" }}>
              {error || "Ticket not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="section-container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <button
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={() => router.back()}
              style={{
                borderColor: "#444",
                color: "#ccc",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#222";
                e.target.style.borderColor = "#FF5757";
                e.target.style.color = "#FF5757";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "#444";
                e.target.style.color = "#ccc";
              }}
            >
              ← Back to Tickets
            </button>
            <h3 className="section-heading mb-2">
              <span style={{ color: "#FF5757" }}>
                {source === "Fittbot Business" ? "Gym" : "Client"}
              </span>{" "}
              Support Ticket
            </h3>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Ticket ID: <code style={{ color: "#FF5757" }}>{ticket.ticket_id}</code>
            </p>
          </div>

          <div>
            <span
              className={`badge ${getStatusBadgeClass(ticket.status)}`}
              style={{
                padding: "8px 16px",
                borderRadius: "16px",
                fontSize: "14px",
              }}
            >
              {getStatusLabel(ticket.status)}
            </span>
          </div>
        </div>

        {/* Ticket Details Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "6px",
                  }}
                >
                  Name
                </label>
                <div style={{ fontSize: "16px", color: "#fff" }}>
                  {ticket.name || "N/A"}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-4">
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "6px",
                  }}
                >
                  Email
                </label>
                <div style={{ fontSize: "16px", color: "#fff" }}>
                  {ticket.email || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "6px",
                  }}
                >
                  Subject
                </label>
                <div style={{ fontSize: "16px", color: "#fff" }}>
                  {ticket.subject || "No subject"}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-4">
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "6px",
                  }}
                >
                  Created At
                </label>
                <div style={{ fontSize: "16px", color: "#fff" }}>
                  {formatDate(ticket.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label
              style={{
                display: "block",
                fontSize: "13px",
                color: "#888",
                marginBottom: "6px",
              }}
            >
              Issue Description
            </label>
            <div
              style={{
                backgroundColor: "#222",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#fff",
                minHeight: "100px",
                whiteSpace: "pre-wrap",
              }}
            >
              {ticket.issue || "No issue description provided"}
            </div>
          </div>

          {ticket.comments && (
            <div className="mb-4">
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#888",
                  marginBottom: "6px",
                }}
              >
                Comments
              </label>
              <div
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "16px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#ccc",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ticket.comments}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-3 mt-4">
            {ticket.status !== "resolved" && (
              <button
                className="btn"
                onClick={handleMarkResolved}
                style={{
                  backgroundColor: "#10b981",
                  border: "none",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "8px",
                }}
              >
                Mark as Resolved
              </button>
            )}
            <button
              className="btn"
              onClick={() => router.back()}
              style={{
                backgroundColor: "#333",
                border: "1px solid #444",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "8px",
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .badge-resolved {
          background-color: #10b981;
          color: white;
        }
        .badge-pending {
          background-color: #ef4444;
          color: white;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
