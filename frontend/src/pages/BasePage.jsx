import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';

const API_BASE = "/api";

function formatExactDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
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
      const res = await fetch(`${API_BASE}/servers`);
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
    icon: 'warning',
    title: 'Missing fields',
    text: 'Please fill all required fields',
  });
  return;
}

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        "remote-url": form.remoteUrl.trim(),
        "usable-by": form.usableBy.trim(),
        "created-by": form.createdBy.trim(),
        "1c-name": form.oneCName.trim() || null,
      };

      const res = await fetch(`${API_BASE}/servers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      <div>
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
            <button
              type="submit"
              disabled={submitting}
              className="submit-button"
            >
              {submitting ? "Adding..." : "Add server"}
            </button>
            <button type="button" onClick={fetchServers} className="refresh-button">Refresh</button>
            {error && <div>{error}</div>}
          </div>

        </form>

      </div>

      <div className="table-container">
  {loading ? (
    <div className="table-message">Loading...</div>
  ) : servers.length === 0 ? (
    <div className="table-message">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="data-not-found">
        <path fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round" d="M23.5,27.5H6.5l-1-15.19a.76.76,0,0,1,.77-.81H10a1.11,1.11,0,0,1,.89.44l1.22,1.56H23.5v2"></path>
        <path fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round" d="M26.3,20.7l.84-3.2H9.25L6.5,27.5H23.41a1.42,1.42,0,0,0,1.37-1.06l.76-2.88"></path>
        <path fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round" d="M16.5,24.5h0a1.42,1.42,0,0,1,2,0h0"></path>
        <line x1="13.5" x2="14.5" y1="21.5" y2="21.5" fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round"></line>
        <line x1="20.5" x2="21.5" y1="21.5" y2="21.5" fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round"></line>
        <path fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round" d="M20.62,3.61C18.25,4,16.5,5.37,16.5,7a2.57,2.57,0,0,0,.7,1.7l-.7,2.8,2.86-1.43A8.12,8.12,0,0,0,22,10.5c3,0,5.5-1.57,5.5-3.5,0-1.6-1.69-2.95-4-3.37"></path>
        <line x1="21.25" x2="22.75" y1="6.25" y2="7.75" fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round"></line>
        <line x1="22.75" x2="21.25" y1="6.25" y2="7.75" fill="none" stroke="#29abe2" stroke-linecap="round" stroke-linejoin="round"></line>
      </svg>
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
