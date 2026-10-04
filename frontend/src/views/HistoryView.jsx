import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Calendar, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpDown
} from 'lucide-react';

export default function HistoryView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  showToast 
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchHistory = async () => {
    if (!activeProfileId) return;
    setLoading(true);
    try {
      const data = await api.getHistory(activeProfileId);
      setHistory(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeProfileId]);

  const setPresetRange = (days) => {
    if (!days) {
      setFromDate('');
      setToDate('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFromDate(start.toISOString().substring(0, 10));
    setToDate(end.toISOString().substring(0, 10));
  };

  const filteredHistory = history.filter((h) => {
    if (statusFilter && h.status !== statusFilter) return false;
    const logDate = h.takenAt ? h.takenAt.substring(0, 10) : '';
    if (fromDate && logDate < fromDate) return false;
    if (toDate && logDate > toDate) return false;
    return true;
  });

  const totalLogs = history.length;
  const takenLogs = history.filter((h) => h.status === 'TAKEN').length;
  const missedLogs = history.filter((h) => h.status === 'MISSED').length;
  const skippedLogs = history.filter((h) => h.status === 'SKIPPED').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

  // 35-day Heatmap Data
  const heatmapDays = [];
  const today = new Date();
  const historyByDate = {};
  history.forEach((h) => {
    if (h.takenAt) {
      const dateKey = h.takenAt.substring(0, 10);
      if (!historyByDate[dateKey]) historyByDate[dateKey] = [];
      historyByDate[dateKey].push(h);
    }
  });

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().substring(0, 10);
    const dayLogs = historyByDate[dateKey] || [];
    let state = 'empty';
    if (dayLogs.length > 0) {
      const allTaken = dayLogs.every((l) => l.status === 'TAKEN');
      const anyTaken = dayLogs.some((l) => l.status === 'TAKEN');
      if (allTaken) state = 'full';
      else if (anyTaken) state = 'partial';
      else state = 'miss';
    }
    heatmapDays.push({ date: dateKey, state, count: dayLogs.length });
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Adherence Analytics
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Intake Logs for {activeProfile?.name || 'Profile'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Longitudinal adherence trends, intake consistency, and history records
          </p>
        </div>

        <select
          className="select-field"
          value={activeProfileId || ''}
          onChange={(e) => setActiveProfileId(Number(e.target.value))}
          style={{ width: 'auto', minWidth: '180px' }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.avatar || '💊'} {p.name} ({p.relation})
            </option>
          ))}
        </select>
      </div>

      {/* Analytics KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-card" style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(22, 27, 46, 0.7))', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase' }}>
              Overall Compliance
            </span>
            <TrendingUp size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '34px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {adherenceRate}%
          </div>
          <div style={{
            height: '6px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.08)',
            marginTop: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', width: `${adherenceRate}%` }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Total Recorded Doses
          </span>
          <div style={{ fontSize: '34px', fontWeight: 800, color: '#c7d2fe', marginTop: '6px' }}>
            {totalLogs}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Across all prescriptions</p>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Doses Taken
          </span>
          <div style={{ fontSize: '34px', fontWeight: 800, color: '#6ee7b7', marginTop: '6px' }}>
            {takenLogs}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Successfully ingested</p>
        </div>

        <div className="glass-card" style={{ padding: '22px 24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Missed / Skipped
          </span>
          <div style={{ fontSize: '34px', fontWeight: 800, color: '#fca5a5', marginTop: '6px' }}>
            {missedLogs + skippedLogs}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{missedLogs} missed, {skippedLogs} skipped</p>
        </div>
      </div>

      {/* 35-Day Consistency Heatmap */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>35-Day Consistency Heatmap</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Daily compliance record for {activeProfile?.name} over the last 5 weeks
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #10b981, #059669)' }} />
              100% Taken
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} />
              Partial
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} />
              Missed
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          maxWidth: '640px'
        }}>
          {heatmapDays.map((d) => {
            let bg = 'rgba(255, 255, 255, 0.05)';
            if (d.state === 'full') bg = 'linear-gradient(135deg, #10b981, #059669)';
            else if (d.state === 'partial') bg = 'linear-gradient(135deg, #f59e0b, #d97706)';
            else if (d.state === 'miss') bg = 'linear-gradient(135deg, #ef4444, #dc2626)';

            return (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} doses (${d.state})`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: bg,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.07)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.18)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Filter and Records Table */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Quick Preset:
            </span>
            <button onClick={() => setPresetRange(7)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              Last 7 Days
            </button>
            <button onClick={() => setPresetRange(30)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              Last 30 Days
            </button>
            <button onClick={() => setPresetRange(null)} className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              All Time
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input-field"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: 'auto' }}
              title="Start Date"
            />
            <span style={{ color: 'var(--text-dim)' }}>→</span>
            <input
              className="input-field"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: 'auto' }}
              title="End Date"
            />

            <select
              className="select-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">All Statuses</option>
              <option value="TAKEN">TAKEN</option>
              <option value="SKIPPED">SKIPPED</option>
              <option value="MISSED">MISSED</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <p style={{ fontWeight: 800, color: '#fff', fontSize: '17px' }}>No records match your criteria</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Intake history will be logged here automatically as daily reminders are completed.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Prescription</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Dosage</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h) => {
                  const isTaken = h.status === 'TAKEN';
                  const isMissed = h.status === 'MISSED';
                  const isSkipped = h.status === 'SKIPPED';

                  return (
                    <tr
                      key={h.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', color: '#c7d2fe', fontWeight: 600 }}>
                        {h.takenAt ? h.takenAt.replace('T', ' ').substring(0, 16) : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }}>
                        {h.reminder?.medicine?.name || 'Prescription'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                        {h.reminder?.medicine?.dosage || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isTaken && <span className="badge badge-taken"><CheckCircle2 size={13} /> Taken</span>}
                        {isMissed && <span className="badge badge-missed"><XCircle size={13} /> Missed</span>}
                        {isSkipped && <span className="badge badge-skipped">Skipped</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
