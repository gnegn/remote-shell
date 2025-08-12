import React, { useState } from 'react';

export default function IndexPage() {
  const [serverId, setServerId] = useState('');
  const [command, setCommand] = useState('');
  const [result, setResult] = useState('');

  const sendCommand = async () => {
    if (!serverId || !command) {
      alert('Введіть serverId і команду');
      return;
    }
    await fetch('/api/send-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server_id: parseInt(serverId), command })
    });
  };

  const fetchResult = async () => {
    if (!serverId) return;
    const res = await fetch(`/api/get-result/${serverId}`);
    const data = await res.json();
    setResult(data.result || '');
  };

  return (
    <div style={{ marginTop: '5rem' }}>
      <h1>Керування серверами</h1>

      <div>
        <label>Server ID:</label>
        <input value={serverId} onChange={e => setServerId(e.target.value)} />
      </div>

      <div>
        <label>Command:</label>
        <input value={command} onChange={e => setCommand(e.target.value)} />
      </div>

      <div>
        <button onClick={sendCommand}>Надіслати команду</button>
        <button onClick={fetchResult}>Отримати результат</button>
      </div>

      <div>
        <h3>Результат:</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
}
