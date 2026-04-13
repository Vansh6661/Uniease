import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const services = [
    {
      id: 1,
      title: "Academic Portal",
      description: "View grades, attendance, and course info",
      icon: "📚",
      path: "/academic",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      title: "Food Order",
      description: "Order meals from campus cafeteria",
      icon: "🍽️",
      path: "/food",
      color: "from-orange-400 to-orange-600",
    },
{
      id: 3,
      title: "Laundry Service",
      description: "Schedule laundry pickup & delivery",
      icon: "🧺",
      path: "/laundry",
      color: "from-purple-400 to-purple-600",
    },
    {
      id: 4,
      title: "Raise Complaint",
      description: "Submit and track complaints",
      icon: "📋",
      path: "/complaint",
      color: "from-rose-400 to-rose-600",
    },
    {
      id: 5,
      title: "Library",
      description: "Book management & reservations",
      icon: "📖",
      color: "from-emerald-400 to-emerald-600",
      status: "coming",
    },
    {
      id: 6,
      title: "Transport",
      description: "Bus schedule & route information",
      icon: "🚌",
      color: "from-cyan-400 to-cyan-600",
      status: "coming",
    },
    {
      id: 7,
      title: "Sports Facility",
      description: "Book sports venues & facilities",
      icon: "⚽",
      color: "from-yellow-400 to-yellow-600",
      status: "coming",
    },
    {
      id: 8,
      title: "Health Centre",
      description: "Medical appointments & records",
      icon: "⚕️",
      color: "from-red-400 to-red-600",
      status: "coming",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-8 space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Welcome back! 👋</h1>
        <p className="text-slate-600">Here's what you can do today</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const cardContent = (
            <div
              className={`glass-card-hover p-6 space-y-3 group ${
                service.status === "coming" ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.description}</p>
              </div>
              {service.status === "coming" && (
                <div className="pt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                  Coming Soon
                </div>
              )}
            </div>
          );

          if (service.status === "coming") {
            return <div key={service.id}>{cardContent}</div>;
          }

          return (
            <Link key={service.id} to={service.path}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Services", value: "4", icon: "✨" },
          { label: "Tasks Pending", value: "2", icon: "⏳" },
          { label: "Messages", value: "5", icon: "💬" },
          { label: "Campus News", value: "New", icon: "📰" },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-4 text-center space-y-2">
            <div className="text-3xl">{stat.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
