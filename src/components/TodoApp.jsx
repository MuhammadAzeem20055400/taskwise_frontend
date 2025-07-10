import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Icon from './Icon';
import TodoItem from './TodoItem';
import { get, post, put, del } from '../services/apiService';

const TodoApp = () => {
  const { user, logout, darkMode, toggleDarkMode } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', category: 'personal', priority: 'medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const categories = ['personal', 'work', 'learning', 'health', 'finance'];
  const priorities = ['low', 'medium', 'high'];

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await get('/todos');
      setTodos(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setLoading(true);
    try {
      const data = await post('/todos', newTodo);
      setTodos([data, ...todos]);
      setNewTodo({ title: '', description: '', category: 'personal', priority: 'medium' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const data = await put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => todo._id === id ? data : todo));
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await del(`/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const data = await put(`/todos/${id}`, updates);
      setTodos(todos.map(todo => todo._id === id ? data : todo));
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  };

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'completed' && todo.completed) ||
                           (filter === 'pending' && !todo.completed) ||
                           (filter === todo.category);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    highPriority: todos.filter(t => t.priority === 'high').length
  };

  return (
    <div className="todo-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <h1>TaskWise</h1>
          </div>
          <div className="header-stats" onClick={() => setShowStats(!showStats)}>
            <div className="stat-item">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button onClick={toggleDarkMode} className="icon-btn theme-btn">
            <Icon name={darkMode ? 'sun' : 'moon'} size={20} />
          </button>
          <div className="user-menu">
            <div className="user-avatar">
              <Icon name="user" size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <button onClick={logout} className="logout-btn">
                <Icon name="logout" size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {showStats && (
        <div className="stats-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <h3>{stats.highPriority}</h3>
                <p>High Priority</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="controls-bar">
        <div className="search-container">
          <Icon name="search" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Active</option>
            <option value="completed">Completed</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-btn"
        >
          <Icon name="plus" size={20} />
          Add Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          <Icon name="x" size={16} />
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={addTodo} className="todo-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="title-input"
                required
              />
            </div>
            
            <div className="form-row">
              <textarea
                placeholder="Add a description..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="description-input"
                rows="3"
              />
            </div>

            <div className="form-row">
              <select
                value={newTodo.category}
                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                className="priority-select"
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)} Priority
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <div className="spinner small"></div> : <Icon name="plus" size={16} />}
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="todos-container">
        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
                isEditing={editingId === todo._id}
                setEditing={setEditingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;