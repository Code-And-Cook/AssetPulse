# AssetPulse

**Tokenization proves ownership. AssetPulse proves the asset.**

A Hedera-based asset-condition verification layer for tokenized real-world assets (RWA), built as a hackathon POC.

## The problem

Tokenizing a real-world asset (like a solar farm) makes *ownership* transparent — but it says nothing about whether the underlying physical asset is still in the condition investors expect. There's no verifiable link between "I own 5% of this solar farm" and "this solar farm is actually working."

## What AssetPulse does

AssetPulse adds a condition-verification layer on top of RWA tokenization:

- **HTS (Hedera Token Service)** — represents fractional ownership of the asset as fungible tokens.
- **HCS (Hedera Consensus Service)** — records an immutable, timestamped log of condition, maintenance, and operational events (temperature, efficiency, equipment status).
- **Mirror Node** — publicly queried to read back the full condition history for the dashboard.

Token holders don't just see who owns what — they see a verifiable history of the asset itself.

## POC scope

Demo asset: **Solar Farm #001**
- Value: $100,000
- Ownership: 100,000 HTS tokens (`SOLAR-001`), example holder owns 5,000 (5%)
- Condition data (temperature, efficiency, maintenance status) is simulated — no real IoT hardware

The core demo moment: the dashboard shows a healthy asset, a "Simulate Equipment Failure" button submits a real HCS event, and the dashboard flips to critical — showing the condition change is recorded on-chain, not just in a UI state.

## Architecture

```
Frontend (public/index.html)
        │
        ▼
Node.js / Express backend (server.js)
        │
        ├──► Hedera JS SDK ──► HTS ownership token
        │                 └──► HCS condition topic
        │
        └──► Mirror Node (read-only, public REST) ──► condition history
```

Balance checks and history reads go through the Mirror Node's REST API (avoids gRPC/firewall issues on restrictive networks). Writing new HCS events requires the Hedera SDK directly, since only the SDK can sign and submit transactions.

## Project structure

```
assetpulse/
├── .env                      # HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, HEDERA_TOPIC_ID
├── .gitignore
├── package.json
├── index.js                  # test connection + balance check (Mirror Node)
├── create-token.js           # one-time: creates the SOLAR-001 HTS token
├── create-topic.js           # one-time: creates the HCS condition topic
├── submit-healthy-event.js   # manually submit a HEALTHY condition event
├── submit-critical-event.js  # manually submit a CRITICAL condition event
├── server.js                 # Express backend + dashboard API
└── public/
    └── index.html            # dashboard UI
```

## Setup

```bash
npm install @hashgraph/sdk dotenv express
```

Create `.env`:

```env
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_TOPIC_ID=0.0.xxxxx
```

## Running the POC

One-time setup (run once, save the printed IDs):

```bash
node index.js              # confirm testnet connection + balance
node create-token.js       # creates SOLAR-001 HTS token
node create-topic.js       # creates the HCS condition topic
```

Reset to a healthy baseline before demoing:

```bash
node submit-healthy-event.js
```

Start the dashboard:

```bash
node server.js
```

Open `http://localhost:3000`. Click **Simulate Equipment Failure** to submit a live CRITICAL event to HCS and watch the dashboard update from the real on-chain history.

## Hedera services used

| Service | Role | Status |
|---|---|---|
| HTS | Fractional ownership token (`SOLAR-001`) | ✅ Core |
| HCS | Condition/maintenance event log | ✅ Core |
| Mirror Node | Reading balances + condition history | ✅ Core |
| HSCS | Automated response to critical events (e.g. pause distributions) | ⏳ Optional / not in POC |
| HFS | Storing inspection report documents | ⏳ Optional / not in POC |

## Why this matters

Generic RWA tokenization stops at:

```
Physical Asset → Token → Ownership
```

AssetPulse extends it to:

```
Physical Asset → Token → Ownership + Condition + Maintenance + Inspection → Verifiable history
```

Ownership can be fully transparent while the physical asset's real-world condition stays completely opaque. AssetPulse closes that gap.

## Business concept (not validated pricing)

B2B infrastructure for RWA tokenization platforms, asset owners/operators, and asset managers.

- Starter: $99/mo, up to 10 assets
- Business: $499/mo, up to 100 assets
- Enterprise: custom
- Usage fee: $0.01 per verified event
