import React, { useEffect, useState } from 'react';
import { DataNotFound } from './icons/jsx';

export default function UserServers({ setServerId }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch('/api/user-servers', {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
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
        <DataNotFound />
        <p>Тут поки що пусто</p>
      </div>
    );
  }

  return (
    <div className='server-list'>
      {servers.map((s) => (
        <p key={s.id} onClick={() => setServerId(s.id)}>
          {s.name} ({s.one_c_name})
        </p>
      ))}
    </div>
  );
}
