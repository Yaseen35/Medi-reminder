import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Calendar, Filter, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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

  const filteredHistory = history.filter((h) => {
    if (statusFilter && h.status !== statusFilter) return false;
    const logDate = h.takenAt ? h.takenAt.substring(0, 10) : '';
    if (fromDate && logDate < fromDate) return false;
    if (toDate && logDate > toDate) return false;
    return true;
  });

  const totalLogs = history.length;
  const takenLogs = history.filter((h) => h.status === 'TAKEN').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

  // Generate 35-day Heatmap Data
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

  return (
    <div>
      <div className="page-top-row">
        <div className="page-title">
          <h1>Intake History & Analytics</h1>
          <p>Review adherence trends, dose history, and consistency patterns</p>
        </div>

        <select
          className="select-field"
          value={activeProfileId || ''}
          onChange={(e) => setActiveProfileId(Number(e.target.value))}
          style={{ width: 'auto' }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.avatar || '💊'} {p.name} ({p.relation})
            </option>
          ))}
        </select>
      </div>

      {/* Consistency Heatmap Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>35-Day Consistency Heatmap</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Daily medication adherence over the past 5 weeks</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(135deg, #10b981, #059669)' }} />
              100% Taken
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} />
              Partial
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} />
              Missed
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          maxWidth: '560px'
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
                  borderRadius: '6px',
                  background: bg,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            );
          })}
        </div>
      </div>

      {/* Adherence Rate Bar Card */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong style={{ fontSize: '15px' }}>Overall Adherence Rate</strong>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>{adherenceRate}%</span>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #10b981, #6366f1)',
            width: `${adherenceRate}%`,
            transition: 'width 0.8s ease'
          }} />
        </div>
      </div>

      {/* Filter & History Table Card */}
      <div className="glass-card">
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-dim)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Filters:</span>
          </div>

          <input
            className="input-field"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: 'auto' }}
            title="From Date"
          />
          <input
            className="input-field"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: 'auto' }}
            title="To Date"
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

          {(statusFilter || fromDate || toDate) && (
            <button
              onClick={() => { setStatusFilter(''); setFromDate(''); setToDate(''); }}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Reset
            </button>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>No intake records found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Recorded doses will automatically appear here as you track your schedule.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Medicine</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dosage</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
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
                    >
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#fff' }}>
                        {h.takenAt ? h.takenAt.replace('T', ' ').substring(0, 16) : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                        {h.reminder?.medicine?.name || 'Medicine'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        {h.reminder?.medicine?.dosage || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isTaken && <span className="badge badge-taken"><CheckCircle2 size={12} /> Taken</span>}
                        {isMissed && <span className="badge badge-missed"><XCircle size={12} /> Missed</span>}
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
