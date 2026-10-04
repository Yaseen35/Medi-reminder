import React, { useState } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Users, 
  Edit3,
  AlertTriangle,
  ShieldCheck,
  Calendar,
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
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Self');
  const [formAvatar, setFormAvatar] = useState('💊');
  const [formAge, setFormAge] = useState('');
  const [formAllergies, setFormAllergies] = useState('');

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

  const commonAllergies = [
    'Penicillin',
    'Amoxicillin',
    'Sulfa Drugs',
    'Aspirin / NSAIDs',
    'Codeine',
    'Peanuts',
    'Latex',
    'No Known Drug Allergies (NKDA)'
  ];

  const openCreateModal = () => {
    setEditingProfileId(null);
    setFormName('');
    setFormRelation('Self');
    setFormAvatar('💊');
    setFormAge('');
    setFormAllergies('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProfileId(p.id);
    setFormName(p.name || '');
    setFormRelation(p.relation || 'Other');
    setFormAvatar(p.avatar || '💊');
    setFormAge(p.age != null ? String(p.age) : '');
    setFormAllergies(p.allergies || '');
    setModalOpen(true);
  };

  const addAllergyTag = (tag) => {
    if (!formAllergies.trim()) {
      setFormAllergies(tag);
      return;
    }
    const current = formAllergies.split(',').map((s) => s.trim());
    if (!current.includes(tag)) {
      setFormAllergies([...current, tag].join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      relation: formRelation,
      avatar: formAvatar,
      age: formAge ? formAge.trim() : '',
      allergies: formAllergies.trim()
    };

    try {
      if (editingProfileId) {
        await api.updateProfile(editingProfileId, payload);
        showToast(`Profile "${formName.trim()}" updated successfully!`, 'success');
      } else {
        await api.createProfile(payload);
        showToast(`Family profile "${formName.trim()}" created!`, 'success');
      }
      setModalOpen(false);
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
            Manage medical identity, age, known drug allergies, and active schedules per patient
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={16} />
          <span>Add Family Profile</span>
        </button>
      </div>

      {/* Profiles Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          const hasAllergies = p.allergies && p.allergies.trim().length > 0;
          const isNKDA = hasAllergies && p.allergies.toLowerCase().includes('no known');

          return (
            <div
              key={p.id}
              className="glass-card"
              style={{
                border: isActive ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(22, 27, 46, 0.95))' 
                  : 'var(--bg-card)',
                boxShadow: isActive ? '0 8px 30px rgba(99, 102, 241, 0.25)' : 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px',
                position: 'relative',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isActive ? (
                      <span className="badge badge-taken" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <Check size={13} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveProfileId(p.id)}
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Switch Here
                      </button>
                    )}
                  </div>
                </div>

                {/* Name & Relation / Age */}
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                  {p.name}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge badge-pending">
                    {p.relation || 'Self'}
                  </span>
                  {p.age != null && p.age !== '' && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🎂 {p.age} yrs old
                    </span>
                  )}
                </div>

                {/* Allergies Notice Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: hasAllergies 
                    ? (isNKDA ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)')
                    : 'rgba(255, 255, 255, 0.03)',
                  border: hasAllergies
                    ? (isNKDA ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)')
                    : '1px dashed var(--border-subtle)',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: hasAllergies ? (isNKDA ? '#34d399' : '#f87171') : 'var(--text-dim)' }}>
                    {hasAllergies ? (
                      isNKDA ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />
                    ) : (
                      <AlertTriangle size={13} />
                    )}
                    <span>{hasAllergies ? 'Medical Allergies' : 'No Allergies Listed'}</span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: hasAllergies ? (isNKDA ? '#6ee7b7' : '#fca5a5') : 'var(--text-dim)',
                    marginTop: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {hasAllergies ? p.allergies : 'None recorded yet. Click Edit to record allergy alerts.'}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Patient ID: #{p.id}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(p)}
                    className="btn-icon"
                    title="Edit Profile & Allergies"
                    style={{ color: '#a5b4fc' }}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="btn-icon"
                    title="Remove Profile"
                    disabled={profiles.length <= 1}
                    style={{ opacity: profiles.length <= 1 ? 0.3 : 1 }}
                  >
                    <Trash2 size={15} color="#f87171" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Profile Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {editingProfileId ? 'Edit Medical Profile' : 'Create Family Profile'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Configure patient identity, age, and critical medical allergy warnings
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
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
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    className="input-field"
                    placeholder="e.g. 58"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                  />
                </div>
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

              {/* Allergies field with quick tags */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={14} /> Known Drug & Medical Allergies
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Optional but critical</span>
                </div>
                <input
                  className="input-field"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa (or 'No Known Allergies')"
                  value={formAllergies}
                  onChange={(e) => setFormAllergies(e.target.value)}
                  style={{ borderColor: formAllergies ? 'rgba(239, 68, 68, 0.4)' : undefined }}
                />
                
                {/* Quick allergy chips */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '5px' }}>
                    Quick suggestions (click to append):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {commonAllergies.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => addAllergyTag(allergy)}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: '#e2e8f0',
                          cursor: 'pointer'
                        }}
                      >
                        + {allergy}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Picker */}
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
                  {editingProfileId ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
