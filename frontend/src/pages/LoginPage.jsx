import React, { useState } from "react";
import { setToken } from "../auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
      }

      const data = await res.json();
      const token = data.token || data.access_token;
      if (token) {
        setToken(token);
        window.location.href = "/";
      } else {
        throw new Error("Token not received");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
          Remote Shell
        </h1>
        <p className="text-center text-gray-500 mb-8">Логін до системи</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-red-500 text-center font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
