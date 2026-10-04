// Audio synthesizer & Alert Manager for MediRemind

let audioCtx = null;
let currentAlarmInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Single melodious alert sequence (C5 -> E5 -> G5 -> C6 chime)
export function playAlertChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.18 }, // C5
      { freq: 659.25, time: 0.15, dur: 0.18 }, // E5
      { freq: 783.99, time: 0.30, dur: 0.22 }, // G5
      { freq: 1046.50, time: 0.45, dur: 0.35 } // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.dur);
    });
  } catch (err) {
    console.warn('Web Audio not supported or blocked by autoplay policy:', err);
  }
}

// Continuous alarm (repeats every 2 seconds until stopped)
export function startAlarm() {
  stopAlarm();
  playAlertChime();
  currentAlarmInterval = setInterval(() => {
    playAlertChime();
  }, 2200);
}

export function stopAlarm() {
  if (currentAlarmInterval) {
    clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
}

// System browser notification helper
export async function sendBrowserNotification(title, options = {}) {
  try {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          ...options
        });
      }
    }
  } catch (_) {}
}
