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
  RefreshCw
} from 'lucide-react';

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

  const handleTakeDose = async (reminderId) => {
    try {
      await api.logIntake(reminderId, 'TAKEN');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Medication recorded as taken! Great job keeping your streak!', 'success');
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

  const handleRefillStock = async (medicineId) => {
    try {
      await api.refillMedicine(medicineId, 30);
      showToast('Refilled +30 units successfully!', 'success');
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

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div>
      {/* Top Header & Profile Pills */}
      <div className="page-top-row">
        <div className="page-title">
          <h1>Today's Overview</h1>
          <p>{todayDateString}</p>
        </div>

        {/* Profile Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {profiles.map((p) => (
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
                transition: 'all 0.2s ease',
                background: p.id === activeProfileId 
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                  : 'rgba(255, 255, 255, 0.06)',
                color: p.id === activeProfileId ? '#fff' : 'var(--text-muted)',
                border: p.id === activeProfileId ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                boxShadow: p.id === activeProfileId ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <span>{p.avatar || '💊'}</span>
              <span>{p.name}</span>
            </button>
          ))}

          <button
            onClick={() => onNavigate('profiles')}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '13px' }}
            title="Manage family profiles"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Streak Hero Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(236, 72, 153, 0.15))',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '24px 28px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '28px',
          boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
        }}>
          🔥
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
              {streakDays}-Day Adherence Streak!
            </h2>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
              {streakDays > 0 ? 'Active Habit' : 'Start Today'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {streakDays > 0 
              ? `Outstanding consistency for ${activeProfile?.name || 'you'}. Keep taking all doses on time!` 
              : `Take today's doses on time to ignite your adherence streak.`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Today's Adherence
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {adherenceRate}%
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStock.length > 0 && (
        <div className="glass-card" style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '24px',
          padding: '18px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="#f87171" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fca5a5' }}>
              Low Stock Warnings ({lowStock.length})
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {lowStock.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{m.name}</strong>
                  <div style={{ fontSize: '11px', color: '#fca5a5' }}>{m.stock} pills remaining</div>
                </div>
                <button
                  onClick={() => handleRefillStock(m.id)}
                  className="btn-success"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <RefreshCw size={11} />
                  <span>Refill +30</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adherence Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Total Scheduled
          </span>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '6px', color: '#c7d2fe' }}>
            {totalDoses}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Taken
          </span>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '6px', color: '#6ee7b7' }}>
            {takenDoses}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Pending
          </span>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '6px', color: '#93c5fd' }}>
            {pendingDoses}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Missed
          </span>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '6px', color: '#fca5a5' }}>
            {missedDoses}
          </div>
        </div>
      </div>

      {/* Medication Timeline Card */}
      <div className="glass-card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Today's Medication Timeline</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Scheduled doses for {activeProfile?.name || 'this profile'}
            </p>
          </div>
          <button onClick={() => onNavigate('reminders')} className="btn-secondary" style={{ fontSize: '13px' }}>
            <span>Manage Reminders</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⏰</span>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>No reminders scheduled for today</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Add medicines and configure daily or weekly reminders to stay on track.
            </p>
            <button
              onClick={() => onNavigate('reminders')}
              className="btn-primary"
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} />
              <span>Create Reminder</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isTaken 
                      ? '1px solid rgba(16, 185, 129, 0.25)' 
                      : isMissed 
                      ? '1px solid rgba(239, 68, 68, 0.25)' 
                      : '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Time Badge */}
                    <div style={{
                      minWidth: '70px',
                      fontWeight: 800,
                      fontSize: '17px',
                      color: '#a5b4fc',
                      letterSpacing: '-0.3px'
                    }}>
                      {r.time}
                    </div>

                    {/* Color Bar */}
                    <div style={{
                      width: '4px',
                      height: '36px',
                      borderRadius: '2px',
                      backgroundColor: r.color || '#6366f1'
                    }} />

                    {/* Medicine Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#fff' }}>{r.medicine}</strong>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({r.dosage})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Stock: {r.stock} remaining
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isTaken && (
                      <span className="badge badge-taken">
                        <CheckCircle2 size={13} />
                        <span>Taken</span>
                      </span>
                    )}
                    {isMissed && (
                      <span className="badge badge-missed">
                        <XCircle size={13} />
                        <span>Missed</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="badge badge-skipped">
                        <span>Skipped</span>
                      </span>
                    )}
                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleTakeDose(r.id)}
                          className="btn-success"
                        >
                          <CheckCircle2 size={14} />
                          <span>Take Now</span>
                        </button>
                        <button
                          onClick={() => handleSkipDose(r.id)}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
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
