import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  Pill, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  RefreshCw,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function MedicinesView({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  showToast 
}) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, LOW, STOCKED
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formStock, setFormStock] = useState(30);
  const [formThreshold, setFormThreshold] = useState(5);

  const colorPresets = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Rose', hex: '#ec4899' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Purple', hex: '#8b5cf6' }
  ];

  const fetchMedicines = async () => {
    if (!activeProfileId) return;
    setLoading(true);
    try {
      const data = await api.getMedicines(activeProfileId);
      setMedicines(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [activeProfileId]);

  const openAddModal = () => {
    setEditingMed(null);
    setFormName('');
    setFormDosage('');
    setFormDescription('');
    setFormColor('#10b981');
    setFormStock(30);
    setFormThreshold(5);
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMed(m);
    setFormName(m.name);
    setFormDosage(m.dosage);
    setFormDescription(m.description || '');
    setFormColor(m.color || '#10b981');
    setFormStock(m.stock ?? 30);
    setFormThreshold(m.lowStockThreshold ?? 5);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        profileId: activeProfileId,
        name: formName.trim(),
        dosage: formDosage.trim(),
        description: formDescription.trim(),
        color: formColor,
        stock: parseInt(formStock, 10),
        lowStockThreshold: parseInt(formThreshold, 10)
      };

      if (editingMed) {
        await api.updateMedicine(editingMed.id, payload);
        showToast(`Updated "${formName.trim()}" successfully!`, 'success');
      } else {
        await api.createMedicine(payload);
        showToast(`Added "${formName.trim()}" to profile!`, 'success');
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? Associated reminder schedules will also be removed.`)) return;
    try {
      await api.deleteMedicine(id);
      showToast(`Removed "${name}".`, 'info');
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRefill = async (id, name) => {
    const qtyStr = prompt(`Refill stock for "${name}" (units):`, '30');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return alert('Please enter a valid positive number');

    try {
      await api.refillMedicine(id, qty);
      showToast(`Added +${qty} units to ${name}!`, 'success');
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    const isLow = (m.stock ?? 0) <= (m.lowStockThreshold ?? 5);
    if (filterMode === 'LOW') return isLow;
    if (filterMode === 'STOCKED') return !isLow;
    return true;
  });

  const lowStockCount = medicines.filter((m) => (m.stock ?? 0) <= (m.lowStockThreshold ?? 5)).length;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header Row */}
      <div className="page-top-row" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Pharmacy & Cabinet
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>
            Prescriptions for {activeProfile?.name || 'Profile'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            {medicines.length} total medication{medicines.length === 1 ? '' : 's'} registered • {lowStockCount} require refill
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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

          <button onClick={openAddModal} className="btn-primary">
            <Plus size={16} />
            <span>Add Prescription</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Filters Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            className="input-field"
            type="text"
            placeholder="Search by name, dosage, or instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`btn-secondary ${filterMode === 'ALL' ? 'active' : ''}`}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              background: filterMode === 'ALL' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
              color: filterMode === 'ALL' ? '#fff' : 'var(--text-muted)',
              borderColor: filterMode === 'ALL' ? '#818cf8' : 'var(--border-subtle)'
            }}
          >
            All ({medicines.length})
          </button>

          <button
            onClick={() => setFilterMode('LOW')}
            className={`btn-secondary ${filterMode === 'LOW' ? 'active' : ''}`}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              background: filterMode === 'LOW' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: filterMode === 'LOW' ? '#fca5a5' : 'var(--text-muted)',
              borderColor: filterMode === 'LOW' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'
            }}
          >
            Low Stock ({lowStockCount})
          </button>

          <button
            onClick={() => setFilterMode('STOCKED')}
            className={`btn-secondary ${filterMode === 'STOCKED' ? 'active' : ''}`}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              background: filterMode === 'STOCKED' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: filterMode === 'STOCKED' ? '#6ee7b7' : 'var(--text-muted)',
              borderColor: filterMode === 'STOCKED' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'
            }}
          >
            Sufficient ({medicines.length - lowStockCount})
          </button>
        </div>
      </div>

      {/* Grid of Prescription Cards */}
      {filteredMedicines.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-state-icon">💊</span>
          <p style={{ fontWeight: 800, color: '#fff', fontSize: '18px' }}>
            {searchQuery ? 'No matching prescriptions found' : 'No prescriptions in cabinet'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {searchQuery ? 'Try adjusting your search keyword.' : 'Register medications to manage inventory and dose alerts.'}
          </p>
          {!searchQuery && (
            <button onClick={openAddModal} className="btn-primary" style={{ marginTop: '18px' }}>
              <Plus size={16} />
              <span>Add First Prescription</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredMedicines.map((m) => {
            const stock = m.stock ?? 0;
            const threshold = m.lowStockThreshold ?? 5;
            const isLow = stock <= threshold;
            const stockPercent = Math.min(100, Math.round((stock / 60) * 100));

            return (
              <div
                key={m.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  border: isLow ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
                  background: isLow 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(22, 27, 46, 0.8))' 
                    : 'var(--bg-card)'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        backgroundColor: m.color || '#10b981',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontSize: '24px',
                        boxShadow: `0 4px 18px ${m.color || '#10b981'}70`,
                        flexShrink: 0
                      }}>
                        💊
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                          {m.name}
                        </h3>
                        <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 700 }}>
                          {m.dosage}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => openEditModal(m)} className="btn-icon" title="Edit Prescription">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="btn-icon" title="Remove Prescription">
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '13px',
                    color: m.description ? 'var(--text-main)' : 'var(--text-dim)',
                    fontStyle: m.description ? 'normal' : 'italic'
                  }}>
                    {m.description || 'No special intake instructions recorded.'}
                  </div>
                </div>

                {/* Stock Meter & Refill Bar */}
                <div style={{ marginTop: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Inventory Balance
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isLow ? '#f87171' : '#34d399'
                      }}>
                        {stock} pills
                      </span>
                      {isLow && (
                        <span className="badge badge-missed" style={{ fontSize: '10px', padding: '2px 7px' }}>
                          Refill Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div style={{
                    height: '6px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: isLow ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                      width: `${stockPercent}%`,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Alert when &le; {threshold}
                    </span>
                    <button
                      onClick={() => handleRefill(m.id, m.name)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
                    >
                      <RefreshCw size={12} />
                      <span>Refill Stock</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Prescription Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {editingMed ? 'Edit Prescription' : 'New Prescription'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Register medicine details and inventory levels
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Medicine Name*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Amoxicillin, Metformin, Vitamin D3"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Dosage / Strength*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. 500mg, 1 Tablet, 2 Puffs"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Instructions / Doctor's Notes
                </label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  placeholder="e.g. Take immediately after meals with a glass of water"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Color Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Capsule Accent Color
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormColor(c.hex)}
                      title={c.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: formColor === c.hex ? '3px solid #fff' : '2px solid transparent',
                        boxShadow: formColor === c.hex ? `0 0 14px ${c.hex}` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Stock and Threshold */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Initial Stock (Pills)
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Low Alert Limit
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMed ? 'Save Changes' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
