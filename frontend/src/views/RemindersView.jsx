import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Clock, Trash2, Calendar, Check, X } from 'lucide-react';

export default function RemindersView({ 
  profiles, 
  activeProfileId, 
  showToast 
}) {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formTime, setFormTime] = useState('08:00');
  const [formFrequency, setFormFrequency] = useState('DAILY');
  const [formDays, setFormDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const daysList = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const fetchMedicines = async () => {
    if (!activeProfileId) return;
    try {
      const data = await api.getMedicines(activeProfileId);
      setMedicines(data);
      if (data.length > 0) {
        if (!selectedMedId || !data.some((m) => m.id === selectedMedId)) {
          setSelectedMedId(data[0].id);
        }
      } else {
        setSelectedMedId(null);
        setReminders([]);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [activeProfileId]);

  const fetchReminders = async () => {
    if (!selectedMedId) {
      setReminders([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getReminders(selectedMedId);
      setReminders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [selectedMedId]);

  const toggleDay = (day) => {
    if (formDays.includes(day)) {
      if (formDays.length === 1) return alert('Select at least one day.');
      setFormDays(formDays.filter((d) => d !== day));
    } else {
      setFormDays([...formDays, day]);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    try {
      await api.createReminder({
        medicineId: selectedMedId,
        time: formTime,
        frequency: formFrequency,
        daysOfWeek: formFrequency === 'WEEKLY' ? formDays.join(',') : null,
        startDate: formStartDate || null,
        endDate: formEndDate || null,
        isActive: true
      });
      showToast('Reminder schedule created!', 'success');
      setModalOpen(false);
      fetchReminders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleActive = async (reminder) => {
    try {
      await api.updateReminder(reminder.id, {
        medicineId: selectedMedId,
        time: reminder.time,
        frequency: reminder.frequency,
        daysOfWeek: reminder.daysOfWeek,
        startDate: reminder.startDate,
        endDate: reminder.endDate,
        isActive: !reminder.isActive
      });
      fetchReminders();
      showToast(`Reminder ${!reminder.isActive ? 'activated' : 'paused'}.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder time?')) return;
    try {
      await api.deleteReminder(id);
      showToast('Reminder deleted.', 'info');
      fetchReminders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectedMed = medicines.find((m) => m.id === selectedMedId);

  return (
    <div>
      <div className="page-top-row">
        <div className="page-title">
          <h1>Dose Reminders</h1>
          <p>Set schedules, daily times, and notification intervals</p>
        </div>

        {medicines.length > 0 && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Add Reminder</span>
          </button>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-state-icon">💊</span>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>No medicines found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Please add a medicine to this profile before creating reminder schedules.
          </p>
        </div>
      ) : (
        <>
          {/* Medicine Selection Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Medicine
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {medicines.map((m) => {
                const isSelected = m.id === selectedMedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMedId(m.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.5))' 
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                    }}
                  >
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: m.color || '#10b981'
                    }} />
                    <span>{m.name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>({m.dosage})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminders List Card */}
          <div className="glass-card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                  Schedules for {selectedMed?.name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {reminders.length} reminder time{reminders.length === 1 ? '' : 's'} active
                </p>
              </div>
            </div>

            {reminders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">⏰</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                  No reminders scheduled for this medicine
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  Set up a daily or weekly reminder to get notified automatically.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary"
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} />
                  <span>Add First Schedule</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      opacity: r.isActive ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: '#c7d2fe',
                        letterSpacing: '0.5px'
                      }}>
                        {r.time}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-pending">
                            {r.frequency}
                          </span>
                          {r.daysOfWeek && (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {r.daysOfWeek.split(',').join(', ')}
                            </span>
                          )}
                        </div>
                        {(r.startDate || r.endDate) && (
                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{r.startDate || 'Any'} → {r.endDate || 'Ongoing'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleToggleActive(r)}
                        className={r.isActive ? 'btn-success' : 'btn-secondary'}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        {r.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn-icon"
                        title="Delete Reminder"
                      >
                        <Trash2 size={16} color="#f87171" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Reminder Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Add Reminder Schedule</h2>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Dose Time*
                </label>
                <input
                  className="input-field"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Frequency*
                </label>
                <select
                  className="select-field"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="DAILY">Daily (Every day)</option>
                  <option value="WEEKLY">Weekly (Specific days)</option>
                </select>
              </div>

              {formFrequency === 'WEEKLY' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Repeat On Days
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {daysList.map((day) => {
                      const active = formDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.06)',
                            color: active ? '#fff' : 'var(--text-muted)',
                            border: active ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Start Date (Optional)
                  </label>
                  <input
                    className="input-field"
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    End Date (Optional)
                  </label>
                  <input
                    className="input-field"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
