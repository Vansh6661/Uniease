import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMyRestaurantOrders, fetchRestaurantOrders, updateOrderStatus } from "../services/api/foodAPI";
import { useAuth } from "../hooks/useAuth";

const RESTAURANT_NAMES = {
  "quench": "Quench",
  "southern-stories": "Southern Stories",
  "nescafe": "Nescafe",
  "dominos": "Dominos",
  "subway": "Subway",
  "sneapeats": "Sneapeats",
  "infinity": "Infinity",
};

export default function RestaurantDashboard() {
  const { restaurant: restaurantParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const effectiveRestaurantId = restaurantParam || user?.restaurantId;

  const restaurantName = RESTAURANT_NAMES[effectiveRestaurantId];

  useEffect(() => {
    const loadOrders = async () => {
      if (!effectiveRestaurantId) return;

      setIsLoading(true);
      setError(null);

      // Fetch ALL orders (including completed) for accurate stats
      const response = user?.appRole === "RESTAURANT"
        ? await fetchMyRestaurantOrders(true) // true = include completed
        : await fetchRestaurantOrders(effectiveRestaurantId, true);

      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError(response.error || "Failed to fetch orders");
      }

      setIsLoading(false);
    };

    loadOrders();
  }, [effectiveRestaurantId, user?.appRole]);

  if (!restaurantName) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Not Found</h1>
          <button
            onClick={() => navigate("/")}
            className="btn-primary mx-auto"
          >
            ← Back Home
          </button>
        </div>
      </div>
    );
  }

  const acceptOrder = async (orderId) => {
    const response = await updateOrderStatus(orderId, 'accepted');
    if (response.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "accepted" } : order
        )
      );
    } else {
      alert(`Failed to accept order: ${response.error}`);
    }
  };

  const rejectOrder = async (orderId) => {
    const response = await updateOrderStatus(orderId, 'rejected');
    if (response.success) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } else {
      alert(`Failed to reject order: ${response.error}`);
    }
  };

  const updateOrderStatusHandler = async (orderId, newStatus) => {
    const response = await updateOrderStatus(orderId, newStatus);
    if (response.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      alert(`Failed to update order: ${response.error}`);
    }
  };

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    accepted: orders.filter((o) => o.status === "accepted").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  // Display only active orders (hide completed/rejected for cleaner dashboard)
  const displayedOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "rejected"
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">📊 {restaurantName} Dashboard</h1>
            <p className="text-slate-600">Manage orders and track deliveries</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2">
          <p className="text-slate-600 font-semibold">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <p className="text-slate-600 font-semibold">Accepted</p>
          <p className="text-3xl font-bold text-blue-600">{stats.accepted}</p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <p className="text-slate-600 font-semibold">In Progress</p>
          <p className="text-3xl font-bold text-purple-600">{stats.in_progress}</p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <p className="text-slate-600 font-semibold">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">📋 Orders</h2>
        {isLoading && (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-600">Loading orders...</p>
          </div>
        )}
        {error && (
          <div className="glass-card p-4 text-center bg-red-50 text-red-700">
            {error}
          </div>
        )}
        {!isLoading && !error && displayedOrders.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-600">No active orders</p>
          </div>
        ) : !isLoading && !error ? (
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <div key={order.id} className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">Order #{order.id}</h3>
                    <p className="text-sm text-slate-600">Customer: {order.customer}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-slate-600 mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-slate-700">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-600">₹{order.total}</p>
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button
                        onClick={() => updateOrderStatusHandler(order.id, "in_progress")}
                        className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition"
                      >
                        👨‍🍳 Start Cooking
                      </button>
                    )}
                    {order.status === "in_progress" && (
                      <button
                        onClick={() => updateOrderStatusHandler(order.id, "completed")}
                        className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition"
                      >
                        ✓ Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
