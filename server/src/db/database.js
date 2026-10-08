import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure db directory exists
const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'voltshare.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('prosumer', 'consumer', 'grid_operator')),
    location TEXT NOT NULL,
    solar_capacity_kw REAL DEFAULT 0.0,
    battery_capacity_kwh REAL DEFAULT 0.0,
    wallet_balance REAL DEFAULT 5000.0,
    clean_kwh_shared REAL DEFAULT 0.0,
    clean_kwh_purchased REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS energy_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    seller_name TEXT NOT NULL,
    seller_location TEXT NOT NULL,
    energy_kwh REAL NOT NULL,
    available_kwh REAL NOT NULL,
    price_per_kwh REAL NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'Rooftop Solar',
    time_window TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'partially_sold', 'sold', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS p2p_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES energy_listings(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    buyer_name TEXT NOT NULL,
    seller_id INTEGER NOT NULL REFERENCES users(id),
    seller_name TEXT NOT NULL,
    kwh_traded REAL NOT NULL,
    price_per_kwh REAL NOT NULL,
    total_cost REAL NOT NULL,
    co2_avoided_kg REAL NOT NULL,
    grid_savings_inr REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS microgrid_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    transformer_id TEXT NOT NULL,
    current_generation_kw REAL NOT NULL,
    current_consumption_kw REAL NOT NULL,
    voltage_v REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'optimal'
  );

  CREATE TABLE IF NOT EXISTS hourly_simulation (
    hour INTEGER PRIMARY KEY,
    time_label TEXT NOT NULL,
    solar_generation_kw REAL NOT NULL,
    base_consumption_kw REAL NOT NULL,
    peak_grid_tariff_inr REAL NOT NULL,
    p2p_market_rate_inr REAL NOT NULL
  );
`);

// Seed initial realistic data if empty
const countUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
const userCount = countUsersStmt.get().count;

if (userCount === 0) {
  console.log('Seeding initial VoltShare microgrid data...');

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, role, location, solar_capacity_kw, battery_capacity_kwh, wallet_balance, clean_kwh_shared, clean_kwh_purchased)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('Omwardhan Mishra', 'omwardhan@voltshare.in', 'prosumer', 'Sama-Savli Rd, Vadodara', 5.5, 10.0, 7850.0, 340.5, 0.0);
  insertUser.run('Priya Patel', 'priya.p@gmail.com', 'prosumer', 'Alkapuri, Vadodara', 4.2, 5.0, 5200.0, 185.0, 12.0);
  insertUser.run('Aarav Mehta', 'aarav.m@outlook.com', 'consumer', 'Gotri Road, Vadodara', 0.0, 0.0, 3950.0, 0.0, 215.0);
  insertUser.run('Kavita Shah', 'kavita.s@gmail.com', 'consumer', 'Karelibaug, Vadodara', 0.0, 0.0, 4600.0, 0.0, 190.0);
  insertUser.run('Vasad Microgrid Operator', 'admin@svit-grid.ac.in', 'grid_operator', 'SVIT Campus, Vasad', 15.0, 50.0, 25000.0, 1200.0, 450.0);

  const insertListing = db.prepare(`
    INSERT INTO energy_listings (seller_id, seller_name, seller_location, energy_kwh, available_kwh, price_per_kwh, source_type, time_window, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertListing.run(1, 'Omwardhan Mishra', 'Sama-Savli Rd, Vadodara', 18.5, 14.0, 4.50, 'Rooftop Bifacial Solar', '11:00 AM - 03:00 PM', 'High efficiency midday solar surplus from 5.5 kW array', 'active');
  insertListing.run(2, 'Priya Patel', 'Alkapuri, Vadodara', 12.0, 8.5, 4.75, 'Monocrystalline Solar + Storage', '12:00 PM - 04:00 PM', 'Clean rooftop solar with LiFePO4 battery backing', 'active');
  insertListing.run(5, 'Vasad Microgrid Operator', 'SVIT Campus, Vasad', 45.0, 32.0, 4.20, 'Campus Solar Farm Node', '09:00 AM - 05:00 PM', 'Surplus institutional renewable energy for local neighborhood', 'active');
  insertListing.run(1, 'Omwardhan Mishra', 'Sama-Savli Rd, Vadodara', 10.0, 0.0, 4.40, 'Rooftop Bifacial Solar', 'Yesterday 12:00 PM', 'Fully settled afternoon solar batch', 'sold');

  const insertTrade = db.prepare(`
    INSERT INTO p2p_trades (listing_id, buyer_id, buyer_name, seller_id, seller_name, kwh_traded, price_per_kwh, total_cost, co2_avoided_kg, grid_savings_inr, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
  `);

  insertTrade.run(4, 3, 'Aarav Mehta', 1, 'Omwardhan Mishra', 10.0, 4.40, 44.0, 8.20, 27.0); // grid was 7.10/kWh => saved (7.10-4.40)*10 = 27 INR

  const insertNode = db.prepare(`
    INSERT INTO microgrid_nodes (node_name, sector, transformer_id, current_generation_kw, current_consumption_kw, voltage_v, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNode.run('Vadodara Feeder Node A-1', 'Sama-Savli Sector', 'TR-SS-400', 48.6, 32.1, 231.4, 'optimal');
  insertNode.run('Vadodara Feeder Node B-3', 'Alkapuri Sector', 'TR-ALK-250', 36.2, 29.8, 229.8, 'optimal');
  insertNode.run('SVIT Vasad Renewable Microgrid', 'Campus South Feeder', 'TR-SVIT-500', 84.5, 51.2, 233.0, 'optimal');
  insertNode.run('Gotri Distribution Cluster', 'Gotri Residential', 'TR-GOT-315', 21.0, 28.5, 227.6, 'high_demand');

  const insertHourly = db.prepare(`
    INSERT INTO hourly_simulation (hour, time_label, solar_generation_kw, base_consumption_kw, peak_grid_tariff_inr, p2p_market_rate_inr)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const hourlyData = [
    [0, '00:00', 0.0, 1.2, 5.80, 4.00],
    [2, '02:00', 0.0, 0.9, 5.80, 4.00],
    [4, '04:00', 0.0, 0.8, 5.80, 4.00],
    [6, '06:00', 0.3, 1.4, 6.20, 4.10],
    [8, '08:00', 1.8, 2.2, 6.80, 4.25],
    [10, '10:00', 4.1, 2.0, 7.10, 4.40],
    [12, '12:00', 5.4, 2.3, 7.10, 4.50],
    [14, '14:00', 5.1, 2.8, 7.10, 4.50],
    [16, '16:00', 3.2, 2.4, 6.80, 4.35],
    [18, '18:00', 0.8, 3.5, 7.50, 4.80],
    [20, '20:00', 0.0, 4.1, 7.50, 4.80],
    [22, '22:00', 0.0, 2.6, 6.50, 4.20]
  ];

  for (const row of hourlyData) {
    insertHourly.run(...row);
  }

  console.log('VoltShare database initialized and seeded successfully.');
}

export default db;
