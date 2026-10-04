import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Clock, 
  Trash2, 
  Calendar, 
  Check, 
  X,
  Bell,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

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

  const daysList = [
    { key: 'MON', label: 'Mon' },
    { key: 'TUE', label: 'Tue' },
    { key: 'WED', label: 'Wed' },
    { key: 'THU', label: 'Thu' },
    { key: 'FRI', label: 'Fri' },
    { key: 'SAT', label: 'Sat' },
    { key: 'SUN', label: 'Sun' }
  ];

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

  const toggleDay = (dayKey) => {
    if (formDays.includes(dayKey)) {
      if (formDays.length === 1) return alert('Select at least one active day.');
      setFormDays(formDays.filter((d) => d !== dayKey));
    } else {
      setFormDays([...formDays, dayKey]);
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
      showToast('Reminder schedule created successfully!', 'success');
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
      showToast(`Reminder ${!reminder.isActive ? 'resumed' : 'paused'}.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this reminder?')) return;
    try {
      await api.deleteReminder(id);
      showToast('Reminder removed.', 'info');
      fetchReminders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectedMed = medicines.find((m) => m.id === selectedMedId);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Schedule & Alarms
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Dose Reminders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Configure daily dose times, weekdays, and active alert intervals
          </p>
        </div>

        {medicines.length > 0 && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Add Schedule</span>
          </button>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-state-icon">⏰</span>
          <p style={{ fontWeight: 800, color: '#fff', fontSize: '18px' }}>No Prescriptions Found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            You need to add at least one prescription before creating dose reminder schedules.
          </p>
        </div>
      ) : (
        <>
          {/* Medicine Selector Strip */}
          <div className="glass-card" style={{ padding: '18px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Select Medicine to View Schedules
            </div>

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
                      gap: '10px',
                      padding: '10px 18px',
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.85))' 
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      border: isSelected ? '1px solid #a5b4fc' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 4px 18px rgba(99, 102, 241, 0.35)' : 'none'
                    }}
                  >
                    <span style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: m.color || '#10b981',
                      boxShadow: isSelected ? `0 0 10px ${m.color || '#10b981'}` : 'none'
                    }} />
                    <span>{m.name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 500 }}>({m.dosage})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminders List */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  Active Schedules for {selectedMed?.name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {reminders.length} reminder time{reminders.length === 1 ? '' : 's'} configured
                </p>
              </div>

              <button onClick={() => setModalOpen(true)} className="btn-secondary" style={{ fontSize: '13px' }}>
                <Plus size={14} />
                <span>Add Time</span>
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔔</span>
                <p style={{ fontWeight: 800, color: '#fff', fontSize: '17px' }}>
                  No reminders configured for {selectedMed?.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Add a dose time and frequency to get proactive reminders on time.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary"
                  style={{ marginTop: '16px' }}
                >
                  <Plus size={16} />
                  <span>Configure Schedule</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {reminders.map((r) => {
                  return (
                    <div
                      key={r.id}
                      style={{
                        background: r.isActive ? 'rgba(22, 27, 46, 0.7)' : 'rgba(15, 19, 36, 0.4)',
                        border: r.isActive ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '18px',
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        opacity: r.isActive ? 1 : 0.6,
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Time Box */}
                        <div style={{
                          padding: '12px 18px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.35))',
                          border: '1px solid rgba(129, 140, 248, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontWeight: 800,
                          fontSize: '20px',
                          color: '#fff',
                          letterSpacing: '0.5px'
                        }}>
                          <Clock size={18} color="#a5b4fc" />
                          <span>{r.time}</span>
                        </div>

                        {/* Frequency details */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge badge-pending">
                              {r.frequency}
                            </span>
                            {r.daysOfWeek && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {r.daysOfWeek.split(',').map((day) => (
                                  <span
                                    key={day}
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      color: '#c7d2fe'
                                    }}
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {(r.startDate || r.endDate) && (
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={13} />
                              <span>{r.startDate || 'Start Date'} → {r.endDate || 'Indefinite'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Switch & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                          onClick={() => handleToggleActive(r)}
                          className={r.isActive ? 'btn-success' : 'btn-secondary'}
                          style={{ fontSize: '13px', padding: '7px 16px', gap: '6px' }}
                        >
                          <span>{r.isActive ? 'Active' : 'Paused'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="btn-icon"
                          title="Delete Schedule"
                        >
                          <Trash2 size={16} color="#f87171" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Reminder Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create Dose Schedule</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Set up interval reminders for {selectedMed?.name}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Dose Time (24h)*
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
                  Frequency Interval*
                </label>
                <select
                  className="select-field"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="DAILY">Daily (Repeats every single day)</option>
                  <option value="WEEKLY">Weekly (Select specific days)</option>
                </select>
              </div>

              {formFrequency === 'WEEKLY' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Active Days of Week
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {daysList.map((d) => {
                      const active = formDays.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => toggleDay(d.key)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
                            color: active ? '#fff' : 'var(--text-muted)',
                            border: active ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                            boxShadow: active ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {d.label}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
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
