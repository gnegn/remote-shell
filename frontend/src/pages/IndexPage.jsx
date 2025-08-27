import React, { useState } from 'react';
import CommandList from '../components/CommandList';
import UserServers from '../components/UserServers';
import { Delete } from '../components/icons/jsx';

export default function IndexPage() {
  const [serverId, setServerId] = useState('');
  const [serverName, setServerName] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [result, setResult] = useState('');

  const sendCommand = async () => {
    if (!serverId || !commandInput) {
      alert('Оберіть сервер і введіть команду');
      return;
    }

    await fetch('/api/send-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server_id: parseInt(serverId), command: commandInput })
    });

    const res = await fetch(`/api/get-result/${serverId}`);
    const data = await res.json();
    setResult(data.result || '');
  };

  return (
    <div className="content">
      <div className="command-section">
        <div className="input-wrapper">

          {/* Only show selected server if one is chosen */}
          {serverId && (
            <p className="selected-server">
              Обраний сервер: <strong>{serverName || serverId}</strong>
            </p>
          )}

          <div className="flex">
            <h2 className='h2-margin'>Команда / Скрипт:</h2>
            <input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Наприклад, basic/sys-info.ps1 або dir"
              className="command-input"
            />
          </div>

          <div className="button-wrapper">
              <button onClick={sendCommand} className='send-btn'>Надіслати</button>
              <button onClick={() => setResult('')} className='clear-btn'><Delete width="1.5rem" height="1.5rem" /></button>
          </div>
        </div>

        <div className="command-wrapper">

          <CommandList setCommandInput={setCommandInput} />
          
          <UserServers
            setServerId={(id) => setServerId(id)}
            setServerName={(name) => setServerName(name)}
          />
          
        </div>
      </div>

      <div className="output-section">
        <textarea value={result} readOnly />
      </div>
    </div>
  );
}
