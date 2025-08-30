import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { authFetch } from "../auth";
import { Add, PersonAdd, PersonRemove } from "../components/icons/jsx";

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
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Додано для збереження запиту пошуку

  const fetchServers = async () => {
    setLoading(true);
    setError("");
    try {
      const [allRes, userRes] = await Promise.all([
        authFetch("/api/servers"),
        authFetch("/api/user-servers"),
      ]);

      if (!allRes.ok) throw new Error(`Servers fetch failed: ${allRes.status}`);
      if (!userRes.ok) throw new Error(`User servers fetch failed: ${userRes.status}`);

      const allData = await allRes.json();
      const userData = await userRes.json();

      setServers(allData);
      setUserServers(userData.map((s) => s.id));
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Функція для пошуку серверів по ID, Name, Remote URL, Created by та 1C name
  const filteredServers = servers.filter((server) => {
    const query = searchQuery.toLowerCase();
    return (
      server.name.toLowerCase().includes(query) ||
      server["remote-url"].toLowerCase().includes(query) ||
      server["created-by"].toLowerCase().includes(query) ||
      server["1c-name"].toLowerCase().includes(query) ||
      server.id.toString().includes(query) // Пошук по ID
    );
  });

  const assignServer = async (serverId) => {
    try {
      const res = await authFetch("/api/assign-server", {
        method: "POST",
        body: JSON.stringify({ server_id: serverId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign");

      Swal.fire({
        icon: "success",
        title: "Assigned",
        text: `Server ${serverId} assigned to you`,
      });
      await fetchServers();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const unassignServer = async (serverId) => {
    try {
      const res = await authFetch(`/api/unassign-server/${serverId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unassign");

      Swal.fire({
        icon: "success",
        title: "Unassigned",
        text: `Server ${serverId} unassigned`,
      });
      await fetchServers();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const openAddServerModal = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Додати новий сервер",
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name (eng)">` +
        `<input id="swal-remoteUrl" class="swal2-input" placeholder="Remote URL">` +
        `<input id="swal-createdBy" class="swal2-input" placeholder="Created by (your name, eng)">` +
        `<input id="swal-oneCName" class="swal2-input" placeholder="1C name (legal, ukr)">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Додати сервер",
      cancelButtonText: "Відмінити",
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const remoteUrl = document.getElementById("swal-remoteUrl").value.trim();
        const createdBy = document.getElementById("swal-createdBy").value.trim();
        const oneCName = document.getElementById("swal-oneCName").value.trim();

        if (!name || !remoteUrl || !createdBy) {
          Swal.showValidationMessage("Будь ласка, заповніть обов'язкові поля");
          return null;
        }
        return { name, remoteUrl, createdBy, oneCName };
      },
    });

    if (formValues) {
      setSubmitting(true);
      try {
        const payload = {
          name: formValues.name,
          "remote-url": formValues.remoteUrl,
          "created-by": formValues.createdBy,
          "1c-name": formValues.oneCName || null,
        };

        const res = await authFetch("/api/servers", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to add server");
        }

        Swal.fire({
          icon: "success",
          title: "Сервер додано",
        });

        await fetchServers();
      } catch (e) {
        Swal.fire({ icon: "error", title: "Помилка", text: e.message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="container">
      <div className="server-table-header">
        <input
          className="server-search-input"
          placeholder="Search servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Оновлення запиту пошуку
        />
        <button
          onClick={openAddServerModal}
          className="server-add-btn"
        >
          <Add /> Додати сервер
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="table-message">Loading...</div>
        ) : filteredServers.length === 0 ? (
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
                <th>Users</th>
                <th>Created at</th>
                <th>Created by</th>
                <th>1C name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServers.map((s) => {
                const isAssigned = userServers.includes(s.id);
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td className="break-word">{s["remote-url"]}</td>
                    <td>{s.users && s.users.length > 0 ? s.users.join(", ") : "—"}</td>
                    <td>{formatExactDate(s["created-at"])}</td>
                    <td>{s["created-by"]}</td>
                    <td>{s["1c-name"]}</td>
                    <td>
                      {isAssigned ? (
                        <button
                          onClick={() => unassignServer(s.id)}
                          className="unassign-btn"
                        >
                          <PersonRemove /> Unassign
                        </button>
                      ) : (
                        <button
                          onClick={() => assignServer(s.id)}
                          className="assign-btn"
                        >
                          <PersonAdd />Assign
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
