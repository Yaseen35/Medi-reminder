import React, { useState } from 'react';
import { api } from '../api';
import { Lock, User, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthView({ onAuthSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.trim()) {
          throw new Error('Email is required.');
        }
        await api.register({ username, email, password });
        showToast('Account created successfully! Logging you in...', 'success');
        // Auto login after registration
        const loginRes = await api.login({ username, password });
        localStorage.setItem('jwt', loginRes.token);
        localStorage.setItem('username', loginRes.username);
        onAuthSuccess({ username: loginRes.username });
      } else {
        const res = await api.login({ username, password });
        localStorage.setItem('jwt', res.token);
        localStorage.setItem('username', res.username);
        showToast(`Welcome back, ${res.username}!`, 'success');
        onAuthSuccess({ username: res.username });
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername('demo');
    setPassword('demo1234');
    if (isRegister) setEmail('demo@example.com');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="glass-card" style={{
        width: 'min(440px, 100%)',
        padding: '36px 32px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
        borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '28px',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)'
          }}>
            💊
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            MediRemind
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {isRegister ? 'Start tracking adherence with smart reminders' : 'Sign in to access your medication schedule'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              color: !isRegister ? '#fff' : 'var(--text-muted)',
              background: !isRegister ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              color: isRegister ? '#fff' : 'var(--text-muted)',
              background: isRegister ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. alex24"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '8px',
              padding: '12px',
              fontSize: '15px'
            }}
          >
            {loading ? 'Please wait...' : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemo}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <Sparkles size={13} color="#a5b4fc" />
            <span>Use Demo Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
