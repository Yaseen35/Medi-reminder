import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  UserCheck, 
  Users, 
  Copy, 
  Check, 
  Plus, 
  MessageSquare, 
  BarChart3, 
  Trash2, 
  X, 
  Send,
  Heart,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function MentorsView({ showToast }) {
  const [activeTab, setActiveTab] = useState('mentors');
  const [overview, setOverview] = useState({ inviteCode: '', myMentors: [], myMentees: [] });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Connect Modal State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectRole, setConnectRole] = useState('MENTOR');
  const [connectIdentifier, setConnectIdentifier] = useState('');

  // Mentee Supervision Modal State
  const [supervisionModalOpen, setSupervisionModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [menteeData, setMenteeData] = useState(null);
  const [menteeLoading, setMenteeLoading] = useState(false);

  // Notes Modal State
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeConnId, setActiveConnId] = useState(null);
  const [activeConnUser, setActiveConnUser] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [newNoteMessage, setNewNoteMessage] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await api.getMentorsOverview();
      setOverview(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCopyCode = async () => {
    if (!overview.inviteCode) return;
    try {
      await navigator.clipboard.writeText(overview.inviteCode);
      setCopied(true);
      showToast('Caregiver link code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy your link code:', overview.inviteCode);
    }
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!connectIdentifier.trim()) return;

    try {
      await api.inviteMentorOrMentee({
        role: connectRole,
        identifier: connectIdentifier.trim()
      });
      showToast('Link request sent successfully!', 'success');
      setConnectModalOpen(false);
      setConnectIdentifier('');
      fetchOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRespond = async (connectionId, accept) => {
    try {
      await api.respondInvitation(connectionId, accept);
      showToast(`Invitation ${accept ? 'accepted' : 'declined'}.`, 'info');
      fetchOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDisconnect = async (connectionId, username) => {
    if (!confirm(`Disconnect link with ${username}? This will revoke access and remove notes.`)) return;
    try {
      await api.deleteConnection(connectionId);
      showToast('Disconnected successfully.', 'info');
      fetchOverview();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open Mentee Supervision
  const openMenteeSupervision = async (mentee) => {
    setSelectedMentee(mentee);
    setSupervisionModalOpen(true);
    setMenteeLoading(true);
    try {
      const data = await api.getMenteeOverview(mentee.id);
      setMenteeData(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMenteeLoading(false);
    }
  };

  // Open Notes Drawer
  const openNotesDrawer = async (connectionId, username) => {
    setActiveConnId(connectionId);
    setActiveConnUser(username);
    setNotesModalOpen(true);
    fetchNotes(connectionId);
  };

  const fetchNotes = async (connectionId) => {
    try {
      const data = await api.getConnectionNotes(connectionId);
      setNotesList(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!newNoteMessage.trim() || !activeConnId) return;

    try {
      await api.sendConnectionNote(activeConnId, newNoteMessage.trim());
      setNewNoteMessage('');
      fetchNotes(activeConnId);
      fetchOverview(); // Update notes count
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const quickChips = [
    'Great job keeping up the streak! 🔥',
    'Remember your evening pills after dinner! 💊',
    'Checking in to see how you are feeling today! ❤️',
    'Make sure to stay hydrated with your medicine. 💧'
  ];

  const currentList = activeTab === 'mentors' ? overview.myMentors : overview.myMentees;

  return (
    <div>
      <div className="page-top-row">
        <div className="page-title">
          <h1>Caregivers & Mentors</h1>
          <p>Supervise medication adherence, track family habits, and send encouragement</p>
        </div>

        <button onClick={() => setConnectModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Connect Caregiver / Patient</span>
        </button>
      </div>

      {/* Shareable Link Code Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        padding: '24px 28px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
            Your Caregiver Link Code
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Share this 8-character code with your mentor, caregiver, or patient to link accounts securely.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: 'monospace',
            color: '#a5b4fc',
            letterSpacing: '1px'
          }}>
            {overview.inviteCode || 'Loading...'}
          </span>
          <button
            onClick={handleCopyCode}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`btn-secondary ${activeTab === 'mentors' ? 'active' : ''}`}
          style={{
            background: activeTab === 'mentors' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: activeTab === 'mentors' ? '#818cf8' : 'var(--border-subtle)',
            color: activeTab === 'mentors' ? '#fff' : 'var(--text-muted)',
            boxShadow: activeTab === 'mentors' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          <UserCheck size={16} />
          <span>My Mentors & Caregivers ({overview.myMentors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mentees')}
          className={`btn-secondary ${activeTab === 'mentees' ? 'active' : ''}`}
          style={{
            background: activeTab === 'mentees' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: activeTab === 'mentees' ? '#818cf8' : 'var(--border-subtle)',
            color: activeTab === 'mentees' ? '#fff' : 'var(--text-muted)',
            boxShadow: activeTab === 'mentees' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          <Users size={16} />
          <span>People I'm Mentoring ({overview.myMentees.length})</span>
        </button>
      </div>

      {/* Connections List */}
      {currentList.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-state-icon">{activeTab === 'mentors' ? '🧑‍⚕️' : '👥'}</span>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>
            {activeTab === 'mentors' 
              ? 'No caregivers or mentors connected yet' 
              : 'You are not supervising any patients or mentees yet'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {activeTab === 'mentors'
              ? 'Invite a loved one or caregiver to monitor your medication adherence.'
              : 'Ask your family member or patient for their Caregiver Code to connect.'}
          </p>
          <button onClick={() => setConnectModalOpen(true)} className="btn-primary" style={{ marginTop: '16px' }}>
            <Plus size={16} />
            <span>Connect Now</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {currentList.map((c) => {
            const other = c.otherUser;
            const isAccepted = c.status === 'ACCEPTED';
            const isPending = c.status === 'PENDING';
            const isMenteeTab = activeTab === 'mentees';

            return (
              <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isMenteeTab ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '22px',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                      flexShrink: 0
                    }}>
                      {isMenteeTab ? '👤' : '🧑‍⚕️'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {other.username}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {other.email}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    marginBottom: '18px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>
                      {isMenteeTab ? 'Mentee / Patient' : 'Mentor / Caregiver'}
                    </span>
                    {isAccepted ? (
                      <span className="badge badge-taken">Connected</span>
                    ) : isPending ? (
                      c.canRespond ? (
                        <span className="badge badge-skipped">Action Required</span>
                      ) : (
                        <span className="badge badge-pending">Pending Approval</span>
                      )
                    ) : (
                      <span className="badge badge-missed">Declined</span>
                    )}
                  </div>
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {c.canRespond ? (
                    <>
                      <button onClick={() => handleRespond(c.id, true)} className="btn-success">
                        <Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button onClick={() => handleRespond(c.id, false)} className="btn-danger">
                        Decline
                      </button>
                    </>
                  ) : isAccepted ? (
                    <>
                      {isMenteeTab && (
                        <button
                          onClick={() => openMenteeSupervision(other)}
                          className="btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          <BarChart3 size={14} />
                          <span>Supervision</span>
                        </button>
                      )}
                      <button
                        onClick={() => openNotesDrawer(c.id, other.username)}
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        <MessageSquare size={14} />
                        <span>Notes ({c.notesCount})</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(c.id, other.username)}
                        className="btn-icon"
                        title="Disconnect Link"
                      >
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleDisconnect(c.id, other.username)} className="btn-danger">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      {connectModalOpen && (
        <div className="modal-overlay" onClick={() => setConnectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Connect Mentor or Mentee</h2>
              <button onClick={() => setConnectModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Connection Role*
                </label>
                <select
                  className="select-field"
                  value={connectRole}
                  onChange={(e) => setConnectRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="MENTOR">I want them to be my Caregiver / Mentor (They supervise my adherence)</option>
                  <option value="MENTEE">I want to be their Caregiver / Mentor (I supervise their adherence)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Email Address or Caregiver Code*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. mentor@example.com or MTR-12345678"
                  value={connectIdentifier}
                  onChange={(e) => setConnectIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setConnectModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Link Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentee Supervision Dashboard Modal */}
      {supervisionModalOpen && (
        <div className="modal-overlay" onClick={() => setSupervisionModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(920px, 95vw)', maxHeight: '90vh' }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
                  {selectedMentee?.username}'s Supervision Dashboard
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Read-only adherence metrics, daily timeline, and prescribed medications
                </p>
              </div>
              <button onClick={() => setSupervisionModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            {menteeLoading ? (
              <div className="empty-state">
                <span className="empty-state-icon">⏳</span>
                <p>Loading patient adherence overview...</p>
              </div>
            ) : menteeData ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                  <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Today's Adherence
                    </span>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                      {menteeData.adherence?.adherencePercent}%
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Active Streak
                    </span>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                      🔥 {menteeData.adherence?.streakDays} Days
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Taken / Scheduled
                    </span>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#c7d2fe', marginTop: '4px' }}>
                      {menteeData.adherence?.takenToday} / {menteeData.adherence?.totalToday}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Pending / Missed
                    </span>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#fca5a5', marginTop: '4px' }}>
                      {menteeData.adherence?.pendingToday} / {menteeData.adherence?.missedToday}
                    </div>
                  </div>
                </div>

                {/* Today's Schedule Timeline */}
                <div className="glass-card" style={{ padding: '18px 22px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                    Today's Medication Timeline
                  </h3>
                  {menteeData.todayDoses?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No doses scheduled for today.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {menteeData.todayDoses?.map((d, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <strong style={{ color: '#a5b4fc', fontSize: '14px' }}>{d.time}</strong>
                            <span>{d.medicineName} ({d.dosage})</span>
                            <span className="badge badge-pending" style={{ fontSize: '10px' }}>{d.profileName}</span>
                          </div>
                          <div>
                            {d.status === 'TAKEN' && <span className="badge badge-taken">Taken {d.takenAt ? `(${d.takenAt.substring(11, 16)})` : ''}</span>}
                            {d.status === 'MISSED' && <span className="badge badge-missed">Missed</span>}
                            {d.status === 'SKIPPED' && <span className="badge badge-skipped">Skipped</span>}
                            {(!d.status || d.status === 'PENDING') && <span className="badge badge-pending">Pending</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescribed Medicines */}
                <div className="glass-card" style={{ padding: '18px 22px', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                    Prescribed Medicines & Stock Levels
                  </h3>
                  {menteeData.medicines?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active prescriptions recorded.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Medicine</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Dosage</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Profile</th>
                          <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Stock Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menteeData.medicines?.map((m) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.name}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{m.dosage}</td>
                            <td style={{ padding: '10px 12px' }}><span className="badge badge-pending" style={{ fontSize: '10px' }}>{m.profileName}</span></td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: m.stock <= m.lowStockThreshold ? '#fca5a5' : '#6ee7b7' }}>
                              {m.stock} units
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Notes & Encouragement Drawer / Modal */}
      {notesModalOpen && (
        <div className="modal-overlay" onClick={() => setNotesModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(640px, 95vw)', display: 'flex', flexDirection: 'column', height: '560px' }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                  Caregiver Notes with {activeConnUser}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  Send reminders, check-ins, and supportive encouragement
                </p>
              </div>
              <button onClick={() => setNotesModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            {/* Notes Messages Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {notesList.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <span className="empty-state-icon">💌</span>
                  <p style={{ fontWeight: 700, color: '#fff' }}>No messages exchanged yet</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Send an encouraging check-in or note to begin!
                  </p>
                </div>
              ) : (
                notesList.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      alignSelf: n.isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      borderBottomRightRadius: n.isMe ? '4px' : '16px',
                      borderBottomLeftRadius: n.isMe ? '16px' : '4px',
                      background: n.isMe 
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                        : 'rgba(255, 255, 255, 0.08)',
                      border: n.isMe ? 'none' : '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '14px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      fontSize: '11px',
                      opacity: 0.75,
                      marginBottom: '4px'
                    }}>
                      <strong>{n.senderUsername}</strong>
                      <span>{n.createdAt ? n.createdAt.replace('T', ' ').substring(0, 16) : ''}</span>
                    </div>
                    <div>{n.message}</div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Encouragement Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewNoteMessage(chip)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#c7d2fe',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendNote} style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
              <input
                className="input-field"
                placeholder="Write an encouraging note or check-in..."
                value={newNoteMessage}
                onChange={(e) => setNewNoteMessage(e.target.value)}
                maxLength={1000}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
