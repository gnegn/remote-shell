import React, { useState } from 'react';
import CommandList from '../components/CommandList';
<<<<<<< HEAD
import { authFetch } from '../auth';
=======
import UserServers from '../components/UserServers';
>>>>>>> front

export default function IndexPage() {
  const [serverId, setServerId] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [result, setResult] = useState('');
  const [loadingResult, setLoadingResult] = useState(false);

  const sendCommand = async () => {
<<<<<<< HEAD
    if (!serverId) {
      alert('Введіть Server ID');
      return;
    }
    if (!commandInput) {
      alert('Введіть команду або оберіть скрипт');
      return;
    }

    const payload = { server_id: parseInt(serverId) };
    if (commandInput.endsWith('.ps1')) {
      payload.script = commandInput;
    } else {
      payload.command = commandInput;
    }

    try {
      const res = await authFetch('/api/send-command', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Команда успішно надіслана!');
        setCommandInput('');
      } else {
        const errText = await res.text();
        alert('Помилка: ' + errText);
      }
    } catch (e) {
      alert('Помилка при відправці: ' + e.message);
    }
=======
    if (!serverId || !commandInput) {
      alert('Введіть serverId і команду');
      return;
    }
    await fetch('/api/send-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server_id: parseInt(serverId), command: commandInput })
    });
>>>>>>> front
  };

  const fetchResult = async () => {
    if (!serverId) return;
    setLoadingResult(true);
    try {
      const res = await authFetch(`/api/get-result/${serverId}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setResult(data.result || '');
    } catch (e) {
      alert('Помилка при отриманні результату: ' + e.message);
    } finally {
      setLoadingResult(false);
    }
  };

  return (
    <div className="content">
<<<<<<< HEAD
      <h1 className="h1-title">Керування серверами</h1>

      <div className="command-wrapper">
        <CommandList setCommandInput={setCommandInput} />
      </div>

      <div>
        <label>Server ID:</label>
        <input
          type="number"
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
        />
      </div>

      <div>
        <label>Команда / Скрипт:</label>
        <input
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Наприклад, basic/sys-info.ps1 або dir"
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={sendCommand}>Надіслати команду</button>
        <button onClick={fetchResult} style={{ marginLeft: '10px' }} disabled={loadingResult}>
          {loadingResult ? 'Завантаження...' : 'Отримати результат'}
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Результат:</label>
        <textarea
          value={result}
          readOnly
          rows={10}
          style={{ width: '100%' }}
        />
      </div>
=======
      <div className='command-section'>
        <div className='input-wrapper'>

          <div className='flex'>
            <label>Server ID:</label>
            <input value={serverId} onChange={e => setServerId(e.target.value)} />
          </div>

          <div className='flex'>
            <label>Команда / Скрипт:</label>
            <input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Наприклад, basic/sys-info.ps1 або dir"
            />
          </div>

          <div className='button-wrapper'>
            <button onClick={sendCommand}>Надіслати команду</button>
            <button onClick={fetchResult}>Отримати результат</button>
          </div>
        </div>

        <div className="command-wrapper">
          <CommandList setCommandInput={setCommandInput} />
          <UserServers setServerId={setServerId} />
        </div>
      </div>

      <div className='output-section'>
        <textarea
          value={result}
          readOnly
          rows={10}
        />
      </div>
>>>>>>> front
    </div>
  );
}
