import React, { useState } from 'react';
import { Sun, Plus, MapPin, Zap, ArrowRight, ShieldCheck, Clock, CheckCircle, Trash2 } from 'lucide-react';

export default function Marketplace({ 
  listings, 
  currentUser, 
  onOpenTradeModal, 
  onOpenNewListingModal,
  onDeleteListing,
  recentTrades 
}) {
  const [filterType, setFilterType] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    if (confirmDeleteId === id) {
      if (onDeleteListing) onDeleteListing(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId(prev => prev === id ? null : prev);
      }, 7000);
    }
  };

  const filteredListings = listings.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'cheap') return item.price_per_kwh <= 4.50;
    if (filterType === 'storage') return item.source_type.toLowerCase().includes('storage') || item.source_type.toLowerCase().includes('battery');
    if (filterType === 'bifacial') return item.source_type.toLowerCase().includes('bifacial');
    return true;
  });

  return (
    <div>
      {/* Section Header with action button */}
      <div className="section-header">
        <div>
          <h2>
            <Zap color="var(--accent-green-bright)" size={20} />
            P2P Clean Energy Marketplace
          </h2>
          <p>
            Decentralized marketplace for trading certified rooftop solar energy across local distribution feeders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            id="btn-create-listing"
            className="btn btn-primary"
            onClick={onOpenNewListingModal}
          >
            <Plus size={16} />
            <span>List Surplus Energy</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Energy Offers' },
          { id: 'cheap', label: 'Under INR 4.50/kWh' },
          { id: 'bifacial', label: 'Bifacial Solar' },
          { id: 'storage', label: 'Battery Backed' }
        ].map(filter => (
          <button
            key={filter.id}
            className={`btn btn-sm ${filterType === filter.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid of Listings */}
      <div className="marketplace-grid">
        {filteredListings.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <Sun size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No active energy listings found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Create an energy offer or switch filters.
            </p>
          </div>
        ) : (
          filteredListings.map(item => {
            const isMyListing = currentUser && currentUser.id === item.seller_id;
            const savingsPercent = Math.round(((7.10 - item.price_per_kwh) / 7.10) * 100);

            return (
              <div key={item.id} className="glass-panel energy-card">
                <div>
                  <div className="energy-badge-row">
                    <span className="source-badge">
                      <Sun size={12} />
                      {item.source_type}
                    </span>
                    <span className="status-badge-active">
                      Available
                    </span>
                  </div>

                  <div className="seller-info">
                    <div className="seller-name">{item.seller_name}</div>
                    <div className="seller-loc">
                      <MapPin size={12} color="var(--accent-green-bright)" />
                      <span>{item.seller_location}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} />
                    <span>Window: <strong>{item.time_window}</strong></span>
                  </div>

                  <div className="energy-pricing-box">
                    <div>
                      <div className="price-unit">INR {item.price_per_kwh.toFixed(2)}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}> /kWh</span></div>
                      <div className="price-sub">DISCOM Grid: INR 7.10/kWh</div>
                    </div>
                    <div className="savings-tag">
                      Save {savingsPercent}%
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem', background: 'var(--bg-glass-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Available Pool</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.available_kwh} / {item.energy_kwh} kWh</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, (item.available_kwh / item.energy_kwh) * 100)}%`, 
                          height: '100%', 
                          background: 'var(--accent-green)' 
                        }} 
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                      {item.notes}
                    </p>
                  )}
                </div>

                <div>
                  {isMyListing ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent-green-bright)', padding: '0.45rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                        Active Personal Listing
                      </div>
                      <button
                        className="btn btn-secondary"
                        data-testid={`delete-listing-${item.id}`}
                        style={{ 
                          padding: '0 10px', 
                          height: '32px', 
                          color: '#ef4444', 
                          borderColor: confirmDeleteId === item.id ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                          background: confirmDeleteId === item.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          fontWeight: confirmDeleteId === item.id ? 700 : 500
                        }}
                        title={confirmDeleteId === item.id ? "Click again to confirm deletion" : "Delete this listing"}
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 size={13} />
                        <span>{confirmDeleteId === item.id ? 'Confirm?' : 'Delete'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => onOpenTradeModal(item)}
                    >
                      <span>Purchase Energy</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settlements Table */}
      {recentTrades && recentTrades.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <CheckCircle size={16} color="var(--accent-green-bright)" />
            <h3 style={{ fontSize: '1rem' }}>Settled P2P Transactions (Distribution Bus Ledger)</h3>
          </div>

          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Volume</th>
                  <th>Clearing Rate</th>
                  <th>Settlement</th>
                  <th>CO2 Offset</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.slice(0, 5).map(trade => (
                  <tr key={trade.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{trade.timestamp.split(' ')[1] || 'Recent'}</td>
                    <td style={{ fontWeight: 600 }}>{trade.buyer_name}</td>
                    <td>{trade.seller_name}</td>
                    <td><span style={{ color: 'var(--accent-green-bright)', fontWeight: 600 }}>{trade.kwh_traded} kWh</span></td>
                    <td>INR {trade.price_per_kwh.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>INR {trade.total_cost.toFixed(2)}</td>
                    <td>
                      <span style={{ color: 'var(--accent-green-bright)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={13} />
                        {trade.co2_avoided_kg} kg
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
