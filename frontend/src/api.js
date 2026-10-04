const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(API_BASE + endpoint, {
      ...options,
      headers
    });
  } catch (err) {
    throw new Error('Unable to connect to the server. Please check your internet connection.');
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth-expired'));
    throw new Error('Your session has expired or is invalid. Please sign in again.');
  }

  if (!res.ok) {
    let msg = 'An unexpected error occurred.';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  // Profiles
  getProfiles: () => apiFetch('/profiles'),
  createProfile: (data) => apiFetch('/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id, data) => apiFetch(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: (id) => apiFetch(`/profiles/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: (profileId) => apiFetch(`/dashboard?profileId=${profileId}`),

  // Medicines
  getMedicines: (profileId) => apiFetch(`/medicines?profileId=${profileId}`),
  createMedicine: (data) => apiFetch('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) => apiFetch(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicine: (id) => apiFetch(`/medicines/${id}`, { method: 'DELETE' }),
  refillMedicine: (id, quantity) => apiFetch(`/medicines/${id}/refill?quantity=${quantity}`, { method: 'POST' }),

  // Reminders
  getReminders: (medicineId) => apiFetch(`/reminders?medicineId=${medicineId}`),
  createReminder: (data) => apiFetch('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id, data) => apiFetch(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReminder: (id) => apiFetch(`/reminders/${id}`, { method: 'DELETE' }),

  // History
  getHistory: (profileId) => apiFetch(`/history?profileId=${profileId}`),
  logIntake: (reminderId, status) => apiFetch('/history', { method: 'POST', body: JSON.stringify({ reminderId, status }) }),

  // Caregivers & Mentors
  getMentorsOverview: () => apiFetch('/mentors'),
  getCaregiverCode: () => apiFetch('/mentors/code'),
  inviteMentorOrMentee: (data) => apiFetch('/mentors/invite', { method: 'POST', body: JSON.stringify(data) }),
  respondInvitation: (id, accept) => apiFetch(`/mentors/connections/${id}/respond`, { method: 'POST', body: JSON.stringify({ accept }) }),
  deleteConnection: (id) => apiFetch(`/mentors/connections/${id}`, { method: 'DELETE' }),
  getMenteeOverview: (menteeId) => apiFetch(`/mentors/mentees/${menteeId}/overview`),
  getConnectionNotes: (connectionId) => apiFetch(`/mentors/connections/${connectionId}/notes`),
  sendConnectionNote: (connectionId, message) => apiFetch(`/mentors/connections/${connectionId}/notes`, { method: 'POST', body: JSON.stringify({ message }) })
};
