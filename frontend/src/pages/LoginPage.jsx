import React, { useState, useEffect } from "react";

export default function LoginPage({ onLogin, isLoading, authError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setError(authError || "");
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLocalLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLocalLoading(false);
    }
  };

  const isSubmitting = localLoading || isLoading;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.65)), url(/bennett.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={backgroundStyle}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-5xl mb-4">🎓</div>
            <h1 className="text-3xl font-bold text-slate-900">UniEase</h1>
            <p className="text-slate-600">University Student Portal</p>
            <p className="text-sm text-slate-500 mt-1">Bennett University</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Role is detected automatically from email.</p>
              <p>Examples: admin@bennett.edu.in, laundry@bennett.edu.in, southern-stories@bennett.edu.in</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                University Email
              </label>
              <input
                type="email"
                placeholder="your.email@bennett.edu.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white/70 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white/70 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Demo:</span> Use any email + 4+ char password
            </p>
            <p className="text-xs text-slate-500">Auto-registration on first login</p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>🔒</span> Secure & Encrypted
        </div>
      </div>
    </div>
  );
}
