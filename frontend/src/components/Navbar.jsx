import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { APP_ROLES } from "../utils/roles";

export default function Navbar({ user }) {
  const { logout } = useAuth();
  const location = useLocation();
  const appRole = user?.appRole || APP_ROLES.USER;

  const userNavItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/academic", label: "Academic", icon: "📚" },
    { path: "/food", label: "Food", icon: "🍽️" },
    { path: "/laundry", label: "Laundry", icon: "🧺" },
    { path: "/complaint", label: "Complaint", icon: "📋" },
  ];

  const adminNavItems = [
    { path: "/admin/dashboard", label: "Admin Dashboard", icon: "🛠️" },
  ];

  const restaurantNavItems = [
    { path: "/restaurant/dashboard", label: "Restaurant Dashboard", icon: "🍽️" },
  ];

  const laundryNavItems = [
    { path: "/laundry/dashboard", label: "Laundry Dashboard", icon: "🧺" },
  ];

  const navItems = appRole === APP_ROLES.ADMIN
    ? adminNavItems
    : appRole === APP_ROLES.RESTAURANT
      ? restaurantNavItems
      : appRole === APP_ROLES.LAUNDRY
        ? laundryNavItems
        : userNavItems;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300">
              UniEase
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? "nav-link-active" : "nav-link-inactive"}`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name || "Student"}</p>
              <p className="text-xs text-slate-600">{user?.appRole || "USER"}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg font-semibold text-SM transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

