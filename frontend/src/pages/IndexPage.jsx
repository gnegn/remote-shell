import React, { useState } from 'react';
import CommandList from '../components/CommandList';
import UserServers from '../components/UserServers';

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
<<<<<<< Updated upstream
    <div className='content'>
      <h1 className="h1-title">Керування серверами</h1>
<div className='command-wrapper'>
      <CommandList setCommandInput={setCommand} />
</div>
      <div>
=======
    <div className="content">

      <div className='command-section'>

      <div className='input-wrapper'>

      <div className='flex'>
>>>>>>> Stashed changes
        <label>Server ID:</label>
        <input value={serverId} onChange={e => setServerId(e.target.value)} />
      </div>

<<<<<<< Updated upstream
      <div>
        <label>Command:</label>
        <input value={command} onChange={e => setCommand(e.target.value)} />
      </div>

      <div>
=======
      <div className='flex'>
        <label>Команда / Скрипт:</label>
        <input
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Наприклад, basic/sys-info.ps1 або dir"
        />
      </div>

      <div className='button-wrapper'>
>>>>>>> Stashed changes
        <button onClick={sendCommand}>Надіслати команду</button>
        <button onClick={fetchResult}>Отримати результат</button>
      </div>

<<<<<<< Updated upstream
      <div>
      <label>Результат:</label>
      <textarea
        value={result}
        onChange={(e) => setResult(e.target.value)}
      />
=======
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
>>>>>>> Stashed changes
      </div>
      
    </div>
  );
}
