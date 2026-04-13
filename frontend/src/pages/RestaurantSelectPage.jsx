import React from "react";
import { useNavigate } from "react-router-dom";

const RESTAURANTS = [
  { id: "quench", name: "Quench", emoji: "🥤", color: "bg-cyan-50" },
  { id: "southern-stories", name: "Southern Stories", emoji: "🍲", color: "bg-orange-50" },
  { id: "nescafe", name: "Nescafe", emoji: "☕", color: "bg-amber-50" },
  { id: "dominos", name: "Dominos", emoji: "🍕", color: "bg-red-50" },
  { id: "subway", name: "Subway", emoji: "🥪", color: "bg-yellow-50" },
  { id: "sneapeats", name: "Sneapeats", emoji: "🍽️", color: "bg-purple-50" },
  { id: "infinity", name: "Infinity", emoji: "♾️", color: "bg-indigo-50" },
];

export default function RestaurantSelectPage() {
  const navigate = useNavigate();

  const handleSelectRestaurant = (restaurantId) => {
    navigate(`/food/${restaurantId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">🍽️ Food Order</h1>
        <p className="text-slate-600">Select a restaurant to view their menu</p>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESTAURANTS.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => handleSelectRestaurant(restaurant.id)}
            className={`${restaurant.color} glass-card p-8 space-y-4 hover:shadow-lg transition-all text-center cursor-pointer group`}
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">
              {restaurant.emoji}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600">
              {restaurant.name}
            </h2>
            <p className="text-sm text-slate-600">View Menu →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
