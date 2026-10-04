import React, { useState, useEffect } from 'react';
import { api } from '../api';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  ChevronRight,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Award
} from 'lucide-react';

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) {}
}

export default function DashboardView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  onNavigate, 
  showToast 
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    if (!activeProfileId) return;
    try {
      const data = await api.getDashboard(activeProfileId);
      setDashboard(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeProfileId]);

  const handleTakeDose = async (reminderId, medName) => {
    try {
      await api.logIntake(reminderId, 'TAKEN');
      playChime();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#06b6d4']
      });
      showToast(`Recorded ${medName} as taken! Great consistency!`, 'success');
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSkipDose = async (reminderId) => {
    try {
      await api.logIntake(reminderId, 'SKIPPED');
      showToast('Dose recorded as skipped.', 'info');
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRefillStock = async (medicineId, medName) => {
    try {
      await api.refillMedicine(medicineId, 30);
      showToast(`Refilled ${medName} with +30 units!`, 'success');
      fetchDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const reminders = dashboard?.reminders || [];
  const lowStock = dashboard?.lowStock || [];
  const streakDays = dashboard?.streakDays || 0;

  const totalDoses = reminders.length;
  const takenDoses = reminders.filter((r) => r.status === 'TAKEN').length;
  const missedDoses = reminders.filter((r) => r.status === 'MISSED').length;
  const pendingDoses = reminders.filter((r) => !r.status || r.status === 'PENDING').length;

  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  // Circular gauge calculation (Radius 38, circumference 238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (adherenceRate / 100) * circumference;

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeSlotIcon = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 12) return <Sun size={15} color="#fbbf24" />;
    if (hour < 18) return <Sunset size={15} color="#fb923c" />;
    return <Moon size={15} color="#818cf8" />;
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Greeting & Profile Bar */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Healthcare Dashboard
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, marginTop: '2px' }}>
            {getGreeting()}, {activeProfile?.name || 'User'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            {todayDateString} • {pendingDoses === 0 && totalDoses > 0 ? 'All doses completed for today!' : `${pendingDoses} dose${pendingDoses === 1 ? '' : 's'} remaining today`}
          </p>
        </div>

        {/* Profile Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {profiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.95))' 
                    : 'rgba(22, 27, 46, 0.7)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  border: isSelected ? '1px solid #a5b4fc' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 4px 16px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none'
                }}
              >
                <span style={{ fontSize: '16px' }}>{p.avatar || '💊'}</span>
                <span>{p.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 500 }}>({p.relation})</span>
              </button>
            );
          })}

          <button
            onClick={() => onNavigate('profiles')}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 14px', fontSize: '13px' }}
            title="Manage Family Profiles"
          >
            <Plus size={14} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Hero Health Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Adherence Circular Gauge Card */}
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '26px 28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Daily Adherence Score
            </span>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {adherenceRate}%
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              {takenDoses} of {totalDoses} doses recorded taken
            </p>
          </div>

          {/* SVG Progress Circle */}
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#adherenceGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <defs>
                <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '16px',
              color: '#6ee7b7'
            }}>
              {totalDoses === 0 ? '—' : `${takenDoses}/${totalDoses}`}
            </div>
          </div>
        </div>

        {/* Streak & Consistency Hero Card */}
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '26px 28px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(236, 72, 153, 0.12))',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '32px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45)',
            flexShrink: 0
          }}>
            🔥
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                {streakDays} Day{streakDays === 1 ? '' : 's'}
              </span>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fde68a', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                {streakDays >= 7 ? 'Legendary 🔥' : streakDays > 0 ? 'Active Habit' : 'Ignite Streak'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {streakDays > 0 
                ? `You've maintained perfect consistency! Stay committed today.` 
                : `Complete all scheduled doses today to start your streak counter.`}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="glass-card" style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          padding: '18px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="#f87171" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fca5a5' }}>
              Low Prescription Inventory Alert ({lowStock.length})
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {lowStock.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(15, 19, 36, 0.8)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '14px', color: '#fff' }}>{m.name}</strong>
                  <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>
                    Only {m.stock} unit{m.stock === 1 ? '' : 's'} remaining
                  </div>
                </div>
                <button
                  onClick={() => handleRefillStock(m.id, m.name)}
                  className="btn-success"
                  style={{ fontSize: '11px', padding: '5px 12px' }}
                >
                  <RefreshCw size={11} />
                  <span>Refill +30</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Timeline Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Today's Dose Schedule</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Track intake times and mark prescriptions as taken
            </p>
          </div>
          <button onClick={() => onNavigate('reminders')} className="btn-secondary" style={{ fontSize: '13px' }}>
            <span>Manage Schedules</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⏰</span>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>No reminders scheduled for today</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Add medicines and set reminder intervals to populate your daily timeline.
            </p>
            <button
              onClick={() => onNavigate('reminders')}
              className="btn-primary"
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} />
              <span>Create Schedule</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {reminders.map((r) => {
              const isTaken = r.status === 'TAKEN';
              const isMissed = r.status === 'MISSED';
              const isSkipped = r.status === 'SKIPPED';
              const isPending = !r.status || r.status === 'PENDING';

              return (
                <div
                  key={r.id}
                  style={{
                    background: isTaken 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : isMissed 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : 'rgba(22, 27, 46, 0.65)',
                    border: isTaken 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : isMissed 
                      ? '1px solid rgba(239, 68, 68, 0.3)' 
                      : '1px solid var(--border-subtle)',
                    borderRadius: '18px',
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: isTaken ? '0 4px 20px rgba(16, 185, 129, 0.1)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    {/* Time slot indicator */}
                    <div style={{
                      minWidth: '76px',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 800,
                      fontSize: '15px',
                      color: '#c7d2fe'
                    }}>
                      {getTimeSlotIcon(r.time)}
                      <span>{r.time}</span>
                    </div>

                    {/* Pill Graphic */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      backgroundColor: r.color || '#6366f1',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: '20px',
                      boxShadow: `0 0 16px ${r.color || '#6366f1'}60`,
                      flexShrink: 0
                    }}>
                      💊
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '16px', color: '#fff' }}>{r.medicine}</strong>
                        <span className="badge badge-pending" style={{ fontSize: '11px' }}>{r.dosage}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
                        Stock: <span style={{ color: r.stock <= 5 ? '#fca5a5' : '#6ee7b7', fontWeight: 700 }}>{r.stock} remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status / Action Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isTaken && (
                      <span className="badge badge-taken" style={{ fontSize: '13px', padding: '6px 14px' }}>
                        <CheckCircle2 size={15} />
                        <span>Taken</span>
                      </span>
                    )}
                    {isMissed && (
                      <span className="badge badge-missed" style={{ fontSize: '13px', padding: '6px 14px' }}>
                        <XCircle size={15} />
                        <span>Missed</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="badge badge-skipped" style={{ fontSize: '13px', padding: '6px 14px' }}>
                        <span>Skipped</span>
                      </span>
                    )}
                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleTakeDose(r.id, r.medicine)}
                          className="btn-success"
                          style={{ padding: '8px 18px', fontSize: '13px', gap: '6px' }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Take Now</span>
                        </button>
                        <button
                          onClick={() => handleSkipDose(r.id)}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
