import React, { useState } from 'react';
import CommandList from '../components/CommandList';
import UserServers from '../components/UserServers';
import { Delete } from '../components/icons/jsx';
import { authFetch } from '../auth';  // Імпортуємо authFetch

export default function IndexPage() {
  const [serverIds, setServerIds] = useState([]); // CHANGED: now an array for multiple selection
  const [serverNames, setServerNames] = useState([]); // optional, for multiple names
  const [commandInput, setCommandInput] = useState('');
  const [result, setResult] = useState('');

  const sendCommand = async () => {
    if (serverIds.length === 0 || !commandInput) { // CHANGED: check array length instead of single id
      alert('Оберіть сервер і введіть команду');
      return;
    }

    // CHANGED: send command to all selected servers using authFetch
    for (let id of serverIds) {
      await authFetch('/api/send-command', {
        method: 'POST',
        body: JSON.stringify({ server_id: parseInt(id), command: commandInput })
      });

      // CHANGED: appending result message from multiple servers without fetching again
      setResult(prev => prev + `\n[Server ${id}]: Команда надіслана.\n`);
    }
  };

  return (
    <div className="content">
      <div className="command-section">
        <div className="input-wrapper">

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
              <button onClick={() => setResult('')} className='clear-btn'>
                <Delete width="1.5rem" height="1.5rem" />
              </button>
          </div>
        </div>

        <div className="command-wrapper">

          <CommandList setCommandInput={setCommandInput} />
          
          <UserServers
            setServerId={setServerIds}    // CHANGED: pass array setter for multiple selection
            setServerName={setServerNames} // optional
            multiple={true}                // CHANGED: optional prop to indicate multi-select
          />
          
        </div>
      </div>

      <div className="output-section">
        <textarea value={result} readOnly />
      </div>
    </div>
  );
}
