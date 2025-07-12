# 🔗 Monad Testnet DApp

A decentralized application (DApp) that connects to the [Monad Testnet](https://testnet.monadexplorer.com), allowing users to connect their wallet, interact with smart contracts, and explore Web3 functionality using the Monad blockchain.

---

## 🚀 Features

- 🔐 Connect wallet (MetaMask) to Monad Testnet
- 🧾 Display user address and balance
- 📤 Send transactions
- 🧠 Custom smart contract interaction (extendable)
- ✅ Fully configured for Monad Testnet (Chain ID: 10143)

---



## 🔧 Monad Testnet Configuration

| Field               | Value                                  |
|--------------------|----------------------------------------|
| **Network Name**    | Monad Testnet                          |
| **Chain ID**        | `10143` (hex: `0x279f`)                |
| **Currency Symbol** | MON                                    |
| **RPC URL**         | `https://rpc.testnet.monad.xyz`        |
| **Explorer**        | [Monad Explorer](https://testnet.monadexplorer.com) |

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/monad-dapp.git
cd monad-dapp
2. Install Dependencies
npm install
# or
yarn
3. Run Locally
npm run dev
# or
yarn dev
Then visit: http://localhost:5173

🧠 Usage
🔗 Connect Wallet
Click on "Connect Wallet" and allow MetaMask to connect to the site.

If Monad Testnet is not added, it will prompt to add it using this configuration:

{
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad Token',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
}
🧪 Test Contracts (Optional)
If you're deploying your own contracts:

npx hardhat run scripts/deploy.js --network monad
Update your frontend with the deployed contract address and ABI.

📁 Project Structure
monad-dapp/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
└── README.md
📦 Built With
React + Vite
Ethers.js
Monad
MetaMask
🧑‍💻 Author
Somanadh K Varma Prathuyun Feel free to reach out on LinkedIn

📜 License
This project is licensed under the MIT License. See LICENSE for details.


---

### ✅ Next Steps

Let me know if:
- You want the README customized for **smart contract interaction**
- You need a version with **manual private key + MCP support**
- Or you want a badge-style, more GitHub-optimized version

Happy to refine it further!
