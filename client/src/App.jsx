import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MicrogridStats from './components/MicrogridStats';
import Marketplace from './components/Marketplace';
import ImpactLedger from './components/ImpactLedger';
import WalletView from './components/WalletView';
import TradeModal from './components/TradeModal';
import NewListingModal from './components/NewListingModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [theme, setTheme] = useState(() => localStorage.getItem('voltshare_theme') || 'dark');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [selectedListingForTrade, setSelectedListingForTrade] = useState(null);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('voltshare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch all live data
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, listingsRes, statusRes, impactRes, tradesRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/listings').then(r => r.json()),
        fetch('/api/microgrid/status').then(r => r.json()),
        fetch('/api/impact/sdg7').then(r => r.json()),
        fetch('/api/trades').then(r => r.json())
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (listingsRes.success) setListings(listingsRes.data);
      if (statusRes.success) {
        setSummary(statusRes.data.summary);
      }
      if (impactRes.success) setImpactData(impactRes.data);
      if (tradesRes.success) setRecentTrades(tradesRes.data);
    } catch (err) {
      console.error('Error fetching VoltShare data:', err);
    }
  }, []);

  // Fetch individual current user profile when currentUserId changes
  const fetchCurrentUser = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (err) {
      console.error('Error loading current user profile:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (currentUserId) {
      fetchCurrentUser(currentUserId);
    }
  }, [currentUserId, fetchCurrentUser]);

  // Handle wallet top-up
  const handleTopupWallet = async (amount = 1000) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCurrentUser(currentUser.id);
        await fetchData();
        showToast(`Added ₹${amount} to escrow wallet!`);
      }
    } catch (err) {
      console.error('Top-up failed:', err);
    }
  };

  // Handle listing deletion
  const handleDeleteListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Energy listing deleted successfully');
        await fetchData();
        if (currentUser) await fetchCurrentUser(currentUser.id);
      } else {
        showToast(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      console.error('Delete listing error:', err);
      showToast('Error deleting listing');
    }
  };

  const handleSelectUser = (id) => {
    setCurrentUserId(id);
    const u = users.find(x => x.id === id);
    if (u) {
      const roleLabel = u.role === 'prosumer' ? 'Solar Producer' : u.role === 'consumer' ? 'Energy Buyer' : 'Grid Operator';
      showToast(`Switched persona to ${u.name} (${roleLabel})`);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-alert" role="alert" style={{ position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 300, background: 'var(--bg-surface-elevated)', border: '1px solid var(--accent-green)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontSize: '0.9rem', animation: 'fadeIn 0.2s ease-out' }}>
          <CheckCircle2 size={18} color="var(--accent-green-bright)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={() => {
          fetchData();
          if (currentUser) fetchCurrentUser(currentUser.id);
          showToast('Refreshed microgrid metrics from server');
        }}
      />

      {/* Primary KPI Header & Academic Banner */}
      <MicrogridStats summary={summary} currentUser={currentUser} />

      {/* Main Content View Switcher */}
      <main id="main-content" style={{ marginTop: '0.5rem' }}>
        {activeTab === 'marketplace' && (
          <Marketplace
            listings={listings}
            currentUser={currentUser}
            onOpenTradeModal={(listing) => setSelectedListingForTrade(listing)}
            onOpenNewListingModal={() => setIsNewListingModalOpen(true)}
            onDeleteListing={handleDeleteListing}
            recentTrades={recentTrades}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactLedger
            impactData={impactData}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            currentUser={currentUser}
            onTopup={handleTopupWallet}
            onDeleteListing={handleDeleteListing}
            onRefresh={() => fetchCurrentUser(currentUserId)}
          />
        )}
      </main>

      {/* Modals */}
      {selectedListingForTrade && (
        <TradeModal
          listing={selectedListingForTrade}
          currentUser={currentUser}
          onClose={() => setSelectedListingForTrade(null)}
          onTradeSuccess={() => {
            fetchData();
            if (currentUser) fetchCurrentUser(currentUser.id);
            showToast('P2P Clean Energy Settlement executed successfully!');
          }}
          onTopupWallet={handleTopupWallet}
        />
      )}

      {isNewListingModalOpen && (
        <NewListingModal
          currentUser={currentUser}
          onClose={() => setIsNewListingModalOpen(false)}
          onCreated={() => {
            fetchData();
            if (currentUser) fetchCurrentUser(currentUser.id);
            showToast('Surplus solar listed to the community microgrid!');
          }}
        />
      )}

      {/* Academic Footer */}
      <footer style={{ marginTop: '3.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <div>
          <strong>VoltShare Platform</strong> &bull; Developed by <strong>Omwardhan Mishra</strong> (240410107094, TY CE 4 Batch A)
          <br />
          Sardar Vallabhbhai Patel Institute of Technology (SVIT), Vasad &bull; Affiliated to Gujarat Technological University (GTU)
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Subject: Web Application Development (BE05000281)</span>
          <span>&bull;</span>
          <span>PBL Activity 3: Complex Problem Solving (CPS)</span>
        </div>
      </footer>
    </div>
  );
}
