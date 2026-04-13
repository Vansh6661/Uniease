import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { placeFoodOrder, fetchMyOrders } from "../services/api/foodAPI";

const RESTAURANT_MENUS = {
  quench: {
    name: "Quench",
    emoji: "🥤",
    items: {
      cold: [
        { id: "q1", name: "Iced Coffee", price: 120, emoji: "🧋", restaurant: "quench" },
        { id: "q2", name: "Mango Lassi", price: 80, emoji: "🥭", restaurant: "quench" },
        { id: "q3", name: "Cold Cola", price: 60, emoji: "🥤", restaurant: "quench" },
        { id: "q4", name: "Lemonade", price: 50, emoji: "🍋", restaurant: "quench" },
      ],
      hot: [
        { id: "q5", name: "Hot Coffee", price: 40, emoji: "☕", restaurant: "quench" },
        { id: "q6", name: "Hot Tea", price: 30, emoji: "🍵", restaurant: "quench" },
        { id: "q7", name: "Hot Chocolate", price: 60, emoji: "🍫", restaurant: "quench" },
      ],
    },
  },
  "southern-stories": {
    name: "Southern Stories",
    emoji: "🍲",
    items: {
      lunch: [
        { id: "ss1", name: "Hyderabadi Biryani", price: 150, emoji: "🍛", restaurant: "southern-stories" },
        { id: "ss2", name: "Masala Dosa", price: 100, emoji: "🥗", restaurant: "southern-stories" },
        { id: "ss3", name: "Sambar Rice", price: 80, emoji: "🍚", restaurant: "southern-stories" },
        { id: "ss4", name: "Idli Vada", price: 60, emoji: "🍢", restaurant: "southern-stories" },
      ],
      dinner: [
        { id: "ss5", name: "Andhra Cottage Biryani", price: 180, emoji: "🍛", restaurant: "southern-stories" },
        { id: "ss6", name: "Fish Curry Rice", price: 140, emoji: "🐟", restaurant: "southern-stories" },
      ],
    },
  },
  nescafe: {
    name: "Nescafe",
    emoji: "☕",
    items: {
      coffee: [
        { id: "n1", name: "Espresso", price: 100, emoji: "☕", restaurant: "nescafe" },
        { id: "n2", name: "Cappuccino", price: 120, emoji: "🥛", restaurant: "nescafe" },
        { id: "n3", name: "Latte", price: 130, emoji: "🍶", restaurant: "nescafe" },
        { id: "n4", name: "Mocha", price: 140, emoji: "🍫", restaurant: "nescafe" },
      ],
      pastry: [
        { id: "n5", name: "Croissant", price: 80, emoji: "🥐", restaurant: "nescafe" },
        { id: "n6", name: "Chocolate Cake", price: 120, emoji: "🎂", restaurant: "nescafe" },
      ],
    },
  },
  dominos: {
    name: "Dominos",
    emoji: "🍕",
    items: {
      pizza: [
        { id: "d1", name: "Margherita Pizza", price: 300, emoji: "🍕", restaurant: "dominos" },
        { id: "d2", name: "Pepperoni Pizza", price: 350, emoji: "🍕", restaurant: "dominos" },
        { id: "d3", name: "Deluxe Veggie", price: 320, emoji: "🍕", restaurant: "dominos" },
        { id: "d4", name: "Chicken Fiesta", price: 380, emoji: "🍗", restaurant: "dominos" },
      ],
      sides: [
        { id: "d5", name: "Garlic Bread", price: 100, emoji: "🍞", restaurant: "dominos" },
        { id: "d6", name: "Mozzarella Sticks", price: 120, emoji: "🧀", restaurant: "dominos" },
      ],
    },
  },
  subway: {
    name: "Subway",
    emoji: "🥪",
    items: {
      subs: [
        { id: "sub1", name: "Italian BMT", price: 250, emoji: "🥪", restaurant: "subway" },
        { id: "sub2", name: "Spicy Italian", price: 240, emoji: "🌶️", restaurant: "subway" },
        { id: "sub3", name: "Veggie Delite", price: 180, emoji: "🥒", restaurant: "subway" },
        { id: "sub4", name: "Chicken Teriyaki", price: 280, emoji: "🍗", restaurant: "subway" },
      ],
      salads: [
        { id: "sub5", name: "Mediterranean Salad", price: 150, emoji: "🥗", restaurant: "subway" },
        { id: "sub6", name: "Chicken Salad", price: 180, emoji: "🥗", restaurant: "subway" },
      ],
    },
  },
  sneapeats: {
    name: "Sneapeats",
    emoji: "🍽️",
    items: {
      starters: [
        { id: "sn1", name: "Chilli Garlic Noodles", price: 150, emoji: "🍜", restaurant: "sneapeats" },
        { id: "sn2", name: "Paneer Tikka", price: 200, emoji: "🍖", restaurant: "sneapeats" },
        { id: "sn3", name: "Spring Rolls", price: 120, emoji: "🥟", restaurant: "sneapeats" },
      ],
      mains: [
        { id: "sn4", name: "Butter Garlic Noodles", price: 180, emoji: "🍝", restaurant: "sneapeats" },
        { id: "sn5", name: "Schezwan Rice", price: 160, emoji: "🍚", restaurant: "sneapeats" },
      ],
    },
  },
  infinity: {
    name: "Infinity",
    emoji: "♾️",
    items: {
      premium: [
        { id: "inf1", name: "Premium Thali", price: 250, emoji: "🍱", restaurant: "infinity" },
        { id: "inf2", name: "Biryanis Deluxe", price: 280, emoji: "🍛", restaurant: "infinity" },
        { id: "inf3", name: "North Indian Veg", price: 220, emoji: "🥘", restaurant: "infinity" },
      ],
      specials: [
        { id: "inf4", name: "Chef's Special Curry", price: 300, emoji: "🍛", restaurant: "infinity" },
        { id: "inf5", name: "Mixed Grill Platter", price: 350, emoji: "🍖", restaurant: "infinity" },
      ],
    },
  },
};

export default function FoodPage() {
  const { restaurant: restaurantParam } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [cart, setCart] = useState({});
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const restaurant = restaurantParam
    ? RESTAURANT_MENUS[restaurantParam]
    : null;

  useEffect(() => {
    if (restaurant && !activeTab) {
      const firstCategory = Object.keys(restaurant.items)[0];
      setActiveTab(firstCategory);
    }
  }, [restaurant, activeTab]);


  useEffect(() => {
    loadMyOrders();
  }, []);

  // Auto-dismiss order message after 3 seconds
  useEffect(() => {
    if (orderMessage) {
      const timer = setTimeout(() => {
        setOrderMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderMessage]);

  const loadMyOrders = async () => {
    setLoadingOrders(true);
    const response = await fetchMyOrders();
    console.log('[FoodPage] Order fetch response:', response);
    if (response.success) {
      setMyOrders(response.data || []);
    } else {
      console.error('[FoodPage] Failed to load orders:', response.error);
    }
    setLoadingOrders(false);
  };

  if (!restaurant) {
    return (
      <div className="space-y-8">
        <div className="glass-card p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Not Found</h1>
          <p className="text-slate-600">Please select a restaurant from the menu</p>
          <button
            onClick={() => navigate("/food")}
            className="btn-primary mx-auto"
          >
            ← Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const addItem = (item) => {
    if (cartRestaurant && cartRestaurant !== restaurantParam) {
      alert(`You can only order from one restaurant at a time. Clear your cart first.`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    setCartRestaurant(restaurantParam);
  };

  const removeItem = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });

    const cartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    if (cartItems === 1) setCartRestaurant(null);
  };

  const cartTotal = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = Object.values(restaurant.items)
      .flat()
      .find((i) => i.id === itemId);
    return total + (item?.price || 0) * qty;
  }, 0);

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const tabs = Object.keys(restaurant.items).map((key) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  const handlePlaceOrder = async () => {
    if (cartCount === 0 || isPlacingOrder) return;

    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
      const menuItem = Object.values(restaurant.items)
        .flat()
        .find((i) => i.id === itemId);

      return {
        itemId,
        itemName: menuItem?.name || "Unknown Item",
        price: menuItem?.price || 0,
        quantity,
      };
    });

    const payload = {
      restaurant: restaurantParam,
      items: orderItems,
      totalAmount: cartTotal,
    };

    console.log("[FoodPage] Place Order clicked", payload);
    setIsPlacingOrder(true);
    setOrderMessage(null);

    const response = await placeFoodOrder(payload);

    if (response.success) {
      console.log("[FoodPage] Order placed successfully", response.data);
      setOrderMessage({ type: "success", text: "Order placed successfully!" });
      setCart({});
      setCartRestaurant(null);
      // Reload orders to show the newly placed order
      await loadMyOrders();
    } else {
      console.error("[FoodPage] Order placement failed", response.error);
      setOrderMessage({
        type: "error",
        text: response.error || "Failed to place order",
      });
    }

    setIsPlacingOrder(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {restaurant.emoji} {restaurant.name}
            </h1>
            <p className="text-slate-600">Order from {restaurant.name}</p>
          </div>
          <button
            onClick={() => navigate("/food")}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition"
          >
            ← Change Restaurant
          </button>
        </div>
      </div>

      {/* Your Recent Orders Section */}
      <div className="space-y-4">
        <div className="glass-card p-6 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">📦 Your Recent Orders</h2>
          <p className="text-slate-600">Track your food orders</p>
        </div>

        {loadingOrders ? (
          <div className="glass-card p-8 text-center text-slate-600">
            Loading your orders...
          </div>
        ) : myOrders.filter(order => order.restaurant === restaurantParam).length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-600">
            No orders from this restaurant yet. Place your first order to see it here!
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.filter(order => order.restaurant === restaurantParam).slice(0, 3).map((order) => {
                const getStatusColor = (status) => {
                  const colors = {
                    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    accepted: "bg-blue-100 text-blue-800 border-blue-200",
                    in_progress: "bg-purple-100 text-purple-800 border-purple-200",
                    completed: "bg-green-100 text-green-800 border-green-200",
                    rejected: "bg-red-100 text-red-800 border-red-200",
                  };
                  return colors[status] || "bg-slate-100 text-slate-800 border-slate-200";
                };

                const getStatusLabel = (status) => {
                  const labels = {
                    pending: "Pending",
                    accepted: "Accepted",
                    in_progress: "Preparing",
                    completed: "Completed",
                    rejected: "Rejected",
                  };
                  return labels[status] || status;
                };

                return (
                  <div key={order.id} className="glass-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {order.restaurant.charAt(0).toUpperCase() +
                            order.restaurant.slice(1).replace("-", " ")}
                        </p>
                        <p className="text-xs text-slate-500">
                          Order ID: {order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700">
                      <p className="font-medium">Items:</p>
                      <ul className="ml-4 text-slate-600">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} ×{item.quantity} = ₹{item.price * item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2">
                      <span className="text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-blue-600">₹{order.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Tabs */}
      <div className="glass-card p-4 flex gap-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "tab-active bg-blue-100 text-blue-700"
                : "tab-inactive hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {activeTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurant.items[activeTab].map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="glass-card p-6 space-y-4">
                <div className="text-5xl text-center">{item.emoji}</div>
                <div className="space-y-1 text-center">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => addItem(item)}
                    className="btn-primary w-full"
                  >
                    + Add
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-bold text-slate-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => addItem(item)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg font-bold hover:bg-green-200"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 glass-card p-6 space-y-4 w-96 max-w-md">
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">
              🛒 Cart • {cartCount} item{cartCount > 1 ? "s" : ""}
            </p>
            <p className="text-2xl font-bold text-blue-600">Total: ₹{cartTotal}</p>
          </div>
          {orderMessage && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                orderMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {orderMessage.text}
            </div>
          )}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order →"}
          </button>
          <button
            onClick={() => {
              setCart({});
              setCartRestaurant(null);
            }}
            className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200"
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}
