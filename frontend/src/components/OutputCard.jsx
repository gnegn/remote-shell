import React from 'react';
import { Terminal } from './icons/jsx';

export default function OutputCard({ card }) {
  return (
    <div className="output-card">
      <div className="output-header">
        <div className='output-header-left'>
          {card.icon ? card.icon : <Terminal />}
          {card.command}
        </div>
        <div className='output-header-right'>
          <em>{card.server}</em>
        </div>
      </div>

      <div className="output-body">
        <pre>{card.text || '...'}</pre>
      </div>

      <div className={`output-status ${card.status}`}>
        {card.status === 'loading' && 'Loading...'}
        {card.status === 'complete' && 'Complete'}
        {card.status === 'error' && 'Error'}
      </div>
    </div>
  );
}
