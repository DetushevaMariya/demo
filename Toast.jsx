import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const styles = {
    success: { bg: '#22c55e', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    info: { bg: '#3b82f6', icon: 'ℹ' },
  }[type];

  return (
    <div 
      className="toast animate-fade" 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: styles.bg, 
        color: 'white', 
        padding: '12px 20px', 
        borderRadius: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{styles.icon}</span>
      <span>{message}</span>
      <button 
        onClick={() => { setVisible(false); onClose?.(); }}
        style={{ 
          marginLeft: '10px', 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          fontSize: '18px', 
          cursor: 'pointer',
          opacity: 0.8,
          padding: '0 4px'
        }}
      >
        ×
      </button>
    </div>
  );
}