# 🏗️ Solana Asset Fractionalization Protocol

A high-performance Decentralized Application (dApp) built on the **Solana Blockchain** that enables fractional ownership of real estate assets using the **Fractional NFT (fNFT) Collection** model.

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-blueviolet?style=for-the-badge&logo=solana)](https://explorer.solana.com/?cluster=devnet)
[![Metaplex](https://img.shields.io/badge/Metaplex-Umi-orange?style=for-the-badge)](https://metaplex.com)

## 🌟 Key Features

- **Discrete fNFT Collections**: Unlike traditional fungible tokens, every property is minted as a **Metaplex NFT Collection**. Each fractional share is a unique, tradeable NFT member of that collection.
- **On-Chain Memos**: Every transaction is bundled with a **Solana Memo instruction**, providing immutable, human-readable proof of purchase (e.g., *"Bought 10 shares of Luxury Villa"*).
- **Instant Settlement**: Leverage Solana's 400ms block times for near-instant real estate trading—shifting from months to milliseconds.
- **Portfolio Tracking**: A built-in dashboard for investors to manage their fractionalized real estate holdings and view on-chain metadata.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI
- **Blockchain**: Solana (Devnet), Metaplex Umi, SPL Token Metadata
- **Wallet**: Phantom Integration via @solana/wallet-adapter
- **Smart Logic**: Anchor Framework (Rust) - *Draft Implementation*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Phantom Wallet (Set to **Devnet**)
- A small amount of Devnet SOL

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/gmixoulis/Asset_Fractionalization.git
   cd Asset_Fractionalization
   ```
2. Install dependencies:
   ```bash
   cd app
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📈 Business Vision

Our mission is to **democratize premium real estate**. By lowering the barrier to entry to as little as 0.1 SOL, we allow retail investors globally to gain exposure to high-yield commercial and residential assets that were previously restricted to the ultra-wealthy.

---

Built for the **Solana Hackathon 2026** 🚀🏆
