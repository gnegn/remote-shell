import React, { useState } from 'react';
import CommandList from '../components/CommandList';
import UserServers from '../components/UserServers';
import { Delete, Terminal } from '../components/icons/jsx';
import OutputCard from '../components/OutputCard';
import { authFetch } from '../auth';

export default function IndexPage() {
  const [serverIds, setServerIds] = useState([]);
  const [serverNames, setServerNames] = useState([]);
  const [commandInput, setCommandInput] = useState({ command: '', script: '', icon: null });
  const [outputs, setOutputs] = useState([]);

  const sendCommand = async () => {
    if (serverIds.length === 0 || !commandInput.script) {
      alert('Оберіть сервер і введіть команду');
      return;
    }

    serverIds.forEach((id, index) => {
      const serverName = serverNames[index] || `Server ${id}`;
      const cardId = Date.now() + '-' + id;

      // Add card in "loading" state
      setOutputs(prev => [
        ...prev,
        {
          id: cardId,
          command: commandInput.command, // friendly name
          icon: commandInput.icon,       // folder icon
          server: serverName,
          text: '',
          status: 'loading'
        }
      ]);

      // Send actual script to server
      authFetch('/api/send-command', {
        method: 'POST',
        body: JSON.stringify({ server_id: parseInt(id), command: commandInput.script }),
      })
        .then(res => res.text())
        .then(data => {
          setOutputs(prev =>
            prev.map(card =>
              card.id === cardId
                ? { ...card, text: data, status: 'complete' }
                : card
            )
          );
        })
        .catch(err => {
          setOutputs(prev =>
            prev.map(card =>
              card.id === cardId
                ? { ...card, text: err.message, status: 'error' }
                : card
            )
          );
        });
    });
  };

  const clearOutputs = () => setOutputs([]);

  return (
    <div className="content">
      <div className="command-section">
        <div className="input-wrapper">
          <div className="flex">
            <h2 className="h2-margin">Команда / Скрипт:</h2>
            <input
              value={commandInput.command} // friendly name
              onChange={(e) =>
                setCommandInput({ command: e.target.value, script: e.target.value, icon: null })
              }
              placeholder="Наприклад, basic/sys-info.ps1 або dir"
              className="command-input"
            />
          </div>

          <div className="button-wrapper">
            <button onClick={sendCommand} className="send-btn">Надіслати</button>
            <button onClick={clearOutputs} className="clear-btn">
              <Delete width="1.5rem" height="1.5rem" />
            </button>
          </div>
        </div>

        <div className="command-wrapper">
          <CommandList setCommandInput={setCommandInput} />
          <UserServers
            setServerId={setServerIds}
            setServerName={setServerNames}
            multiple={true}
          />
        </div>
      </div>

      {/* Output cards */}
      <div className="output-section">
          {outputs.map((card) => (
            <OutputCard key={card.id} card={card} />
          ))}
      </div>

    </div>
  );
}
