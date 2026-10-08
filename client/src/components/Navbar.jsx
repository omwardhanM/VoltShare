import React from 'react';
import { Zap, Sun, Moon, ShoppingBag, Award, User, RefreshCw } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  users, 
  currentUser, 
  onSelectUser, 
  theme, 
  onToggleTheme,
  onRefresh
}) {
  return (
    <nav className="navbar">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Zap size={18} />
        </div>
        <div className="brand-title">
          <span>VoltShare</span>
          <span className="brand-badge">SDG 7 CPS</span>
        </div>
      </div>

      <div className="nav-tabs">
        <button 
          id="tab-marketplace"
          className={`nav-tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <ShoppingBag size={14} />
          <span>Market</span>
        </button>

        <button 
          id="tab-impact"
          className={`nav-tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          <Award size={14} />
          <span>Impact</span>
        </button>

        <button 
          id="tab-wallet"
          className={`nav-tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <User size={14} />
          <span>Portfolio</span>
        </button>
      </div>

      <div className="nav-actions">
        {/* User Switcher: Solar Producer vs Energy Buyer */}
        <div className="user-selector" title="Switch active persona">
          <User size={14} color="var(--accent-primary)" />
          <select 
            id="user-persona-select"
            value={currentUser ? currentUser.id : ''}
            onChange={(e) => onSelectUser(Number(e.target.value))}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'prosumer' ? 'Solar Producer' : u.role === 'consumer' ? 'Energy Buyer' : 'Grid Operator'})
              </option>
            ))}
          </select>
        </div>

        <button 
          className="theme-toggle-btn"
          onClick={onRefresh}
          title="Refresh Data from Server"
        >
          <RefreshCw size={15} />
        </button>

        <button 
          id="theme-toggle"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </nav>
  );
}
