import React from 'react';
import { Sun, Zap, Leaf, IndianRupee, Activity, ShieldCheck } from 'lucide-react';

export default function MicrogridStats({ summary, currentUser }) {
  if (!summary) return null;

  return (
    <div>
      {/* Academic Evaluation Header Banner */}
      <div className="college-meta-banner">
        <div className="college-meta-left">
          <span className="college-pill">PBL CPS Project</span>
          <span style={{ fontWeight: 600 }}>
            Web Application Development (BE05000281) | SVIT Vasad, GTU
          </span>
        </div>
        <div className="college-meta-right">
          <span>Student: <strong>Omwardhan Mishra</strong> (240410107094)</span>
          <span>|</span>
          <span>Class: <strong>TY CE 4, Batch A</strong></span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="metrics-grid" style={{ marginTop: '1rem' }}>
        {/* Metric 1: Live Generation */}
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-title">Clean Solar Generation</span>
            <div className="metric-icon-wrap">
              <Sun size={16} />
            </div>
          </div>
          <div>
            <div className="metric-value">
              {summary.liveGenerationKw} <span className="metric-unit">kW</span>
            </div>
            <div className="metric-subtext">
              <span className="status-dot-static"></span>
              <span>Online Array Capacity: {summary.totalSolarCapacityKw} kW PV</span>
            </div>
          </div>
        </div>

        {/* Metric 2: P2P Energy Traded */}
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-title">P2P Energy Traded</span>
            <div className="metric-icon-wrap">
              <Zap size={16} />
            </div>
          </div>
          <div>
            <div className="metric-value">
              {summary.totalKwhTraded} <span className="metric-unit">kWh</span>
            </div>
            <div className="metric-subtext">
              <Activity size={13} color="var(--accent-blue-bright)" />
              <span>{summary.totalTradesCount} Transactions Settled</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Carbon Offset */}
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-title">CEA CO2 Avoided</span>
            <div className="metric-icon-wrap">
              <Leaf size={16} />
            </div>
          </div>
          <div>
            <div className="metric-value">
              {summary.totalCo2AvoidedKg} <span className="metric-unit">kg</span>
            </div>
            <div className="metric-subtext">
              <span>{(summary.totalCo2AvoidedKg / 21.77).toFixed(1)} Tree Absorption Equiv.</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Buyer Bill Savings */}
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-title">Buyer Bill Savings</span>
            <div className="metric-icon-wrap">
              <IndianRupee size={16} />
            </div>
          </div>
          <div>
            <div className="metric-value">
              INR {summary.totalGridSavingsInr}
            </div>
            <div className="metric-subtext">
              <ShieldCheck size={13} color="var(--accent-amber-bright)" />
              <span>Benchmark vs MGVCL (INR 7.10/kWh)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
