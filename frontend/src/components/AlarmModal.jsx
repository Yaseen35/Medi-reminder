import React, { useEffect } from 'react';
import { 
  BellRing, 
  Volume2, 
  VolumeX, 
  Check, 
  Clock, 
  X, 
  AlertCircle,
  Pill,
  Sparkles
} from 'lucide-react';

export default function AlarmModal({ 
  dueReminder, 
  onTake, 
  onSnooze, 
  onDismiss, 
  soundEnabled, 
  onToggleSound 
}) {
  if (!dueReminder) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(5, 7, 15, 0.85)', backdropFilter: 'blur(12px)' }}>
      <div 
        className="modal-content" 
        style={{
          maxWidth: '480px',
          border: '2px solid #818cf8',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.5), 0 20px 40px rgba(0, 0, 0, 0.8)',
          background: 'linear-gradient(135deg, rgba(26, 32, 58, 0.98), rgba(15, 23, 42, 0.98))',
          animation: 'modalFadeIn 0.3s ease-out'
        }}
      >
        {/* Pulsing Alarm Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
            }}>
              <BellRing size={24} color="#fff" className="spin-slow" />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', letterSpacing: '1px', textTransform: 'uppercase' }}>
                SCHEDULED ALARM TRIGGERED
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>
                Medication Due Now!
              </h2>
            </div>
          </div>

          <button
            onClick={onToggleSound}
            className="btn-icon"
            title={soundEnabled ? 'Mute Alert Sound' : 'Unmute Alert Sound'}
            style={{ color: soundEnabled ? '#34d399' : 'var(--text-dim)' }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Medicine Details Card */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '20px',
          display: 'grid',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Patient: <span style={{ color: '#a5b4fc' }}>{dueReminder.profileName || 'Active Patient'}</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '4px 0 0' }}>
                {dueReminder.medicineName || dueReminder.name || 'Prescribed Medicine'}
              </h3>
            </div>

            <span className="badge badge-pending" style={{ fontSize: '13px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {dueReminder.time || 'Now'}
            </span>
          </div>

          {dueReminder.dosage && (
            <div style={{ fontSize: '14px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={15} color="#818cf8" />
              <span>Dosage: <strong>{dueReminder.dosage}</strong></span>
            </div>
          )}

          {dueReminder.instructions && (
            <div style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '10px 12px',
              borderRadius: '10px',
              borderLeft: '3px solid #818cf8'
            }}>
              💡 {dueReminder.instructions}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gap: '10px' }}>
          <button
            onClick={onTake}
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Check size={18} />
            <span>Mark as Taken Now</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={onSnooze}
              className="btn-secondary"
              style={{ padding: '10px', fontSize: '13px' }}
            >
              <Clock size={15} />
              <span>Snooze (5 Mins)</span>
            </button>

            <button
              onClick={onDismiss}
              className="btn-secondary"
              style={{ padding: '10px', fontSize: '13px', color: 'var(--text-dim)' }}
            >
              <X size={15} />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
