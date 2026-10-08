import React, { useState } from 'react';
import { Award, Leaf, Globe, Flame, ShieldCheck, Download, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export default function ImpactLedger({ impactData, currentUser }) {
  const [showCertificate, setShowCertificate] = useState(false);

  if (!impactData) return null;
  const { sdgMetrics, leaderboard } = impactData;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>
            <Award color="var(--accent-green)" size={24} />
            UN SDG 7 & SDG 13 Clean Energy Impact Ledger
          </h2>
          <p>
            Quantified carbon mitigation, coal displacement, and community access metrics aligned with UN Global Goals.
          </p>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => setShowCertificate(!showCertificate)}
        >
          <Award size={18} color="var(--accent-green)" />
          <span>{showCertificate ? 'Hide Certificate' : 'View Green Certificate'}</span>
        </button>
      </div>

      {/* Certificate Modal / View */}
      {showCertificate && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1.5px solid var(--accent-green)', background: 'var(--bg-glass-input)' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-full)', color: 'var(--accent-green-bright)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Official Certified Microgrid Contribution
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Certificate of Clean Energy Stewardship</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              This certifies that <strong>{currentUser ? currentUser.name : 'Community Participant'}</strong> ({currentUser ? currentUser.location : 'Vadodara, Gujarat'}) has actively accelerated decentralized clean solar adoption under UN SDG 7.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'var(--bg-glass-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clean Solar Shared</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
                  {currentUser ? currentUser.clean_kwh_shared : 0} kWh
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Green Power Adopted</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {currentUser ? currentUser.clean_kwh_purchased : 0} kWh
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct CO₂ Mitigated</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green-bright)' }}>
                  {currentUser ? (((currentUser.clean_kwh_shared || 0) + (currentUser.clean_kwh_purchased || 0)) * 0.82).toFixed(1) : 0} kg
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <span>Verified by: <strong>VoltShare Microgrid Protocol &bull; SVIT Vasad</strong></span>
              <span>Baseline: <strong>CEA 0.82 kg CO₂/kWh Standard</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* SDG Target Alignment Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: SDG 7.1 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green-bright)', padding: '0.4rem', borderRadius: '8px' }}>
              <Globe size={20} />
            </div>
            <h4 style={{ fontSize: '1.1rem' }}>SDG Target 7.1: Universal Access</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Empowers apartment flat residents without individual rooftop access to purchase clean solar energy from neighboring solar producers at lower rates than commercial utilities.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--accent-green-bright)', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Community Access Rate: 94.8%
          </div>
        </div>

        {/* Card 2: SDG 7.2 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '0.4rem', borderRadius: '8px' }}>
              <Leaf size={20} />
            </div>
            <h4 style={{ fontSize: '1.1rem' }}>SDG Target 7.2: Renewable Share</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Incentivizes rooftop owners to maximize local solar installation capacity beyond immediate self-consumption by guaranteeing attractive peer payback economics.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
            <TrendingUp size={16} /> Total Clean Power Circulated: {sdgMetrics.totalCleanKwhCirculated} kWh
          </div>
        </div>

        {/* Card 3: SDG 13 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.4rem', borderRadius: '8px' }}>
              <Flame size={20} />
            </div>
            <h4 style={{ fontSize: '1.1rem' }}>SDG 13: Climate Action (Decarbonization)</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Directly replaces coal-fired grid generation. Every 1 kWh of solar distributed averts 0.82 kg of CO₂ and 0.53 kg of thermal coal extraction.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Coal Displaced: {sdgMetrics.coalDisplacedKg} kg
          </div>
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--accent-compute)" />
          Neighborhood Solar Producers & Energy Buyers Leaderboard
        </h3>

        <div className="custom-table-wrap">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Participant</th>
                <th>Role</th>
                <th>Location</th>
                <th>Clean Energy Shared</th>
                <th>Clean Energy Adopted</th>
                <th>Total CO₂ Offset</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => (
                <tr key={user.name}>
                  <td>
                    <span style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--bg-glass-input)', 
                      color: idx <= 2 ? '#000' : 'var(--text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      {idx + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>
                    <span className={user.role === 'prosumer' ? 'badge-emerald' : 'badge-cyan'}>
                      {user.role === 'prosumer' ? 'Solar Producer' : user.role === 'consumer' ? 'Energy Buyer' : 'Grid Operator'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.location}</td>
                  <td style={{ fontWeight: 600 }}>{user.clean_kwh_shared} kWh</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.clean_kwh_purchased} kWh</td>
                  <td>
                    <strong style={{ color: 'var(--accent-green-bright)' }}>
                      {user.co2_impact ? user.co2_impact.toFixed(1) : 0} kg CO₂
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
