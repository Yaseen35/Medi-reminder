import React, { useState } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';

export default function ProfilesView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  refreshProfiles, 
  showToast 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Self');
  const [formAvatar, setFormAvatar] = useState('💊');

  const avatarPresets = [
    { emoji: '💊', label: 'Medicine' },
    { emoji: '🙂', label: 'Smile' },
    { emoji: '👩', label: 'Mom' },
    { emoji: '👨', label: 'Dad' },
    { emoji: '👵', label: 'Grandma' },
    { emoji: '👴', label: 'Grandpa' },
    { emoji: '👧', label: 'Daughter' },
    { emoji: '👦', label: 'Son' },
    { emoji: '🧑', label: 'Individual' },
    { emoji: '❤️', label: 'Loved One' },
    { emoji: '🐶', label: 'Pet Dog' },
    { emoji: '🐱', label: 'Pet Cat' }
  ];

  const relationOptions = [
    'Self', 
    'Mother', 
    'Father', 
    'Sibling', 
    'Child', 
    'Spouse', 
    'Grandparent', 
    'Dependent', 
    'Pet', 
    'Other'
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      await api.createProfile({
        name: formName.trim(),
        relation: formRelation,
        avatar: formAvatar
      });
      showToast(`Family profile "${formName.trim()}" created!`, 'success');
      setModalOpen(false);
      setFormName('');
      setFormRelation('Other');
      setFormAvatar('💊');
      refreshProfiles();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (profiles.length <= 1) {
      alert('You must have at least one active family profile.');
      return;
    }
    if (!confirm(`Delete profile "${name}"? All associated prescriptions, reminders, and history for this person will be permanently removed.`)) return;

    try {
      await api.deleteProfile(id);
      showToast(`Profile "${name}" removed.`, 'info');
      refreshProfiles();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Family Management
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Family & Dependent Profiles
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Separate medications, reminders, and adherence records per household member
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Add Family Profile</span>
        </button>
      </div>

      {/* Profiles Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          return (
            <div
              key={p.id}
              className="glass-card"
              style={{
                border: isActive ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(22, 27, 46, 0.85))' 
                  : 'var(--bg-card)',
                boxShadow: isActive ? '0 8px 30px rgba(99, 102, 241, 0.25)' : 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                position: 'relative',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: isActive 
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                      : 'rgba(255, 255, 255, 0.06)',
                    border: isActive ? '1px solid #a5b4fc' : '1px solid var(--border-subtle)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '32px',
                    boxShadow: isActive ? '0 6px 20px rgba(99, 102, 241, 0.4)' : 'none'
                  }}>
                    {p.avatar || '💊'}
                  </div>

                  {isActive ? (
                    <span className="badge badge-taken" style={{ padding: '6px 14px', fontSize: '12px' }}>
                      <Check size={13} /> Active Profile
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveProfileId(p.id)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      Switch to Profile
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                  {p.name}
                </h3>
                <span className="badge badge-pending">
                  {p.relation}
                </span>
              </div>

              <div style={{
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  ID: #{p.id}
                </span>

                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="btn-icon"
                  title="Remove Profile"
                  disabled={profiles.length <= 1}
                  style={{ opacity: profiles.length <= 1 ? 0.3 : 1 }}
                >
                  <Trash2 size={16} color="#f87171" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Profile Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create Family Profile</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Add a household member or dependent to manage prescriptions
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Full Name / Nickname*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Grandma Rose, Dad, Sarah"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Relationship
                </label>
                <select
                  className="select-field"
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {relationOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Choose Avatar Emoji
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px'
                }}>
                  {avatarPresets.map((a) => {
                    const isSelected = formAvatar === a.emoji;
                    return (
                      <button
                        key={a.emoji}
                        type="button"
                        onClick={() => setFormAvatar(a.emoji)}
                        title={a.label}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '12px',
                          fontSize: '24px',
                          display: 'grid',
                          placeItems: 'center',
                          background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.5))' : 'rgba(255, 255, 255, 0.05)',
                          border: isSelected ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                          boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {a.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
