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
  X 
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formStock, setFormStock] = useState(30);
  const [formThreshold, setFormThreshold] = useState(5);

  const colorPresets = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6'];

  const fetchMedicines = async () => {
    if (!activeProfileId) return;
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
        showToast('Medicine updated successfully!', 'success');
      } else {
        await api.createMedicine(payload);
        showToast('Medicine added to profile!', 'success');
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? All associated reminders will also be deleted.`)) return;
    try {
      await api.deleteMedicine(id);
      showToast(`${name} deleted.`, 'info');
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRefill = async (id) => {
    const qtyStr = prompt('Enter quantity to refill:', '30');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return alert('Please enter a valid positive number');

    try {
      await api.refillMedicine(id, qty);
      showToast(`Refilled +${qty} units!`, 'success');
      fetchMedicines();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="page-top-row">
        <div className="page-title">
          <h1>Prescribed Medicines</h1>
          <p>Manage prescriptions, dosages, and stock inventories</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

          <button onClick={openAddModal} className="btn-primary">
            <Plus size={16} />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <input
          className="input-field"
          type="text"
          placeholder="Search medicines by name or dosage..."
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
      </div>

      {/* Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-state-icon">💊</span>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>
            {searchQuery ? 'No matching medicines found' : 'No medicines added yet'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {searchQuery ? 'Try a different search term.' : 'Add prescriptions to start scheduling reminders.'}
          </p>
          {!searchQuery && (
            <button onClick={openAddModal} className="btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} />
              <span>Add First Medicine</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredMedicines.map((m) => {
            const isLow = (m.stock ?? 0) <= (m.lowStockThreshold ?? 5);
            return (
              <div key={m.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: m.color || '#10b981',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        boxShadow: `0 0 16px ${m.color || '#10b981'}80`,
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        💊
                      </div>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                          {m.name}
                        </h3>
                        <span style={{ fontSize: '13px', color: '#c7d2fe', fontWeight: 600 }}>
                          {m.dosage}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditModal(m)} className="btn-icon" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="btn-icon" title="Delete">
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      marginTop: '14px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}>
                      {m.description}
                    </p>
                  )}
                </div>

                {/* Stock Footer */}
                <div style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Stock Balance
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: isLow ? '#f87171' : '#34d399'
                      }}>
                        {m.stock ?? 0} units
                      </span>
                      {isLow && (
                        <span className="badge badge-missed" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRefill(m.id)}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <RefreshCw size={12} />
                    <span>Refill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
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
                  placeholder="e.g. Lisinopril, Metformin, Vitamin D3"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Dosage / Strength*
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. 10mg, 500mg, 1 Capsule, 2 Drops"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Instructions / Notes
                </label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  placeholder="e.g. Take with food, drink a full glass of water"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Color Badge
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: formColor === c ? '3px solid #fff' : '2px solid transparent',
                        boxShadow: formColor === c ? `0 0 12px ${c}` : 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Current Stock (Pills)
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
                    Low Alert Threshold
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMed ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
