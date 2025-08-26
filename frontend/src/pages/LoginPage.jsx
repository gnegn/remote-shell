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
    <div className="container">
      <h1 className="h1-title">Логін</h1>
      <form onSubmit={handleLogin} className="flex-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
