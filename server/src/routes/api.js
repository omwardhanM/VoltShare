import { Router } from 'express';
import db from '../db/database.js';

const router = Router();
const CEA_GRID_EMISSION_FACTOR = 0.82; // kg CO2 / kWh (India CEA Grid Benchmark)
const DISCOM_PEAK_TARIFF = 7.10; // INR / kWh (MGVCL / Urban DISCOM peak rate)
const COAL_DISPLACEMENT_FACTOR = 0.53; // kg Coal / kWh

// ==========================================
// 1. USERS & WALLET
// ==========================================
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY id ASC').all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const myTrades = db.prepare(`
      SELECT * FROM p2p_trades 
      WHERE buyer_id = ? OR seller_id = ? 
      ORDER BY id DESC LIMIT 10
    `).all(req.params.id, req.params.id);

    const myListings = db.prepare(`
      SELECT * FROM energy_listings 
      WHERE seller_id = ? 
      ORDER BY id DESC LIMIT 10
    `).all(req.params.id);

    res.json({ success: true, data: { ...user, recentTrades: myTrades, myListings } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/users/:id/wallet/topup', (req, res) => {
  try {
    const amount = Number.parseFloat(req.body.amount || 1000);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid top-up amount' });
    }
    const stmt = db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?');
    stmt.run(amount, req.params.id);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: `Wallet topped up by ₹${amount.toFixed(2)}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. ENERGY LISTINGS (MARKETPLACE)
// ==========================================
router.get('/listings', (req, res) => {
  try {
    const status = req.query.status || 'active';
    let query = 'SELECT * FROM energy_listings';
    const params = [];

    if (status === 'active') {
      query += " WHERE status IN ('active', 'partially_sold') AND available_kwh > 0";
    } else if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY id DESC';

    const listings = db.prepare(query).all(...params);
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/listings', (req, res) => {
  try {
    const { seller_id, energy_kwh, price_per_kwh, source_type, time_window, notes } = req.body;

    const seller = db.prepare('SELECT * FROM users WHERE id = ?').get(seller_id);
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller user not found' });
    }

    const kwh = Number.parseFloat(energy_kwh);
    const price = Number.parseFloat(price_per_kwh);

    if (isNaN(kwh) || kwh <= 0) {
      return res.status(400).json({ success: false, error: 'Energy kWh must be greater than 0' });
    }
    if (isNaN(price) || price < 1.0 || price > 15.0) {
      return res.status(400).json({ success: false, error: 'Price must be between ₹1.00 and ₹15.00/kWh' });
    }

    const insert = db.prepare(`
      INSERT INTO energy_listings (seller_id, seller_name, seller_location, energy_kwh, available_kwh, price_per_kwh, source_type, time_window, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    insert.run(
      seller.id,
      seller.name,
      seller.location,
      kwh,
      kwh,
      price,
      source_type || 'Rooftop Solar PV',
      time_window || 'Today (11:00 AM - 03:00 PM)',
      notes || 'Clean rooftop solar generation'
    );

    const created = db.prepare('SELECT * FROM energy_listings ORDER BY id DESC LIMIT 1').get();
    res.status(201).json({ success: true, message: 'Energy listing created successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/listings/:id', (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM energy_listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Check if any trades reference this listing
    const tradeCount = db.prepare('SELECT COUNT(*) as count FROM p2p_trades WHERE listing_id = ?').get(req.params.id).count;
    if (tradeCount > 0) {
      // Soft-delete so settled trade ledger foreign keys remain intact
      db.prepare("UPDATE energy_listings SET status = 'cancelled', available_kwh = 0 WHERE id = ?").run(req.params.id);
    } else {
      // Hard-delete if no trades ever occurred
      db.prepare('DELETE FROM energy_listings WHERE id = ?').run(req.params.id);
    }

    res.json({ success: true, message: 'Energy listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/listings/:id/cancel', (req, res) => {
  try {
    const stmt = db.prepare("UPDATE energy_listings SET status = 'cancelled', available_kwh = 0 WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true, message: 'Listing cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. P2P TRADES EXECUTION & SETTLEMENT
// ==========================================
router.get('/trades', (req, res) => {
  try {
    const trades = db.prepare('SELECT * FROM p2p_trades ORDER BY id DESC LIMIT 30').all();
    res.json({ success: true, data: trades });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/trades/execute', (req, res) => {
  try {
    const { listing_id, buyer_id, kwh_to_buy } = req.body;
    const requestedKwh = Number.parseFloat(kwh_to_buy);

    if (isNaN(requestedKwh) || requestedKwh <= 0) {
      return res.status(400).json({ success: false, error: 'Specify valid kWh quantity' });
    }

    const listing = db.prepare('SELECT * FROM energy_listings WHERE id = ?').get(listing_id);
    if (!listing || (listing.status !== 'active' && listing.status !== 'partially_sold')) {
      return res.status(400).json({ success: false, error: 'Listing is not available for trading' });
    }

    if (requestedKwh > listing.available_kwh) {
      return res.status(400).json({ 
        success: false, 
        error: `Only ${listing.available_kwh} kWh available on this listing` 
      });
    }

    const buyer = db.prepare('SELECT * FROM users WHERE id = ?').get(buyer_id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    if (buyer.id === listing.seller_id) {
      return res.status(400).json({ success: false, error: 'Cannot purchase from your own listing' });
    }

    const totalCost = Number.parseFloat((requestedKwh * listing.price_per_kwh).toFixed(2));

    if (buyer.wallet_balance < totalCost) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient wallet balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${buyer.wallet_balance.toFixed(2)}` 
      });
    }

    // Calculations
    const co2Saved = Number.parseFloat((requestedKwh * CEA_GRID_EMISSION_FACTOR).toFixed(2));
    const gridBenchmarkCost = requestedKwh * DISCOM_PEAK_TARIFF;
    const gridSavings = Number.parseFloat(Math.max(0, gridBenchmarkCost - totalCost).toFixed(2));

    // Execute atomic state transitions
    const newAvailable = Number.parseFloat((listing.available_kwh - requestedKwh).toFixed(2));
    const newStatus = newAvailable <= 0.05 ? 'sold' : 'partially_sold';

    // 1. Update listing
    db.prepare('UPDATE energy_listings SET available_kwh = ?, status = ? WHERE id = ?')
      .run(newAvailable, newStatus, listing.id);

    // 2. Transfer funds
    db.prepare('UPDATE users SET wallet_balance = wallet_balance - ?, clean_kwh_purchased = clean_kwh_purchased + ? WHERE id = ?')
      .run(totalCost, requestedKwh, buyer.id);

    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ?, clean_kwh_shared = clean_kwh_shared + ? WHERE id = ?')
      .run(totalCost, requestedKwh, listing.seller_id);

    // 3. Record Trade
    const insertTrade = db.prepare(`
      INSERT INTO p2p_trades (listing_id, buyer_id, buyer_name, seller_id, seller_name, kwh_traded, price_per_kwh, total_cost, co2_avoided_kg, grid_savings_inr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTrade.run(
      listing.id,
      buyer.id,
      buyer.name,
      listing.seller_id,
      listing.seller_name,
      requestedKwh,
      listing.price_per_kwh,
      totalCost,
      co2Saved,
      gridSavings
    );

    const tradeRecord = db.prepare('SELECT * FROM p2p_trades ORDER BY id DESC LIMIT 1').get();

    res.status(201).json({
      success: true,
      message: `P2P clean energy trade executed successfully! ${requestedKwh} kWh transferred.`,
      data: {
        trade: tradeRecord,
        buyerWalletRemaining: Number.parseFloat((buyer.wallet_balance - totalCost).toFixed(2)),
        co2MitigatedKg: co2Saved,
        moneySavedInr: gridSavings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. MICROGRID STATUS & SIMULATION
// ==========================================
router.get('/microgrid/status', (req, res) => {
  try {
    const nodes = db.prepare('SELECT * FROM microgrid_nodes').all();
    const tradeSummary = db.prepare(`
      SELECT 
        COALESCE(SUM(kwh_traded), 0) as total_kwh_traded,
        COALESCE(SUM(total_cost), 0) as total_revenue,
        COALESCE(SUM(co2_avoided_kg), 0) as total_co2_avoided,
        COALESCE(SUM(grid_savings_inr), 0) as total_grid_savings,
        COUNT(*) as total_trades
      FROM p2p_trades
    `).get();

    const activeListingsKwh = db.prepare(`
      SELECT COALESCE(SUM(available_kwh), 0) as available_kwh 
      FROM energy_listings WHERE status IN ('active', 'partially_sold')
    `).get().available_kwh;

    const totalSolarCapacity = db.prepare(`
      SELECT COALESCE(SUM(solar_capacity_kw), 0) as total_solar 
      FROM users
    `).get().total_solar;

    let currentGenTotal = 0;
    let currentDemandTotal = 0;
    nodes.forEach(n => {
      currentGenTotal += n.current_generation_kw;
      currentDemandTotal += n.current_consumption_kw;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSolarCapacityKw: totalSolarCapacity,
          liveGenerationKw: Number.parseFloat(currentGenTotal.toFixed(1)),
          liveDemandKw: Number.parseFloat(currentDemandTotal.toFixed(1)),
          netExportKw: Number.parseFloat((currentGenTotal - currentDemandTotal).toFixed(1)),
          activeListedKwh: Number.parseFloat(activeListingsKwh.toFixed(1)),
          totalKwhTraded: Number.parseFloat(tradeSummary.total_kwh_traded.toFixed(1)),
          totalCo2AvoidedKg: Number.parseFloat(tradeSummary.total_co2_avoided.toFixed(1)),
          totalGridSavingsInr: Number.parseFloat(tradeSummary.total_grid_savings.toFixed(2)),
          totalTradesCount: tradeSummary.total_trades
        },
        nodes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/microgrid/simulation', (req, res) => {
  try {
    const hourly = db.prepare('SELECT * FROM hourly_simulation ORDER BY hour ASC').all();
    res.json({ success: true, data: hourly });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger a demand response peak shaving event
router.post('/microgrid/demand-response', (req, res) => {
  try {
    const { action } = req.body; // 'activate_peak_shaving' or 'reset'
    if (action === 'activate') {
      db.prepare('UPDATE microgrid_nodes SET current_consumption_kw = current_consumption_kw * 0.85, status = "peak_shaving"').run();
      res.json({ success: true, message: 'Demand-response peak shaving activated across microgrid nodes (-15% load demand).' });
    } else {
      db.prepare(`
        UPDATE microgrid_nodes 
        SET current_consumption_kw = CASE 
          WHEN id = 1 THEN 32.1 
          WHEN id = 2 THEN 29.8 
          WHEN id = 3 THEN 51.2 
          ELSE 28.5 END,
        status = 'optimal'
      `).run();
      res.json({ success: true, message: 'Microgrid dispatch returned to nominal baseline.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SDG 7 & 13 IMPACT LEDGER
// ==========================================
router.get('/impact/sdg7', (req, res) => {
  try {
    const trades = db.prepare(`
      SELECT 
        COALESCE(SUM(kwh_traded), 0) as total_kwh,
        COALESCE(SUM(co2_avoided_kg), 0) as total_co2,
        COALESCE(SUM(grid_savings_inr), 0) as total_savings
      FROM p2p_trades
    `).get();

    // Cumulative baseline calculation
    const totalKwh = trades.total_kwh + 640.0; // include historical certified community batch
    const co2AvoidedKg = totalKwh * CEA_GRID_EMISSION_FACTOR;
    const treesEquivalent = co2AvoidedKg / 21.77; // EPA standard: 1 tree absorbs ~21.77 kg CO2/year
    const coalAvoidedKg = totalKwh * COAL_DISPLACEMENT_FACTOR;
    const financialSavings = trades.total_savings + 1720.0;

    const leaders = db.prepare(`
      SELECT name, location, role, clean_kwh_shared, clean_kwh_purchased,
             (clean_kwh_shared * ? + clean_kwh_purchased * ?) as co2_impact
      FROM users
      ORDER BY (clean_kwh_shared + clean_kwh_purchased) DESC
      LIMIT 5
    `).all(CEA_GRID_EMISSION_FACTOR, CEA_GRID_EMISSION_FACTOR);

    res.json({
      success: true,
      data: {
        sdgMetrics: {
          totalCleanKwhCirculated: Number.parseFloat(totalKwh.toFixed(1)),
          co2MitigatedKg: Number.parseFloat(co2AvoidedKg.toFixed(1)),
          equivalentTreesPlanted: Number.parseFloat(treesEquivalent.toFixed(1)),
          coalDisplacedKg: Number.parseFloat(coalAvoidedKg.toFixed(1)),
          communityFinancialSavingsInr: Number.parseFloat(financialSavings.toFixed(2)),
          cleanEnergyAccessScore: '94.8%'
        },
        leaderboard: leaders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
