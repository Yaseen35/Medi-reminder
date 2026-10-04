import React, { useState, useEffect } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import MedicinesView from './views/MedicinesView';
import RemindersView from './views/RemindersView';
import HistoryView from './views/HistoryView';
import ProfilesView from './views/ProfilesView';
import MentorsView from './views/MentorsView';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
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

    const handleAuthExpired = () => {
      setUser(null);
      showToast('Your session has expired. Please sign in again.', 'error');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
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
          avatar: '💊'
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

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    setUser(null);
    setProfiles([]);
    setActiveProfileId(null);
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

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
