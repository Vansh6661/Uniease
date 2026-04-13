import React, { useEffect, useMemo, useState } from 'react';
import { fetchLaundryStaffOrders, updateLaundryOrderStatus } from '../services/api/laundryAPI';

const getNextAction = (status) => {
  if (status === 'PENDING') return { label: 'Accept', status: 'ACCEPTED' };
  if (status === 'ACCEPTED') return { label: 'Start Processing', status: 'PROCESSING' };
  if (status === 'PROCESSING') return { label: 'Mark Ready', status: 'READY' };
  return null;
};

export default function LaundryDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryTokens, setDeliveryTokens] = useState({});

  const refreshOrders = async () => {
    setLoading(true);
    const response = await fetchLaundryStaffOrders();
    if (response.success) {
      setOrders(response.data || []);
      setError(null);
    } else {
      setError(response.error || 'Failed to load laundry dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const grouped = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === 'PENDING'),
      active: orders.filter((o) => ['ACCEPTED', 'PROCESSING', 'READY'].includes(o.status)),
      done: orders.filter((o) => ['DELIVERED', 'REJECTED'].includes(o.status)),
    };
  }, [orders]);

  const onUpdate = async ({ orderId, status, reason, deliveryToken }) => {
    const result = await updateLaundryOrderStatus({ orderId, status, reason, deliveryToken });
    if (!result.success) {
      setError(result.error);
      return;
    }

    await refreshOrders();
  };

  const renderItems = (items = {}) => {
    return Object.entries(items).map(([name, qty]) => `${name} x${qty}`).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-slate-900">Laundry Staff Dashboard</h1>
        <p className="text-slate-600">Manage item-based laundry orders</p>
      </div>

      {error && (
        <div className="glass-card p-4 bg-red-50 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="glass-card p-6 text-slate-600">Loading orders...</div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-4">
            <p className="font-semibold text-slate-900">Pending: {grouped.pending.length}</p>
            <p className="font-semibold text-slate-900">Active: {grouped.active.length}</p>
            <p className="font-semibold text-slate-900">Delivered/Rejected: {grouped.done.length}</p>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const nextAction = getNextAction(order.status);
              const canDeliver = order.status === 'READY';

              return (
                <div key={order.id} className="glass-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Order Token: {order.order_token}</p>
                      <p className="text-sm text-slate-600">Student: {order.student_name} ({order.student_email})</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-slate-100 text-slate-800 font-semibold text-sm">{order.status}</span>
                  </div>

                  <p className="text-slate-700"><span className="font-semibold">Items:</span> {renderItems(order.items)}</p>
                  <p className="text-slate-700"><span className="font-semibold">Total Items:</span> {order.total_items}</p>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => onUpdate({ orderId: order.id, status: 'REJECTED', reason: 'Rejected by laundry staff' })}
                        className="px-3 py-2 rounded bg-red-100 text-red-700 font-semibold"
                      >
                        Reject
                      </button>
                    )}

                    {nextAction && (
                      <button
                        onClick={() => onUpdate({ orderId: order.id, status: nextAction.status })}
                        className="px-3 py-2 rounded bg-blue-100 text-blue-700 font-semibold"
                      >
                        {nextAction.label}
                      </button>
                    )}
                  </div>

                  {canDeliver && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Enter Order ID to confirm delivery
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={deliveryTokens[order.id] || ''}
                          onChange={(e) => setDeliveryTokens((prev) => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="LAUNDRY1234"
                          className="flex-1 px-3 py-2 rounded border border-slate-300"
                        />
                        <button
                          onClick={() =>
                            onUpdate({
                              orderId: order.id,
                              status: 'DELIVERED',
                              deliveryToken: deliveryTokens[order.id],
                            })
                          }
                          className="px-3 py-2 rounded bg-emerald-100 text-emerald-700 font-semibold"
                        >
                          Confirm Delivery
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="glass-card p-6 text-slate-600">No laundry orders found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
