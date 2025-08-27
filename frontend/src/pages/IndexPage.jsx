import React, { useState } from 'react';
import CommandList from '../components/CommandList';
import UserServers from '../components/UserServers';

export default function IndexPage() {
  const [serverId, setServerId] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [result, setResult] = useState('');

  const sendCommand = async () => {
    if (!serverId || !commandInput) {
      alert('Введіть serverId і команду');
      return;
    }
    await fetch('/api/send-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server_id: parseInt(serverId), command: commandInput })
    });
  };

  const fetchResult = async () => {
    if (!serverId) return;
    const res = await fetch(`/api/get-result/${serverId}`);
    const data = await res.json();
    setResult(data.result || '');
  };

  return (
    <div className="content">
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
        />
      </div>
    </div>
  );
}
