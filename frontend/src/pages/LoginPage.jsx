import React, { useState } from "react";
import { setToken } from "../auth";
import { Account, Lock, Close } from "../components/icons/jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [usernameFocus, setUsernameFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);

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
      localStorage.setItem("username", data.username);
      localStorage.setItem("visible_name", data.visible_name);
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
    <div className="login-page-container">
      <div className="login-box">
        <h2 className="h2-margin">Вхід у систему</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin} className="form">
          {/* Username input */}
          <div className="input-wrapper">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              required
            />
            {!username && !usernameFocus && (
              <>
                <span className="icon"><Account /></span>
                <span className="placeholder-text">Ім'я користувача</span>
              </>
            )}
            {username && (
              <span className="clear-icon" onClick={() => setUsername("")}>
                <Close />
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              required
            />
            {!password && !passwordFocus && (
              <>
                <span className="icon"><Lock /></span>
                <span className="placeholder-text">Пароль</span>
              </>
            )}
            {password && (
              <span className="clear-icon" onClick={() => setPassword("")}>
                <Close />
              </span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </div>
    </div>
  );
}
