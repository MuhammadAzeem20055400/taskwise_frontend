import React, { useState } from 'react';
import Icon from './Icon';

const TodoItem = ({ todo, onToggle, onDelete, onUpdate, isEditing, setEditing }) => {
  const [editData, setEditData] = useState({ title: todo.title, description: todo.description });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      personal: '👤',
      work: '💼',
      learning: '📚',
      health: '🏃',
      finance: '💰'
    };
    return icons[category] || '📝';
  };

  const handleSave = () => {
    onUpdate(todo._id, editData);
  };

  return (
    <div
      className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
      draggable
    >
      <div className="todo-priority-bar" style={{ backgroundColor: getPriorityColor(todo.priority) }}></div>
      
      <div className="todo-header">
        <button
          onClick={() => onToggle(todo._id, todo.completed)}
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        >
          {todo.completed && <Icon name="check" size={14} />}
        </button>

        <div className="todo-meta">
          <span className="todo-category">
            {getCategoryIcon(todo.category)} {todo.category}
          </span>
          <span className="todo-priority">
            {todo.priority}
          </span>
        </div>

        <div className="todo-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="action-btn save">
                <Icon name="save" size={14} />
              </button>
              <button onClick={() => setEditing(null)} className="action-btn cancel">
                <Icon name="x" size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(todo._id)} className="action-btn edit">
                <Icon name="edit" size={14} />
              </button>
              <button onClick={() => onDelete(todo._id)} className="action-btn delete">
                <Icon name="trash" size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="todo-content">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="edit-title"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="edit-description"
              rows="2"
            />
          </>
        ) : (
          <>
            <h3 className="todo-title">{todo.title}</h3>
            {todo.description && <p className="todo-description">{todo.description}</p>}
          </>
        )}
      </div>

      <div className="todo-footer">
        <span className="todo-date">
          <Icon name="calendar" size={12} />
          {new Date(todo.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default TodoItem;