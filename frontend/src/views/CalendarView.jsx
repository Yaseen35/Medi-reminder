import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Syringe, 
  Sparkles,
  X
} from 'lucide-react';

export default function CalendarView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  showToast 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formType, setFormType] = useState('APPOINTMENT');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const fetchData = async () => {
    if (!activeProfileId) return;
    setLoading(true);
    try {
      const [eventsData, historyData] = await Promise.all([
        api.getEvents(activeProfileId).catch(() => []),
        api.getHistory(activeProfileId).catch(() => [])
      ]);
      setEvents(eventsData || []);
      setHistory(historyData || []);
    } catch (err) {
      showToast('Could not load calendar data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProfileId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const gotoToday = () => setCurrentDate(new Date());

  const pad = (n) => String(n).padStart(2, '0');

  // Format date key: YYYY-MM-DD
  const getDateKey = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  })();

  const getEventsForDay = (day) => {
    const key = getDateKey(day);
    return events.filter((e) => e.eventDate === key);
  };

  const getHistoryForDay = (day) => {
    const key = getDateKey(day);
    return history.filter((h) => {
      if (!h.timestamp) return false;
      return h.timestamp.startsWith(key);
    });
  };

  const openAddModalForDay = (day) => {
    const dateStr = day ? getDateKey(day) : todayStr;
    setFormDate(dateStr);
    setFormTitle('');
    setFormTime('10:00');
    setFormType('APPOINTMENT');
    setFormLocation('');
    setFormNotes('');
    setModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    try {
      await api.createEvent({
        profileId: String(activeProfileId),
        title: formTitle.trim(),
        eventDate: formDate,
        eventTime: formTime,
        eventType: formType,
        location: formLocation.trim(),
        notes: formNotes.trim()
      });
      showToast('Medical event scheduled!', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!confirm(`Delete medical event "${title}"?`)) return;
    try {
      await api.deleteEvent(id);
      showToast('Event removed.', 'info');
      if (selectedDayEvents) {
        setSelectedDayEvents((prev) => prev ? { ...prev, events: prev.events.filter((x) => x.id !== id) } : null);
      }
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT': return <Stethoscope size={13} />;
      case 'LAB_TEST': return <FlaskConical size={13} />;
      case 'REFILL': return <Pill size={13} />;
      case 'VACCINATION': return <Syringe size={13} />;
      default: return <CalendarIcon size={13} />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'APPOINTMENT': return '#38bdf8';
      case 'LAB_TEST': return '#a78bfa';
      case 'REFILL': return '#34d399';
      case 'VACCINATION': return '#f43f5e';
      default: return '#fbbf24';
    }
  };

  // Calendar Day Grid generator
  const daysArray = [];
  // Empty slots for start padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Filter this month's upcoming events for list
  const currentMonthPrefix = `${year}-${pad(month + 1)}`;
  const monthlyEvents = events.filter((e) => e.eventDate && e.eventDate.startsWith(currentMonthPrefix));

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header & Profile Switcher */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Schedule & Medical Timeline
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Medical Date Calendar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Track doctor appointments, lab work, refill dates, and daily medication adherence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Profile Switcher */}
          <select
            className="select-field"
            value={activeProfileId || ''}
            onChange={(e) => setActiveProfileId(Number(e.target.value))}
            style={{ fontWeight: 600 }}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.avatar || '💊'} {p.name} ({p.relation || 'Self'})
              </option>
            ))}
          </select>

          <button onClick={() => openAddModalForDay(null)} className="btn-primary">
            <Plus size={16} />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Calendar Grid (Left 2.4fr) + Sidebar Details (Right 1fr) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(300px, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Calendar Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Calendar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {monthNames[month]} {year}
              </h2>
              <button 
                onClick={gotoToday} 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '4px 10px', height: 'auto' }}
              >
                Today
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={prevMonth} className="btn-icon" title="Previous Month">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="btn-icon" title="Next Month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    style={{ 
                      minHeight: '85px', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      borderRadius: '10px',
                      border: '1px solid transparent' 
                    }} 
                  />
                );
              }

              const dateKey = getDateKey(day);
              const isToday = dateKey === todayStr;
              const dayEvents = getEventsForDay(day);
              const dayHistory = getHistoryForDay(day);

              const hasTaken = dayHistory.some((h) => h.status === 'TAKEN');
              const hasMissed = dayHistory.some((h) => h.status === 'MISSED');

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDayEvents({ day, dateKey, events: dayEvents, history: dayHistory })}
                  style={{
                    minHeight: '85px',
                    borderRadius: '12px',
                    padding: '8px',
                    background: isToday 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isToday 
                      ? '2px solid #818cf8' 
                      : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                  onMouseLeave={(e) => {
                    if (!isToday) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: isToday ? 800 : 600, 
                      color: isToday ? '#a5b4fc' : '#e2e8f0',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: isToday ? 'rgba(99, 102, 241, 0.5)' : 'transparent'
                    }}>
                      {day}
                    </span>

                    {/* Dose Adherence Dots */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {hasTaken && (
                        <span 
                          title="Medication taken on this day"
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} 
                        />
                      )}
                      {hasMissed && (
                        <span 
                          title="Medication missed on this day"
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Medical Event Badges for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '6px',
                          background: `${getEventTypeColor(ev.eventType)}20`,
                          color: getEventTypeColor(ev.eventType),
                          border: `1px solid ${getEventTypeColor(ev.eventType)}40`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        {getEventTypeIcon(ev.eventType)}
                        <span>{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span style={{ fontSize: '9px', color: 'var(--text-dim)', textAlign: 'right', fontWeight: 700 }}>
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span>Dose Taken</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
              <span>Dose Missed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>Doctor Appointment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }} />
              <span>Lab Test / Bloodwork</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span>Prescription Refill</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Day Details or Upcoming Events */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {selectedDayEvents ? (
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {selectedDayEvents.dateKey}
                </h3>
                <button onClick={() => setSelectedDayEvents(null)} className="btn-icon">
                  <X size={15} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <button 
                  onClick={() => openAddModalForDay(selectedDayEvents.day)} 
                  className="btn-primary" 
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <Plus size={15} />
                  <span>Add Event on this Day</span>
                </button>
              </div>

              {selectedDayEvents.events.length === 0 && selectedDayEvents.history.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  No medical events or recorded doses on this date.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedDayEvents.events.map((ev) => (
                    <div 
                      key={ev.id} 
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        display: 'grid',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${getEventTypeColor(ev.eventType)}25`,
                          color: getEventTypeColor(ev.eventType)
                        }}>
                          {ev.eventType}
                        </span>
                        <button 
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="btn-icon" 
                          style={{ padding: '2px' }}
                          title="Delete Event"
                        >
                          <Trash2 size={13} color="#f87171" />
                        </button>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                        {ev.title}
                      </div>

                      {ev.eventTime && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {ev.eventTime}
                        </div>
                      )}
                      {ev.location && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {ev.location}
                        </div>
                      )}
                      {ev.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                          "{ev.notes}"
                        </div>
                      )}
                    </div>
                  ))}

                  {/* History items */}
                  {selectedDayEvents.history.map((h) => (
                    <div 
                      key={h.id} 
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: h.status === 'TAKEN' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${h.status === 'TAKEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {h.status === 'TAKEN' ? <CheckCircle2 size={14} color="#10b981" /> : <AlertCircle size={14} color="#f43f5e" />}
                        <span style={{ fontWeight: 600 }}>{h.medicineName || 'Medication'}</span>
                      </div>
                      <span style={{ color: 'var(--text-dim)' }}>
                        {h.timestamp ? h.timestamp.split('T')[1]?.substring(0, 5) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#fff' }}>
                  {monthNames[month]} Events ({monthlyEvents.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {currentProfile?.name}
                </span>
              </div>

              {monthlyEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)' }}>
                  <CalendarIcon size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px' }}>No medical appointments or checkups scheduled for this month.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {monthlyEvents.map((ev) => (
                    <div 
                      key={ev.id} 
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        display: 'grid',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${getEventTypeColor(ev.eventType)}25`,
                          color: getEventTypeColor(ev.eventType)
                        }}>
                          {ev.eventType}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 700 }}>
                          {ev.eventDate}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                        {ev.title}
                      </div>
                      {ev.location && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {ev.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Medical Event Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Schedule Medical Event</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  For {currentProfile?.name} ({currentProfile?.relation || 'Self'})
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Event / Appointment Title*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Cardiologist Follow-up, Fasting Blood Test"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Event Date*
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Event Time
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Event Category
                </label>
                <select
                  className="select-field"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="APPOINTMENT">🩺 Doctor / Specialist Appointment</option>
                  <option value="LAB_TEST">🧪 Laboratory / Bloodwork Test</option>
                  <option value="REFILL">💊 Pharmacy Refill Pickup</option>
                  <option value="VACCINATION">💉 Vaccine / Immunization</option>
                  <option value="CHECKUP">📋 General Routine Check-up</option>
                  <option value="DENTAL">🦷 Dental Care</option>
                  <option value="OTHER">📌 Other Medical Event</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Hospital / Clinic / Doctor Location
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. City General Hospital, Dr. Miller Clinic"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Special Instructions / Preparation Notes
                </label>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="e.g. 10 hours fasting required. Bring previous ECG report."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
