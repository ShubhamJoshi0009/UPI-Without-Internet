import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy, Check } from 'lucide-react';
import type { LogEntry } from '../types';

interface ActivityConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ActivityConsole: React.FC<ActivityConsoleProps> = ({ logs, onClearLogs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.title} ${l.detail || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagClass = (type: LogEntry['type']) => {
    switch (type) {
      case 'inject':
        return 'tag-inject';
      case 'gossip':
        return 'tag-gossip';
      case 'bridge':
      case 'settled':
        return 'tag-bridge';
      case 'duplicate':
        return 'tag-duplicate';
      case 'tamper':
      case 'error':
        return 'tag-tamper';
      case 'reset':
        return 'tag-reset';
      default:
        return 'tag-info';
    }
  };

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            <Terminal size={14} color="#38bdf8" />
            <span>Protocol Audit &amp; Activity Log</span>
          </div>
        </div>

        <div className="terminal-actions">
          <button className="terminal-btn" onClick={handleCopyLogs} title="Copy all logs">
            {copied ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="terminal-btn" onClick={onClearLogs} title="Clear log output">
            <Trash2 size={11} /> Clear
          </button>
        </div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        {logs.map((log) => (
          <div key={log.id} className="terminal-row">
            <span className="terminal-time">[{log.timestamp}]</span>
            <span className={`terminal-tag ${getTagClass(log.type)}`}>
              {log.type}
            </span>
            <span className="terminal-text">
              {log.title}
              {log.detail && (
                <span className="code-preview" style={{ marginLeft: '6px' }}>
                  {log.detail}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
