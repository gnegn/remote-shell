import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { authFetch, clearToken } from "../auth"; // <- коректні назви

function formatExactDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function BasePage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    remoteUrl: "",
    usableBy: "",
    createdBy: "",
    oneCName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/servers");
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setServers(data);
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const onSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.name.trim() || !form.remoteUrl.trim() || !form.createdBy.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Missing fields",
      text: "Please fill all required fields",
    });
    return;
  }

  setSubmitting(true);
  try {
    const payload = {
      name: form.name.trim(),
      "remote-url": form.remoteUrl.trim(),
      "created-by": form.createdBy.trim(),
      "1c-name": form.oneCName.trim() || null,
      "usable-by": form.usableBy.trim() || null,
    };

    const res = await authFetch("/api/servers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to add server");
    }

    await fetchServers();
    setForm({ name: "", remoteUrl: "", usableBy: "", createdBy: "", oneCName: "" });
  } catch (e) {
    setError(e.message || "Unknown error");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="container">
      <h1 className="h1-title">База серверів</h1>

      <form onSubmit={onSubmit} className="flex-form">
        <div className="input-wrapper">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Name (eng)"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            name="remoteUrl"
            value={form.remoteUrl}
            onChange={onChange}
            placeholder="Remote URL (where agent polls, e.g. https://center.example/api)"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            name="usableBy"
            value={form.usableBy}
            onChange={onChange}
            placeholder="Usable by (comma-separated usernames)"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            name="createdBy"
            value={form.createdBy}
            onChange={onChange}
            placeholder="Created by (your name, eng)"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            name="oneCName"
            value={form.oneCName}
            onChange={onChange}
            placeholder="1C name (legal, ukr)"
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex-buttons">
          <button type="submit" disabled={submitting} className="submit-button">
            {submitting ? "Adding..." : "Add server"}
          </button>
          <button type="button" onClick={fetchServers} className="refresh-button">
            Refresh
          </button>
          {error && <div>{error}</div>}
        </div>
      </form>

      <div className="table-container">
        {loading ? (
          <div className="table-message">Loading...</div>
        ) : servers.length === 0 ? (
          <div className="table-message">
            <p>Тут поки що пусто</p>
          </div>
        ) : (
          <table className="server-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Remote URL</th>
                <th>Usable by</th>
                <th>Created at</th>
                <th>Created by</th>
                <th>1C name</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td className="break-word">{s["remote-url"]}</td>
                  <td>{s["usable-by"]}</td>
                  <td>{formatExactDate(s["created-at"])}</td>
                  <td>{s["created-by"]}</td>
                  <td>{s["1c-name"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
