"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineMenu,
  HiOutlineUserAdd,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiCurrencyRupee,
  HiOutlineSpeakerphone,
  HiOutlinePhone,
} from "react-icons/hi";
import { MdWorkOutline, MdOutlineTabletMac } from "react-icons/md";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { useRole } from "../layout"; // Import the useRole hook
import axiosInstance from "@/lib/axios";

export default function RoleBasedLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const { role, user } = useRole(); // Get role and user from context

  // Define navigation items based on role
  const getNavigationItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            name: "Dashboard",
            icon: HiOutlineHome,
            path: "/portal/admin/home",
          },
          {
            name: "Fymble Users",
            icon: HiOutlineUsers,
            path: "/portal/admin/users",
          },
          {
            name: "Fymble Business Users",
            icon: HiOutlineChartBar,
            path: "/portal/admin/stats",
          },
          // {
          //   name: "Revenue",
          //   icon: HiOutlineCurrencyDollar,
          //   path: "/portal/admin/revenue",
          // },
          {
            name: "Tech Support Inhouse",
            icon: HiOutlinePhone,
            path: "/portal/admin/telecaller-managers",
          },
          {
            name: "Marketing",
            icon: HiOutlineSpeakerphone,
            path: "/portal/admin/marketing",
          },
          // {
          //   name: "Support",
          //   icon: HiOutlineExclamationCircle,
          //   path: "/portal/admin/support",
          // },
          // {
          //   name: "Employees",
          //   icon: MdWorkOutline,
          //   path: "/portal/admin/employees",
          // },
          // {
          //   name: "BDM Requests",
          //   icon: HiOutlineUserAdd,
          //   path: "/portal/admin/requests",
          // },
          // {
          //   name: "All Gyms",
          //   icon: HiOutlineBuildingOffice2,
          //   path: "/portal/admin/allgyms",
          // },
          // {
          //   name: "Shipments",
          //   icon: MdOutlineTabletMac,
          //   path: "/portal/admin/shipments",
          // },
        ];
      case "support":
        return [
          {
            name: "Dashboard",
            icon: HiOutlineHome,
            path: "/portal/support/home",
          },
          {
            name: "Registered Gyms",
            icon: HiOutlineChartBar,
            path: "/portal/support/fittbotbusiness",
          },
        ];
      case "telecaller":
        return [
          {
            name: "Dashboard",
            icon: HiOutlineHome,
            path: "/portal/telecaller/home",
          },
          {
            name: "Gym Stats",
            icon: HiOutlineChartBar,
            path: "/portal/telecaller/gyms",
          },
          {
            name: "Unretained Users",
            icon: HiCurrencyRupee,
            path: "/portal/telecaller/unretainedusers",
          },
        ];
      case "nutritionist":
        return [
          {
            name: "Sessions",
            icon: HiOutlineHome,
            path: "/portal/nutritionist/home",
          },
          {
            name: "Completed",
            icon: HiOutlineChartBar,
            path: "/portal/nutritionist/completed",
          },
        ];

      default:
        return [];
    }
  };

  // Get user info based on role and user data
  const getUserInfo = () => {
    const userName = user?.name || "User";

    switch (role) {
      case "admin":
        return {
          name: userName,
          title: "Admin",
          dashboardType: "Admin dashboard",
          profilePath: "/portal/admin/profile",
        };
      case "support":
        return {
          name: userName,
          title: "Support Lead",
          dashboardType: "Support dashboard",
          profilePath: "/portal/support/profile",
        };
      case "telecaller":
        return {
          name: userName,
          title: "Tech Support Inhouse",
          dashboardType: "Tech Support Inhouse dashboard",
          profilePath: "/portal/telecaller/profile",
        };
      case "nutritionist":
        return {
          name: userName,
          title: "Nutritionist",
          dashboardType: "Nutritionist dashboard",
          profilePath: "/portal/nutritionist/profile",
        };
      default:
        return {
          name: userName,
          title: "Unknown",
          dashboardType: "Dashboard",
          profilePath: "/profile",
        };
    }
  };

  // Check if user has access to current route
  const hasAccess = (userRole, pathname) => {
    const roleRoutes = {
      admin: ["/portal/admin"],
      support: ["/portal/support", "/portal/admin/gymplans", "/portal/admin/gymphotos", "/portal/admin/gymdetails"],
      telecaller: ["/portal/telecaller"],
      nutritionist: ["/portal/nutritionist"],
    };

    const allowedRoutes = roleRoutes[userRole] || [];
    return allowedRoutes.some((route) => pathname.startsWith(route));
  };

  const navigationItems = getNavigationItems();
  const userInfo = getUserInfo();
  const accessDenied = !hasAccess(role, pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (accessDenied) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#111827",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ textAlign: "center" }}>Access Denied</h2>
          <p style={{ textAlign: "center" }}>
            You don&rsquo;t have permission to view this page.
          </p>
          <button
            onClick={() => router.push(`/portal/${role}/home`)}
            style={{
              backgroundColor: "#FF5757",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Function to handle navigation
  const handleNavigation = (path) => {
    router.push(path);
  };

  // Function to check if a navigation item is active
  const isActive = (path) => {
    // For exact match on home/dashboard pages
    if (path.endsWith("/home") || path.endsWith("/dashboard")) {
      return pathname === path;
    }
    // For other pages, check if current path starts with the nav item path
    // This allows sub-pages (like /marketing/bdes) to highlight the parent (Marketing)
    return pathname.startsWith(path);
  };

  // Function to handle profile click
  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Function to handle profile menu navigation
  const handleProfileNavigation = () => {
    setProfileDropdownOpen(false);
    router.push(userInfo.profilePath);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Call logout API
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear authentication data
      localStorage.removeItem("user");
      sessionStorage.clear();

      setProfileDropdownOpen(false);

      // Redirect to login page
      router.push("/");
    }
  };

  const sidebarStyle = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    backgroundColor: "#121717",
    borderRight: "1px solid #374151",
    transition: "all 0.3s ease-in-out",
    zIndex: 1030,
    width: sidebarCollapsed ? "64px" : "256px",
  };

  const mainContentStyle = {
    marginLeft: sidebarCollapsed ? "64px" : "256px",
    transition: "margin-left 0.3s ease-in-out",
    minHeight: "100vh",
    backgroundColor: "#111827",
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#111827", color: "white" }}
    >
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5,
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#FFFFFF",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#374151";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <HiOutlineMenu size={22} />
          </button>
          {!sidebarCollapsed && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{ fontWeight: "600", fontSize: "24px", color: "white" }}
              >
                <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#4a6fa5" }}>mble</span>
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ marginTop: "1.5rem", padding: "0 0.5rem" }}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  margin: "4px 0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: active ? "#565656" : "transparent",
                  color: active ? "white" : "#9ca3af",
                  textDecoration: "none",
                  transition: "all 0.2s ease-in-out",
                  userSelect: "none",
                }}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#374151";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#9ca3af";
                  }
                }}
              >
                <IconComponent size={20} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <span
                    style={{
                      marginLeft: "12px",
                      fontWeight: "500",
                      display: "block",
                    }}
                  >
                    {item.name}
                  </span>
                )}
                {/* Active indicator */}
                {active && (
                  <div
                    style={{
                      width: "4px",
                      height: "20px",
                      backgroundColor: "#FF5757",
                      borderRadius: "2px",
                      marginLeft: "auto",
                      display: sidebarCollapsed ? "none" : "block",
                    }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        {/* Header */}
        <header
          style={{
            backgroundColor: "#121717",
            borderBottom: "1px solid #374151",
            padding: "0.7rem 1.5rem",
            position: "fixed",
            top: 0,
            right: 0,
            left: sidebarCollapsed ? 64 : 256,
            zIndex: 999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left side - Greeting */}
            <div>
              <h1
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "white",
                  margin: "0",
                }}
              >
                Hi {userInfo.name}
              </h1>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "16px",
                  margin: "4px 0 0 0",
                }}
              >
                Welcome to <span style={{ color: "#FF5757" }}>Fy</span><span style={{ color: "#4a6fa5" }}>mble</span>{" "}
                {userInfo.dashboardType}
              </p>
            </div>

            {/* Right side - Profile Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
                onClick={handleProfileClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* User Info */}
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      margin: "0",
                      lineHeight: "1.2",
                    }}
                  >
                    {userInfo.name}
                  </div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      margin: "2px 0 0 0",
                      lineHeight: "1.2",
                    }}
                  >
                    {userInfo.title}
                  </div>
                </div>
                <div
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    backgroundColor: "#FF5757",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "200",
                    fontSize: "16px",
                  }}
                >
                  {userInfo.name.charAt(0)}
                </div>
                <HiOutlineChevronDown
                  size={16}
                  style={{
                    color: "#9ca3af",
                    transform: profileDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                />
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    width: "200px",
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: "8px 0" }}>
                    {/* Logout Option */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        color: "#ef4444",
                      }}
                      onClick={handleLogout}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#374151";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <HiOutlineLogout size={22} />
                      <span
                        style={{
                          marginLeft: "12px",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        Logout
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#121717",
            marginTop: "70px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
