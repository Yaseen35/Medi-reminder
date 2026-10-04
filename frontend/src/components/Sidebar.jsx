import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Clock, 
  ClipboardList, 
  Users, 
  UserCheck, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill size={20} /> },
    { id: 'reminders', label: 'Reminders', icon: <Clock size={20} /> },
    { id: 'history', label: 'History', icon: <ClipboardList size={20} /> },
    { id: 'profiles', label: 'Family Profiles', icon: <Users size={20} /> },
    { id: 'mentors', label: 'Caregivers & Mentors', icon: <UserCheck size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-icon">💊</div>
        <div className="brand-name">MediRemind</div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            title={item.label}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="user-profile-footer">
        <div className="user-badge" title={user?.username || 'User'}>
          <div className="user-avatar-circle">
            {(user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username || 'Account'}
          </span>
        </div>
        <button 
          onClick={onLogout} 
          className="btn-icon" 
          title="Sign out"
          style={{ cursor: 'pointer' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
