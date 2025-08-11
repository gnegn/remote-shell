import React, { useEffect, useState } from "react";

const API_BASE = "/api";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
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
      setError("Please fill Name, Remote URL and Created By");
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">База серверів</h1>
      <p className="mb-6 text-sm text-gray-600">Список серверів, їх параметри та форма додавання нового сервера.</p>

      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add server"}
            </button>
            <button type="button" onClick={fetchServers} className="px-3 py-2 border rounded">Refresh</button>
            {error && <div className="text-red-600 ml-4">{error}</div>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : servers.length === 0 ? (
          <div className="p-6">No servers yet.</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Remote URL</th>
                <th className="px-4 py-2">Usable by</th>
                <th className="px-4 py-2">Created at</th>
                <th className="px-4 py-2">Created by</th>
                <th className="px-4 py-2">1C name</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 align-top">{s.id}</td>
                  <td className="px-4 py-2 align-top">{s.name}</td>
                  <td className="px-4 py-2 align-top break-words max-w-xs">{s["remote-url"]}</td>
                  <td className="px-4 py-2 align-top">{s["usable-by"]}</td>
                  <td className="px-4 py-2 align-top">{formatDate(s["created-at"])}</td>
                  <td className="px-4 py-2 align-top">{s["created-by"]}</td>
                  <td className="px-4 py-2 align-top">{s["1c-name"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Notes: component expects API at <code>{API_BASE}/servers</code> serving the schema requested (hyphenated keys in JSON).</p>
      </div>
    </div>
  );
}
