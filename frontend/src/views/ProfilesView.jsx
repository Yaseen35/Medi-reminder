import React, { useState } from 'react';
import { api } from '../api';
import { Plus, Trash2, Check, X, Users } from 'lucide-react';

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

  const avatarPresets = ['💊', '🙂', '👩', '👨', '👵', '👴', '👧', '👦', '🧑', '❤️', '🐶', '🐱'];
  const relationOptions = ['Self', 'Mother', 'Father', 'Sibling', 'Child', 'Spouse', 'Grandparent', 'Other'];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      await api.createProfile({
        name: formName.trim(),
        relation: formRelation,
        avatar: formAvatar
      });
      showToast(`Profile "${formName}" created!`, 'success');
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
      alert('You must have at least one family profile.');
      return;
    }
    if (!confirm(`Delete profile "${name}"? All associated medicines and reminders will be permanently removed.`)) return;

    try {
      await api.deleteProfile(id);
      showToast(`Profile "${name}" removed.`, 'info');
      refreshProfiles();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="page-top-row">
        <div className="page-title">
          <h1>Family Profiles</h1>
          <p>Organize prescriptions separately for each family member or dependent</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Add Profile</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.4))',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '28px',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)'
                  }}>
                    {p.avatar || '💊'}
                  </div>

                  {isActive ? (
                    <span className="badge badge-taken">
                      <Check size={12} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveProfileId(p.id)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      Select
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {p.name}
                </h3>
                <span className="badge badge-pending" style={{ fontSize: '11px' }}>
                  {p.relation}
                </span>
              </div>

              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="btn-icon"
                  title="Delete Profile"
                  disabled={profiles.length <= 1}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create Family Profile</h2>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Profile Name*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Grandma Rose, Dad, Liam"
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
                  Avatar Emoji
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {avatarPresets.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setFormAvatar(a)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        fontSize: '20px',
                        display: 'grid',
                        placeItems: 'center',
                        background: formAvatar === a ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                        border: formAvatar === a ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
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
