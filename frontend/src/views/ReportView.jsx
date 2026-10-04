import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FileText, 
  Printer, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pill, 
  Calendar as CalendarIcon, 
  RefreshCw,
  Award,
  Activity,
  HeartPulse
} from 'lucide-react';

export default function ReportView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  showToast 
}) {
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const fetchReportData = async () => {
    if (!activeProfileId) return;
    setLoading(true);
    try {
      const [medsData, historyData, eventsData] = await Promise.all([
        api.getMedicines(activeProfileId).catch(() => []),
        api.getHistory(activeProfileId).catch(() => []),
        api.getEvents(activeProfileId).catch(() => [])
      ]);

      setMedicines(medsData || []);
      setHistory(historyData || []);
      setEvents(eventsData || []);

      // Fetch reminders for all medicines
      if (medsData && medsData.length > 0) {
        const reminderPromises = medsData.map((m) => api.getReminders(m.id).catch(() => []));
        const rems = await Promise.all(reminderPromises);
        setReminders(rems.flat());
      } else {
        setReminders([]);
      }
    } catch (err) {
      showToast('Error loading report data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeProfileId]);

  // Statistics
  const totalLogs = history.length;
  const takenLogs = history.filter((h) => h.status === 'TAKEN').length;
  const missedLogs = history.filter((h) => h.status === 'MISSED').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const hasAllergies = currentProfile?.allergies && currentProfile.allergies.trim().length > 0;
  const isNKDA = hasAllergies && currentProfile.allergies.toLowerCase().includes('no known');

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Action Row (Hidden when printing via CSS) */}
      <div className="page-top-row no-print" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Clinical Documentation
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Patient Medical Report
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Comprehensive clinical summary of allergies, prescriptions, adherence rate, and intake history
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <button onClick={fetchReportData} className="btn-secondary" title="Refresh data">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          <button onClick={handlePrint} className="btn-primary">
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Medical Document Card */}
      <div 
        id="printable-report"
        className="glass-card" 
        style={{
          padding: '40px',
          background: 'linear-gradient(180deg, rgba(22, 27, 46, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          borderRadius: '20px'
        }}
      >
        {/* Document Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '24px',
          borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>💊</span>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '0.5px', margin: 0 }}>
                  MEDIREMIND CLINICAL HEALTH
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--primary-light)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Electronic Medication Record & Adherence Summary
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              Report Generated
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Ref: RPT-{activeProfileId}-{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>

        {/* Patient Identity & Critical Allergy Alert Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1.6fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Patient Details */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Patient Identification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '26px'
              }}>
                {currentProfile?.avatar || '💊'}
              </div>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {currentProfile?.name}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Relation: <span style={{ color: '#fff', fontWeight: 600 }}>{currentProfile?.relation || 'Self'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Age: </span>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
                  {currentProfile?.age != null ? `${currentProfile.age} Years` : 'Not specified'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Patient ID: </span>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>#{currentProfile?.id}</span>
              </div>
            </div>
          </div>

          {/* Critical Allergy Alert Box */}
          <div style={{
            padding: '20px',
            borderRadius: '14px',
            background: hasAllergies 
              ? (isNKDA ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.14)')
              : 'rgba(255, 255, 255, 0.03)',
            border: hasAllergies
              ? (isNKDA ? '1.5px solid rgba(16, 185, 129, 0.35)' : '2px solid rgba(239, 68, 68, 0.45)')
              : '1px dashed var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 800,
                color: hasAllergies ? (isNKDA ? '#34d399' : '#f87171') : 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {hasAllergies ? (
                  isNKDA ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span>{hasAllergies ? 'Critical Medical Allergies & Sensitivities' : 'Allergy Status'}</span>
              </div>

              <div style={{
                fontSize: hasAllergies ? '16px' : '14px',
                fontWeight: 800,
                color: hasAllergies ? (isNKDA ? '#a7f3d0' : '#fecaca') : 'var(--text-dim)',
                marginTop: '10px',
                lineHeight: 1.4
              }}>
                {hasAllergies 
                  ? currentProfile.allergies 
                  : 'No known allergies currently documented in patient profile.'}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '12px' }}>
              ⚠️ Always cross-reference medication ingredients with known patient contraindications before administration.
            </div>
          </div>
        </div>

        {/* Adherence Summary Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Adherence Rate</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: adherenceRate >= 80 ? '#34d399' : '#fbbf24', marginTop: '4px' }}>
              {adherenceRate}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Clinical target &gt; 85%</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Active Prescriptions</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
              {medicines.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Under regular schedule</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Doses Taken</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
              {takenLogs}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Confirmed logs</div>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Doses Missed</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: missedLogs > 0 ? '#f43f5e' : 'var(--text-dim)', marginTop: '4px' }}>
              {missedLogs}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Reported skips</div>
          </div>
        </div>

        {/* Section 1: Active Prescriptions & Regimens */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={16} color="#818cf8" />
            <span>Active Prescriptions & Regimens</span>
          </h3>

          {medicines.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic' }}>No active prescriptions recorded for this patient.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Medication</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Dosage & Form</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Instructions</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Stock / Refill</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Schedule Times</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => {
                  const medReminders = reminders.filter((r) => r.medicineId === m.id);
                  const isLow = m.currentStock <= m.stockThreshold;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>
                        {m.name}
                      </td>
                      <td style={{ padding: '12px', color: '#e2e8f0' }}>
                        {m.dosage} {m.form || 'tablet'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {m.instructions || 'As directed'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: isLow ? '#f87171' : '#34d399', fontWeight: 600 }}>
                          {m.currentStock} remaining {isLow ? '⚠️ Low' : '✓ OK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {medReminders.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {medReminders.map((r) => (
                              <span key={r.id} style={{ padding: '2px 6px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', fontSize: '11px', fontWeight: 600 }}>
                                {r.time}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 2: Recent Intake History Logs (Last 10 entries) */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#34d399" />
            <span>Recent Medication Compliance Log</span>
          </h3>

          {history.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic' }}>No intake logs recorded yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Date & Time</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Medication</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>
                      {h.timestamp ? h.timestamp.replace('T', ' ').substring(0, 16) : 'Recorded'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#fff' }}>
                      {h.medicineName || 'Medication'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {h.status === 'TAKEN' ? (
                        <span style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Taken
                        </span>
                      ) : (
                        <span style={{ color: '#f43f5e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={13} /> Missed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Upcoming Medical Appointments & Tests */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={16} color="#38bdf8" />
            <span>Scheduled Medical Dates & Consultations</span>
          </h3>

          {events.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic' }}>No upcoming medical events scheduled on calendar.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {events.slice(0, 4).map((ev) => (
                <div key={ev.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-light)' }}>
                      {ev.eventType}
                    </span>
                    <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>
                      {ev.eventDate} {ev.eventTime ? `at ${ev.eventTime}` : ''}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                    {ev.title}
                  </div>
                  {ev.location && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {ev.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Footer / Signatures */}
        <div style={{
          paddingTop: '28px',
          borderTop: '2px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '30px',
          alignItems: 'end'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              DISCLAIMER: This document is an automated electronic compilation from the MediRemind adherence tracking system. 
              Always review with your primary care physician or pharmacist before adjusting dosages or discontinued therapies.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '200px', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', marginLeft: 'auto', marginBottom: '6px' }} />
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
              Physician / Caregiver Verification
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Date: ________________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
