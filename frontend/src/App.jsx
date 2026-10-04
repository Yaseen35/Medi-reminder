import React, { useState, useEffect, useRef } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import AlarmModal from './components/AlarmModal';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import MedicinesView from './views/MedicinesView';
import RemindersView from './views/RemindersView';
import HistoryView from './views/HistoryView';
import ProfilesView from './views/ProfilesView';
import MentorsView from './views/MentorsView';
import CalendarView from './views/CalendarView';
import ReportView from './views/ReportView';
import { 
  startAlarm, 
  stopAlarm, 
  playAlertChime, 
  sendBrowserNotification 
} from './utils/alarm';
import { Volume2, VolumeX, BellRing, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Real-time Reminder & Alarm System State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dueReminder, setDueReminder] = useState(null);
  const [snoozedUntil, setSnoozedUntil] = useState({}); // reminderId -> timestamp
  const triggeredSet = useRef(new Set()); // key: `${reminderId}-${dateStr}-${time}`

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
    setLoadingInitial(false);

    // Request notification permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const handleAuthExpired = () => {
      setUser(null);
      stopAlarm();
      showToast('Your session has expired. Please sign in again.', 'error');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
      stopAlarm();
    };
  }, []);

  // Fetch profiles when logged in
  const fetchProfiles = async () => {
    try {
      const data = await api.getProfiles();
      if (data.length === 0) {
        // Auto-create initial default profile
        const def = await api.createProfile({
          name: 'Primary Profile',
          relation: 'Self',
          avatar: '💊',
          age: '',
          allergies: 'No Known Drug Allergies (NKDA)'
        });
        setProfiles([def]);
        setActiveProfileId(def.id);
      } else {
        setProfiles(data);
        if (!activeProfileId || !data.some((p) => p.id === activeProfileId)) {
          setActiveProfileId(data[0].id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  // Real-time Reminder Monitor
  // Checks every 15 seconds whether current HH:mm matches a reminder
  useEffect(() => {
    if (!user || !activeProfileId) return;

    const checkReminders = async () => {
      try {
        const data = await api.getDashboard(activeProfileId);
        const reminders = data.reminders || [];
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const currentHHmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const todayDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const activeProf = profiles.find((p) => p.id === activeProfileId);
        const profName = activeProf ? activeProf.name : 'Patient';

        for (const r of reminders) {
          // Skip if already taken/missed today
          if (r.status === 'TAKEN' || r.status === 'MISSED') continue;

          const triggerKey = `${r.id}-${todayDateStr}-${r.time}`;
          const isSnoozed = snoozedUntil[r.id] && Date.now() < snoozedUntil[r.id];
          const snoozeExpired = snoozedUntil[r.id] && Date.now() >= snoozedUntil[r.id];

          // Trigger if time matches or snooze timer expired
          if ((r.time === currentHHmm && !triggeredSet.current.has(triggerKey) && !isSnoozed) || snoozeExpired) {
            triggeredSet.current.add(triggerKey);

            if (snoozeExpired) {
              setSnoozedUntil((prev) => {
                const next = { ...prev };
                delete next[r.id];
                return next;
              });
            }

            const alertItem = {
              id: r.id,
              medicineId: r.medicineId,
              medicineName: r.medicine,
              dosage: r.dosage,
              time: r.time,
              instructions: r.instructions || 'Take as prescribed with water',
              profileName: profName
            };

            setDueReminder(alertItem);

            if (soundEnabled) {
              startAlarm();
            }

            sendBrowserNotification('MediRemind Alert: Medication Due Now!', {
              body: `Time for ${profName} to take ${r.medicine} (${r.dosage || ''}).`
            });

            break; // Handle one alert at a time
          }
        }
      } catch (_) {
        // Silently skip if network hiccups
      }
    };

    // Initial check and periodic timer
    checkReminders();
    const interval = setInterval(checkReminders, 15000);

    return () => clearInterval(interval);
  }, [user, activeProfileId, soundEnabled, snoozedUntil, profiles]);

  // Alarm action handlers
  const handleTakeDose = async () => {
    if (!dueReminder) return;
    stopAlarm();
    try {
      await api.logIntake(dueReminder.id, 'TAKEN');
      showToast(`Logged intake for ${dueReminder.medicineName}! Great job!`, 'success');
    } catch (err) {
      showToast('Error recording intake: ' + err.message, 'error');
    } finally {
      setDueReminder(null);
    }
  };

  const handleSnoozeDose = () => {
    if (!dueReminder) return;
    stopAlarm();
    const snoozeTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    setSnoozedUntil((prev) => ({ ...prev, [dueReminder.id]: snoozeTime }));
    showToast(`Reminder for ${dueReminder.medicineName} snoozed for 5 minutes.`, 'info');
    setDueReminder(null);
  };

  const handleDismissDose = () => {
    stopAlarm();
    setDueReminder(null);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (!next) {
      stopAlarm();
      showToast('Alert sound muted.', 'info');
    } else {
      playAlertChime();
      showToast('Alert sound enabled. (Played test chime)', 'success');
    }
  };

  const handleTestSound = () => {
    playAlertChime();
    showToast('Playing medical alert test chime 🔔', 'info');
  };

  const handleLogout = () => {
    stopAlarm();
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    setUser(null);
    setProfiles([]);
    setActiveProfileId(null);
    setDueReminder(null);
    showToast('Signed out successfully.', 'info');
  };

  if (loadingInitial) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💊</div>
          <p style={{ fontWeight: 600 }}>Loading MediRemind...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthView
          onAuthSuccess={(userData) => setUser(userData)}
          showToast={showToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-wrapper">
        {/* Global Alert Sound & System Bar */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>Real-time reminder alarm active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleTestSound}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px', height: 'auto' }}
              title="Test audio alert chime through your speakers"
            >
              <BellRing size={12} />
              <span>Test Alert Sound</span>
            </button>

            <button
              onClick={handleToggleSound}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px', height: 'auto', color: soundEnabled ? '#34d399' : 'var(--text-dim)' }}
              title="Toggle automatic alarm chime"
            >
              {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{soundEnabled ? 'Alarm Sound: ON' : 'Alarm Sound: MUTED'}</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            onNavigate={(tab) => setActiveTab(tab)}
            showToast={showToast}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicinesView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            showToast={showToast}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            showToast={showToast}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            showToast={showToast}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            showToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            showToast={showToast}
          />
        )}

        {activeTab === 'profiles' && (
          <ProfilesView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            refreshProfiles={fetchProfiles}
            showToast={showToast}
          />
        )}

        {activeTab === 'mentors' && (
          <MentorsView
            showToast={showToast}
          />
        )}
      </main>

      {/* Real-time Alarm Modal */}
      <AlarmModal
        dueReminder={dueReminder}
        onTake={handleTakeDose}
        onSnooze={handleSnoozeDose}
        onDismiss={handleDismissDose}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
