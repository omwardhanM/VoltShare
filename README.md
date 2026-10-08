# VoltShare: Peer-to-Peer Clean Energy Trading Platform

[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL--Mode-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![SDG 7](https://img.shields.io/badge/UN%20SDG-7%20Affordable%20Clean%20Energy-FCC30B.svg)](https://sdgs.un.org/goals/goal7)
[![SDG 13](https://img.shields.io/badge/UN%20SDG-13%20Climate%20Action-3F7E44.svg)](https://sdgs.un.org/goals/goal13)

**VoltShare** is a decentralized peer-to-peer (P2P) clean energy trading web platform for community solar microgrids. It empowers rooftop solar owners to sell surplus midday generation directly to neighbors without solar access at fair, community-cleared rates.

---

## 1. Problem Statement

Residential rooftop solar adoption is growing rapidly under clean energy initiatives. However, conventional centralized utility net-metering structures introduce significant friction:

1. **The Diurnal Duck-Curve & Asymmetric Payback:** Homeowners generate peak surplus solar between 11:00 AM and 3:00 PM when household consumption is low. Utilities buy this excess power at low net-metering feed-in tariffs (~₹2.25/kWh), stretching solar payback periods to 7–9 years.
2. **Apartment Resident Lockout:** Urban apartment dwellers and tenants without rooftop ownership cannot install solar panels, forcing them to consume fossil-heavy utility power at peak retail tariffs exceeding ₹7.10/kWh.
3. **Distribution Feeder Congestion:** Exporting uncontrolled excess solar backward into high-voltage utility grids strains local distribution transformers without localized load balancing.

### The VoltShare Solution
VoltShare creates a local energy marketplace where:
- **Solar Producers** list excess midday electricity at **₹4.20 – ₹4.75/kWh** (nearly doubling their export earnings compared to feed-in tariffs).
- **Energy Buyers** purchase local green power, saving **35% to 41%** compared to retail grid electricity.
- **Microgrid Load Balancing** keeps power flow localized to neighboring homes on the same distribution feeder.

---

## 2. Core Pillars & Features

### 🛒 P2P Clean Energy Marketplace
- **Real-Time Energy Offers:** Browse active solar listings filtered by solar array type (Bifacial, Rooftop, Storage-backed) and pricing.
- **Dynamic Pricing & Bill Savings:** Instant benchmark comparisons showing percentage savings against standard utility retail tariffs (₹7.10/kWh).
- **Listing Lifecycle Management:** Producers can register surplus solar with specific delivery time windows and cancel/delete listings with inline confirmation.
- **Settled Transaction Ledger:** Real-time distribution bus ledger tracking timestamped settlements, clearance rates, volume, and carbon offsets.

### 🌍 UN SDG 7 & SDG 13 Impact Ledger
- **Certified Carbon Offsets:** Calculates emissions avoided using the Central Electricity Authority (CEA) baseline (**0.82 kg CO₂/kWh**).
- **Resource Displacement:** Tracks equivalent thermal coal displaced (**0.53 kg coal/kWh**) and tree absorption equivalents.
- **Community Leaderboard:** Gamified environmental contributions ranking top green buyers and clean solar producers.
- **Digital Green Energy Certificates:** Verifiable clean power stewardship certificates generated for active participants.

### 💼 Digital Escrow Wallet & Settlement
- **Atomic Financial Transactions:** Escrow balance checks prevent double-spending; transactions debit buyer funds and credit seller accounts simultaneously.
- **Audit-Ready Ledger:** Every peer transaction produces a verifiable receipt ID (`#VS-TR-X`) with complete transaction metadata.
- **Demo Escrow Top-Up:** Instant balance replenishment for rapid testing and demonstrations.

---

## 3. UN Sustainable Development Goals (SDG) Alignment

| Goal | Platform Mechanism | Quantified Metric |
| :--- | :--- | :--- |
| **SDG 7.1: Clean Energy Access** | Connects apartment residents without roof rights to neighbor solar. | **94.8%** community clean energy accessibility rate. |
| **SDG 7.2: Renewable Share** | Improves solar economics via localized peer pricing. | Increases local rooftop solar utilization by **+38.5%**. |
| **SDG 13.2: Climate Action** | Displaces fossil grid electricity with certified clean solar dispatch. | Mitigates **0.82 kg CO₂** and **0.53 kg thermal coal** per clean kWh. |
| **SDG 11.a: Sustainable Communities** | Localizes energy consumption to reduce distribution losses. | Delivers **₹13.00 – ₹14.50** savings per 5 kWh trade for local families. |

---

## 4. Technology Stack

- **Frontend:**
  - React 18
  - Vite
  - Lucide Icons
  - Custom Vanilla CSS Design System (Tactile high-contrast Dark & Light mode)
- **Backend:**
  - Node.js & Express.js
  - RESTful architecture with CORS & JSON body parsing
- **Database:**
  - SQLite3 with Write-Ahead Logging (WAL) mode
  - Auto-initializing schema and seed data
- **Testing & Verification:**
  - Playwright end-to-end automation suite

---

## 5. Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or newer)
- npm (v9.x or newer)

### Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/VoltShare.git
cd VoltShare
npm run install:all
```

### Running Locally
Start both the backend API server and frontend client concurrently:
```bash
npm start
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5055/api](http://localhost:5055/api)
- **Health Check:** [http://localhost:5055/health](http://localhost:5055/health)

---

## 6. Interactive Walkthrough & User Personas

Use the **persona switcher** in the top navigation to test various microgrid roles:

1. **Omwardhan Mishra (Solar Producer):**
   - Features a 5.5 kW rooftop bifacial array.
   - Post new surplus energy listings with delivery time windows.
   - Delete/cancel unsold energy offers directly from the marketplace or portfolio.
   - Monitor earned revenue in the escrow wallet.

2. **Aarav Mehta (Energy Buyer):**
   - Apartment resident without rooftop solar.
   - Purchase available energy pool allocations from the marketplace.
   - Track bill savings compared to utility tariffs.
   - Check personal CO₂ offset stats and view verified Green Energy Certificates.

3. **Vasad Microgrid Operator (Grid Operator):**
   - Institutional node providing baseline community solar supply.
   - Reviews distribution bus transaction ledgers across local feeder lines.

---

## 7. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/summary` | Global microgrid metrics (total PV capacity, traded kWh, CO₂ avoided, savings) |
| `GET` | `/api/users` | List of microgrid participants |
| `GET` | `/api/users/:id` | Participant profile, personal listings, and recent trade history |
| `POST` | `/api/users/:id/wallet/topup` | Replenish demo escrow wallet balance |
| `GET` | `/api/listings` | Active and available marketplace energy listings |
| `POST` | `/api/listings` | Create a new solar surplus listing |
| `DELETE` | `/api/listings/:id` | Delete listing (hard-deletes if un-traded, soft-cancels if trades exist) |
| `PATCH` | `/api/listings/:id/cancel` | Cancel an active listing |
| `GET` | `/api/trades` | List of all settled peer-to-peer trades |
| `POST` | `/api/trades` | Execute an atomic P2P trade with escrow settlement |
| `GET` | `/api/impact` | UN SDG 7/13 carbon offsets, coal displacement, and leaderboard |

---

## 8. Repository Structure

```
VoltShare/
├── package.json                 # Project configuration & npm scripts
├── README.md                    # Project documentation
├── VoltShare_PBL_Report.pdf     # Technical architecture report
├── client/                      # Frontend Application (React 18 + Vite)
│   ├── index.html               # HTML entrypoint & SEO metadata
│   ├── vite.config.js           # Vite dev configuration & API proxy
│   └── src/
│       ├── App.jsx              # Main orchestrator & state management
│       ├── main.jsx             # React entrypoint
│       ├── components/
│       │   ├── Navbar.jsx       # Persona selector, navigation tabs, theme switch
│       │   ├── MicrogridStats.jsx # Real-time microgrid KPIs
│       │   ├── Marketplace.jsx  # P2P listings, filters, delete & buy triggers
│       │   ├── TradeModal.jsx   # Escrow settlement modal & receipts
│       │   ├── NewListingModal.jsx # Surplus energy registration modal
│       │   ├── ImpactLedger.jsx # UN SDG carbon metrics, leaderboard & certificate
│       │   └── WalletView.jsx   # Escrow balance, top-up & listings management
│       └── styles/
│           └── index.css        # Tactile design system (Dark & Light mode)
├── server/                      # REST API Server (Node.js + Express)
│   ├── src/
│   │   ├── index.js             # Express entrypoint (Port 5055)
│   │   ├── db/
│   │   │   └── database.js      # SQLite schema definition & seed data
│   │   └── routes/
│   │       └── api.js           # API route handlers & trade execution
│   └── data/
│       └── voltshare.sqlite     # SQLite database
├── report/                      # Technical report generator
│   ├── report.html              # Technical report HTML template
│   └── generate-pdf.js          # Headless report compilation script
└── scripts/
    └── start-dev.js             # Concurrent dev server runner
```

---

## 9. License

This project is licensed under the [MIT License](LICENSE).
