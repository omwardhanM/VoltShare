import React, { useState } from 'react';
import { User, Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sun, CheckCircle2, Trash2, Zap } from 'lucide-react';

export default function WalletView({ currentUser, onTopup, onDeleteListing, onRefresh }) {
  const [topupAmount, setTopupAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
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

  if (!currentUser) return null;

  const handleTopup = async () => {
    setLoading(true);
    setMsg('');
    try {
      await onTopup(topupAmount);
      setMsg(`Successfully added ₹${topupAmount} to your wallet.`);
    } catch (err) {
      setMsg('Top up error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>
            <User color="var(--accent-green)" size={24} />
            User Energy Portfolio & Digital Escrow Wallet
          </h2>
          <p>
            Manage peer energy balances, track solar producer revenue, and review verified settlement receipts.
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green-bright)' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Profile & Wallet Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-green-bright)', letterSpacing: '0.05em' }}>
                Active Participant
              </span>
              <h3 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>{currentUser.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{currentUser.email}</p>
            </div>
            <span className={currentUser.role === 'prosumer' ? 'badge-emerald' : 'badge-cyan'} style={{ padding: '4px 10px', fontSize: '11px' }}>
              {currentUser.role === 'prosumer' ? 'SOLAR PRODUCER' : currentUser.role === 'consumer' ? 'ENERGY BUYER' : 'GRID OPERATOR'}
            </span>
          </div>

          <div style={{ background: 'var(--bg-glass-input)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.location}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Solar PV Capacity:</span>
              <div style={{ fontWeight: 600, color: '#fbbf24' }}>{currentUser.solar_capacity_kw} kW</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Clean Power Shared:</span>
              <div style={{ fontWeight: 600, color: 'var(--accent-green-bright)' }}>{currentUser.clean_kwh_shared} kWh</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Clean Power Bought:</span>
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{currentUser.clean_kwh_purchased} kWh</div>
            </div>
          </div>
        </div>

        {/* Digital Wallet Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Escrow Wallet Balance
              </span>
              <Wallet size={20} color="var(--accent-green)" />
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ₹{currentUser.wallet_balance.toFixed(2)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Funds held in escrow for peer microgrid transactions and instant solar producer settlements.
            </p>
          </div>

          {/* Top-up Form */}
          <div style={{ background: 'var(--bg-glass-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>Quick Top-Up (Demo Testing)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[500, 1000, 2000].map(amt => (
                <button
                  key={amt}
                  className={`btn btn-sm ${topupAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setTopupAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
              <button
                className="btn btn-sm btn-primary"
                onClick={handleTopup}
                disabled={loading}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User's Energy Listings */}
      {currentUser.myListings && currentUser.myListings.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--accent-primary)" />
            <span>My Energy Listings</span>
          </h3>

          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Available / Total</th>
                  <th>Price</th>
                  <th>Time Window</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUser.myListings.map(listing => {
                  const isDeletable = listing.status === 'active' || listing.status === 'partially_sold';
                  return (
                    <tr key={listing.id}>
                      <td style={{ fontWeight: 600 }}>{listing.source_type}</td>
                      <td>{listing.available_kwh} / {listing.energy_kwh} kWh</td>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                        ₹{listing.price_per_kwh.toFixed(2)}/kWh
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{listing.time_window}</td>
                      <td>
                        <span className={isDeletable ? 'status-badge-active' : 'status-badge-sold'}>
                          {listing.status === 'partially_sold' ? 'Partially Sold' : listing.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {isDeletable ? (
                          <button
                            className="btn btn-sm btn-secondary"
                            data-testid={`portfolio-delete-listing-${listing.id}`}
                            style={{ 
                              color: '#ef4444', 
                              borderColor: confirmDeleteId === listing.id ? '#ef4444' : 'rgba(239, 68, 68, 0.3)', 
                              background: confirmDeleteId === listing.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontWeight: confirmDeleteId === listing.id ? 700 : 500
                            }}
                            title={confirmDeleteId === listing.id ? "Click again to confirm deletion" : "Delete this listing"}
                            onClick={() => handleDeleteClick(listing.id)}
                          >
                            <Trash2 size={12} />
                            <span>{confirmDeleteId === listing.id ? 'Confirm?' : 'Delete'}</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User's Transaction Ledger */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
          Recent Transactions for {currentUser.name}
        </h3>

        {(!currentUser.recentTrades || currentUser.recentTrades.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
            No trades executed yet for this participant account. Transactions will appear here once executed on the marketplace.
          </p>
        ) : (
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Units</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>CO₂ Impact</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentUser.recentTrades.map(trade => {
                  const isBuyer = trade.buyer_id === currentUser.id;
                  return (
                    <tr key={trade.id}>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.3rem', 
                          fontWeight: 700, 
                          color: isBuyer ? '#38bdf8' : 'var(--accent-green-bright)',
                          fontSize: '0.8rem'
                        }}>
                          {isBuyer ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          {isBuyer ? 'BOUGHT' : 'SOLD'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {isBuyer ? trade.seller_name : trade.buyer_name}
                      </td>
                      <td>{trade.kwh_traded} kWh</td>
                      <td>₹{trade.price_per_kwh.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: isBuyer ? '#ef4444' : 'var(--accent-green-bright)' }}>
                        {isBuyer ? `-₹${trade.total_cost.toFixed(2)}` : `+₹${trade.total_cost.toFixed(2)}`}
                      </td>
                      <td style={{ color: 'var(--accent-green)' }}>
                        {trade.co2_avoided_kg} kg CO₂
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {trade.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
