import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Clock, 
  ClipboardList, 
  Users, 
  UserCheck, 
  LogOut,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} />, badge: null },
    { id: 'medicines', label: 'Prescriptions', icon: <Pill size={19} />, badge: null },
    { id: 'reminders', label: 'Dose Schedules', icon: <Clock size={19} />, badge: null },
    { id: 'history', label: 'Intake Analytics', icon: <ClipboardList size={19} />, badge: null },
    { id: 'profiles', label: 'Family Profiles', icon: <Users size={19} />, badge: null },
    { id: 'mentors', label: 'Caregivers & Mentors', icon: <UserCheck size={19} />, badge: 'Care' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon">💊</div>
        <div>
          <div className="brand-name">MediRemind</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Cloud Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="nav-menu">
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px 6px' }}>
          Menu
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              style={{ position: 'relative' }}
            >
              <span className="nav-item-icon" style={{ color: isActive ? '#a5b4fc' : 'var(--text-dim)' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.25)',
                  color: '#c7d2fe',
                  border: '1px solid rgba(99, 102, 241, 0.4)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="user-profile-footer">
        <div className="user-badge" title={user?.username || 'User'}>
          <div className="user-avatar-circle">
            {(user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ShieldCheck size={11} color="#34d399" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="btn-icon" 
          title="Sign out"
          style={{ cursor: 'pointer', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
