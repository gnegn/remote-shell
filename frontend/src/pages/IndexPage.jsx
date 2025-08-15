import React, { useState } from 'react';
import CommandList from '../components/CommandList';

export default function IndexPage() {
  const [serverId, setServerId] = useState('');
  const [commandInput, setCommandInput] = useState(''); 
  const [result, setResult] = useState('');

  const sendCommand = async () => {
    if (!serverId) {
      alert('Введіть Server ID');
      return;
    }

    if (!commandInput) {
      alert('Введіть команду або оберіть скрипт');
      return;
    }

    // Визначаємо, чи це скрипт (шлях закінчується на .ps1)
    const payload = { server_id: parseInt(serverId) };
    if (commandInput.endsWith('.ps1')) {
      payload.script = commandInput;
    } else {
      payload.command = commandInput;
    }

    try {
      const res = await fetch('/api/send-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Команда успішно надіслана!');
        setCommandInput(''); 
      } else {
        const err = await res.json();
        alert('Помилка: ' + JSON.stringify(err));
      }
    } catch (e) {
      alert('Помилка при відправці: ' + e.message);
    }
  };

  const fetchResult = async () => {
    if (!serverId) return;
    try {
      const res = await fetch(`/api/get-result/${serverId}`);
      const data = await res.json();
      setResult(data.result || '');
    } catch (e) {
      alert('Помилка при отриманні результату: ' + e.message);
    }
  };

  return (
    <div className="content">
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
        <button onClick={fetchResult} style={{ marginLeft: '10px' }}>
          Отримати результат
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
    </div>
  );
}
