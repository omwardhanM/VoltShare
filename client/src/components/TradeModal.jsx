import React, { useState } from 'react';
import { X, Zap, ShieldCheck, IndianRupee, Leaf, CheckCircle2, AlertCircle, Printer } from 'lucide-react';

export default function TradeModal({ 
  listing, 
  currentUser, 
  onClose, 
  onTradeSuccess,
  onTopupWallet 
}) {
  const [kwhToBuy, setKwhToBuy] = useState(
    Math.min(5, listing ? listing.available_kwh : 1)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tradeReceipt, setTradeReceipt] = useState(null);

  if (!listing) return null;

  const totalCost = Number((kwhToBuy * listing.price_per_kwh).toFixed(2));
  const discomBenchmarkCost = Number((kwhToBuy * 7.10).toFixed(2));
  const moneySaved = Number(Math.max(0, discomBenchmarkCost - totalCost).toFixed(2));
  const co2AvoidedKg = Number((kwhToBuy * 0.82).toFixed(2));
  const hasEnoughFunds = currentUser && currentUser.wallet_balance >= totalCost;

  const handleExecuteTrade = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_id: currentUser.id,
          kwh_to_buy: kwhToBuy
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Trade execution failed');
      }

      setTradeReceipt(data.data);
      onTradeSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', background: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Clean Energy Purchase</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {tradeReceipt ? (
          /* Success Receipt View */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>P2P Energy Settlement Complete</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Transferred <strong>{tradeReceipt.trade.kwh_traded} kWh</strong> of certified clean solar power.
            </p>

            <div className="metadata-summary-box" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trade Hash / ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>#VS-TR-{tradeReceipt.trade.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Energy Seller:</span>
                <strong>{tradeReceipt.trade.seller_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Energy Buyer:</span>
                <strong>{currentUser?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Deducted:</span>
                <strong style={{ color: 'var(--accent-green-bright)' }}>₹{tradeReceipt.trade.total_cost.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DISCOM Grid Tariff Saved:</span>
                <strong style={{ color: '#38bdf8' }}>₹{tradeReceipt.moneySavedInr.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>CO₂ Mitigated (CEA Baseline):</span>
                <strong style={{ color: 'var(--accent-green)' }}>{tradeReceipt.co2MitigatedKg} kg CO₂</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining Wallet:</span>
                <strong>₹{tradeReceipt.buyerWalletRemaining.toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrintReceipt}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button className="btn btn-primary" style={{ flex: 1.2 }} onClick={onClose}>
                Done & Return
              </button>
            </div>
          </div>
        ) : (
          /* Trade Execution Form */
          <div>
            <div className="metadata-summary-box" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>{listing.seller_name}</strong>
                <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>₹{listing.price_per_kwh.toFixed(2)} / kWh</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {listing.source_type} &bull; {listing.seller_location}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Pool Available: <strong>{listing.available_kwh} kWh</strong>
              </div>
            </div>

            {/* Quantity Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Select Energy Quantity</span>
                <strong style={{ color: 'var(--accent-green-bright)' }}>{kwhToBuy} kWh</strong>
              </div>
              <input 
                type="range"
                min="0.5"
                max={listing.available_kwh}
                step="0.5"
                value={kwhToBuy}
                onChange={(e) => setKwhToBuy(Number(e.target.value))}
                className="control-slider"
              />
            </div>

            {/* Financial & Environmental Breakdown */}
            <div className="metadata-summary-box" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>P2P Peer Cost ({kwhToBuy} kWh @ ₹{listing.price_per_kwh}/u):</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>₹{totalCost.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Grid Equivalent Cost (MGVCL @ ₹7.10/u):</span>
                <span>₹{discomBenchmarkCost.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                <span style={{ fontWeight: 600 }}>Net Money Saved:</span>
                <strong style={{ fontWeight: 700 }}>₹{moneySaved.toFixed(2)} (Save {Math.round((moneySaved / discomBenchmarkCost) * 100)}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-green-bright)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Leaf size={14} /> Carbon Mitigated:
                </span>
                <strong>{co2AvoidedKg} kg CO₂</strong>
              </div>
            </div>

            {/* Wallet Balance Verification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Buyer: <strong>{currentUser ? currentUser.name : 'Unknown'}</strong>
              </span>
              <span>
                Wallet Balance: <strong style={{ color: hasEnoughFunds ? 'var(--accent-green-bright)' : 'var(--accent-red)' }}>
                  ₹{currentUser ? currentUser.wallet_balance.toFixed(2) : 0}
                </strong>
              </span>
            </div>

            {!hasEnoughFunds && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>Insufficient balance for this order.</span>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => onTopupWallet(1000)}>
                  + Add ₹1,000
                </button>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={loading || !hasEnoughFunds || kwhToBuy <= 0}
              onClick={handleExecuteTrade}
            >
              {loading ? 'Settling Smart Microgrid Trade...' : `Confirm & Purchase ${kwhToBuy} kWh (₹${totalCost.toFixed(2)})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
