import React, { useEffect, useState } from 'react';
import { DataNotFound } from './icons/jsx';

export default function UserServers({ setServerId }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // CHANGED: track active server

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch('/api/user-servers', {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("authToken")
          }
        });
        if (!res.ok) throw new Error("Failed to fetch servers");
        const data = await res.json();
        setServers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  if (loading) return <p>Loading servers...</p>;

  if (servers.length === 0) {
    return (
      <div className="table-message">
        <h2 className='h2-margin'>Сервери</h2>
        <DataNotFound />
        <p>Тут поки що пусто</p>
      </div>
    );
  }

  const handleSelect = (id) => { // CHANGED
    setSelectedId(id);
    setServerId(id);
  };

  return (
    <div className='server-list'>
      <h2 className='h2-margin'>Сервери</h2>

      {servers.map((s) => (
        <p
          key={s.id}
          onClick={() => handleSelect(s.id)} // CHANGED
          className={`server-item ${selectedId === s.id ? "active" : ""}`} // CHANGED
        >
          {s.name} ({s.one_c_name})
        </p>
      ))}
    </div>
  );
}
