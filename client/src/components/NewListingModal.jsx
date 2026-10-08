import React, { useState } from 'react';
import { X, Sun, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewListingModal({ currentUser, onClose, onCreated }) {
  const [energyKwh, setEnergyKwh] = useState(12.5);
  const [pricePerKwh, setPricePerKwh] = useState(4.50);
  const [sourceType, setSourceType] = useState('Rooftop Bifacial Solar');
  const [timeWindow, setTimeWindow] = useState('11:00 AM - 03:00 PM');
  const [notes, setNotes] = useState('Clean rooftop solar generation from 5.5 kW array');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: currentUser.id,
          energy_kwh: Number(energyKwh),
          price_per_kwh: Number(pricePerKwh),
          source_type: sourceType,
          time_window: timeWindow,
          notes: notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to list energy');
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', background: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={15} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Sell Surplus Solar Energy</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="metadata-summary-box" style={{ marginBottom: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Selling as: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</strong>
              <span style={{ color: 'var(--text-muted)' }}> ({currentUser?.location})</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="energy-kwh-input">Surplus Clean Energy (kWh)</label>
            <input 
              id="energy-kwh-input"
              type="number"
              step="0.5"
              min="1"
              max="500"
              required
              className="form-input"
              value={energyKwh}
              onChange={(e) => setEnergyKwh(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <label>Offer Price per Unit (₹/kWh)</label>
              <strong style={{ color: 'var(--accent-green-bright)' }}>₹{Number(pricePerKwh).toFixed(2)}</strong>
            </div>
            <input 
              type="range"
              min="2.50"
              max="6.50"
              step="0.10"
              className="control-slider"
              value={pricePerKwh}
              onChange={(e) => setPricePerKwh(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>₹2.50 (Net-metering floor)</span>
              <span>₹7.10 (DISCOM Grid ceiling)</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="source-type-select">Clean Generation Technology</label>
            <select
              id="source-type-select"
              className="form-input"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
            >
              <option value="Rooftop Bifacial Solar">Rooftop Bifacial Solar (High Efficiency)</option>
              <option value="Monocrystalline Solar PV">Monocrystalline Solar PV (PM Surya Ghar)</option>
              <option value="Solar + LiFePO4 Battery Storage">Solar + LiFePO4 Battery Storage</option>
              <option value="Community Microgrid Node">Community Microgrid Shared Node</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time-window-input">Dispatch Time Window</label>
            <input 
              id="time-window-input"
              type="text"
              required
              className="form-input"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              placeholder="e.g. Today 11:00 AM - 03:00 PM"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes-input">Batch Description / Notes</label>
            <input 
              id="notes-input"
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High irradiation batch, inverter certified"
            />
          </div>

          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Publishing to Microgrid...' : `Publish ${energyKwh} kWh at ₹${Number(pricePerKwh).toFixed(2)}/u`}
          </button>
        </form>
      </div>
    </div>
  );
}
