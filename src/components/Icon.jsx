import React from 'react';

const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    search: '🔍',
    plus: '➕',
    moon: '🌙',
    sun: '☀️',
    user: '👤',
    logout: '🚪',
    calendar: '📅',
    trash: '🗑️',
    check: '✓',
    edit: '✏️',
    save: '💾',
    x: '✕'
  };
  
  return <span className={`icon ${className}`} style={{ fontSize: size }}>{icons[name] || '❓'}</span>;
};

export default Icon;