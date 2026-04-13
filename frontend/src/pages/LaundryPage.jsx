import React, { useEffect, useMemo, useState } from "react";
import { createLaundryOrder, fetchMyLaundryOrders } from "../services/api/laundryAPI";

const CLOTH_ITEMS = [
  { key: "shirt", label: "Shirt" },
  { key: "pant", label: "Pant" },
  { key: "tshirt", label: "T-shirt" },
  { key: "bedsheet", label: "Bedsheet" },
  { key: "towel", label: "Towel" },
  { key: "jeans", label: "Jeans" },
  { key: "kurta", label: "Kurta" },
  { key: "jacket", label: "Jacket" },
];

const MAX_TOTAL_ITEMS = 15;

export default function LaundryPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [items, setItems] = useState({});
  const [orders, setOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successToken, setSuccessToken] = useState(null);

  const totalItems = useMemo(
    () => Object.values(items).reduce((sum, qty) => sum + qty, 0),
    [items]
  );

  const selectedSummary = useMemo(
    () => CLOTH_ITEMS.filter((item) => items[item.key] > 0),
    [items]
  );

  const fetchOrders = async () => {
    const response = await fetchMyLaundryOrders();
    if (response.success) {
      setOrders(response.data || []);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateQty = (key, delta) => {
    setError(null);
    setSuccessToken(null);

    setItems((prev) => {
      const current = prev[key] || 0;
      const nextValue = Math.max(0, current + delta);
      const draft = { ...prev, [key]: nextValue };
      const nextTotal = Object.values(draft).reduce((sum, qty) => sum + qty, 0);

      if (nextTotal > MAX_TOTAL_ITEMS) {
        setError(`Maximum ${MAX_TOTAL_ITEMS} items allowed per order`);
        return prev;
      }

      if (nextValue === 0) {
        delete draft[key];
      }

      return draft;
    });
  };

  const handlePlaceOrder = async () => {
    if (totalItems === 0 || totalItems > MAX_TOTAL_ITEMS || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessToken(null);

    const response = await createLaundryOrder(items);

    if (!response.success) {
      setError(response.error || "Failed to place laundry order");
      setIsSubmitting(false);
      return;
    }

    setSuccessToken(response.data.order_token);
    setItems({});
    setActiveTab("track");
    await fetchOrders();
    setIsSubmitting(false);
  };

  const getProgressWidth = (status) => {
    if (status === "DELIVERED") return "w-full";
    if (status === "READY") return "w-5/6";
    if (status === "PROCESSING") return "w-2/3";
    if (status === "ACCEPTED") return "w-1/2";
    return "w-1/4";
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">🧺 Laundry Service</h1>
        <p className="text-slate-600">Select laundry items and schedule pickup</p>
      </div>

      <div className="glass-card p-4 flex gap-4">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "new"
              ? "tab-active bg-blue-100 text-blue-700"
              : "tab-inactive hover:bg-slate-100"
          }`}
        >
          ➕ New Order
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "track"
              ? "tab-active bg-blue-100 text-blue-700"
              : "tab-inactive hover:bg-slate-100"
          }`}
        >
          📦 My Orders
        </button>
      </div>

      {activeTab === "new" && (
        <div className="space-y-8">
          {error && <div className="glass-card p-4 bg-red-50 text-red-700">{error}</div>}
          {successToken && (
            <div className="glass-card p-4 bg-emerald-50 text-emerald-700">
              Order placed successfully. Your pickup Order ID is <span className="font-bold">{successToken}</span>
            </div>
          )}

          <div className="glass-card p-8 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Select Laundry Items</h2>
            <p className="text-slate-600">Maximum {MAX_TOTAL_ITEMS} items per order</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLOTH_ITEMS.map((cloth) => {
                const qty = items[cloth.key] || 0;

                return (
                  <div key={cloth.key} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{cloth.label}</p>
                      <p className="text-sm text-slate-500">Qty: {qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(cloth.key, -1)}
                        className="w-9 h-9 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900">{qty}</span>
                      <button
                        onClick={() => updateQty(cloth.key, 1)}
                        className="w-9 h-9 rounded-lg bg-green-100 text-green-600 font-bold hover:bg-green-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-8 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-2">
              <p className="font-semibold text-slate-700">Total items: {totalItems}</p>
              {selectedSummary.length === 0 ? (
                <p className="text-slate-500">No items selected yet.</p>
              ) : (
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {selectedSummary.map((entry) => (
                    <li key={entry.key}>
                      {entry.label} x{items[entry.key]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={totalItems === 0 || totalItems > MAX_TOTAL_ITEMS || isSubmitting}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {isSubmitting ? "Placing Laundry Order..." : "Place Laundry Order"}
          </button>
        </div>
      )}

      {activeTab === "track" && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{order.order_token}</p>
                  <p className="text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-slate-700">
                  <span className="font-semibold">Items:</span>{" "}
                  {Object.entries(order.items || {})
                    .map(([name, qty]) => `${name} x${qty}`)
                    .join(", ")}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Total Items:</span> {order.total_items}
                </p>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    order.status === "DELIVERED" ? "bg-emerald-500" : "bg-blue-500"
                  } ${getProgressWidth(order.status)}`}
                ></div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="glass-card p-6 text-slate-600 text-center">No laundry orders yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
