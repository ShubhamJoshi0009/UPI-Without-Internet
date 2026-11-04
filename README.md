# UPI Offline Mesh

### Mesh-Routed Deferred UPI Payments

A Spring Boot-based project demonstrating offline payment transmission through a Bluetooth-style mesh network.

Imagine sending ₹500 to a friend in a basement with no internet. Your phone encrypts the payment instruction and broadcasts it to nearby devices. The packet travels device-to-device until an internet-connected device (bridge node) uploads it to the backend for validation and settlement.

This project includes a **software-based mesh simulator**, allowing the entire workflow to run on a single laptop without physical Bluetooth hardware.

## 🚀 Key Features

- Hybrid encryption using RSA-OAEP and AES-256-GCM.
- Bluetooth-style mesh network simulation.
- Device-to-device packet forwarding using gossip.
- TTL-based packet propagation.
- Internet-enabled bridge node simulation.
- SHA-256-based duplicate detection.
- Atomic idempotency checks.
- Transaction settlement using Spring transactions.
- Optimistic locking using JPA `@Version`.
- Replay and tampering detection.
- Interactive React dashboard.

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3 |
| Frontend | React, Vite |
| Database | H2, Spring Data JPA |
| Security | RSA-OAEP, AES-256-GCM, SHA-256 |
| Build Tool | Maven |
| Testing | JUnit 5 |

## ⚙️ Getting Started

**Prerequisite:** JDK 17 or newer.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd upi-offline-mesh
```

### 2. Start the backend

Windows:

```cmd
.\mvnw.cmd spring-boot:run
```

Mac/Linux:

```bash
./mvnw spring-boot:run
```

### 3. Open the dashboard

- React Dashboard: http://localhost:8080
- Classic Dashboard: http://localhost:8080/classic
- H2 Console: http://localhost:8080/h2-console

### 4. Run frontend separately (optional)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## 🔄 Demo Workflow

1. **Inject Payment:** Select sender, receiver, amount and PIN. The backend encrypts the payment and injects it into the virtual mesh.
2. **Gossip Rounds:** Devices exchange packets, simulating Bluetooth-based forwarding.
3. **Bridge Upload:** An internet-enabled device uploads packets to the backend.
4. **Settlement:** The backend decrypts, validates and processes the payment.
5. **Idempotency:** Duplicate packets are rejected, ensuring the payment settles only once.

## 🏗 Architecture

```text
Sender Phone (Offline)
        |
        ▼
 Hybrid Encryption
    RSA + AES-GCM
        |
        ▼
    Mesh Packet
        |
        ▼
  Device-to-Device
      Gossip
        |
        ▼
    Bridge Node
   (Internet Access)
        |
        ▼
  Spring Boot Backend
        |
        ▼
   SHA-256 Hashing
        |
        ▼
  Idempotency Check
        |
        ▼
   Decryption & Validation
        |
        ▼
  Transaction Settlement
        |
        ▼
     H2 Database
```

## 🔐 Core Technical Concepts

**1. Hybrid Encryption**

- AES-256-GCM encrypts payment instructions.
- RSA-OAEP encrypts the AES key.
- GCM authentication detects ciphertext tampering.

**2. Idempotency**

The backend generates a SHA-256 hash of the ciphertext and uses `ConcurrentHashMap.putIfAbsent()` to prevent duplicate processing.

**3. Replay Protection**

Payment instructions contain a unique nonce and timestamp. The backend validates freshness and rejects previously processed packets.

**4. Transaction Safety**

Spring's `@Transactional` ensures atomic debit, credit and ledger operations. JPA `@Version` provides optimistic locking.

## 📂 Project Structure

```text
src/
├── main/
│   ├── java/com/demo/upimesh/
│   │   ├── model/
│   │   ├── crypto/
│   │   ├── service/
│   │   ├── controller/
│   │   └── config/
│   └── resources/
│       ├── application.properties
│       └── templates/
└── test/
    └── java/com/demo/upimesh/
        └── IdempotencyConcurrencyTest.java

frontend/
└── React + Vite Dashboard
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/server-key` | Get server public key |
| GET | `/api/accounts` | Get account balances |
| GET | `/api/transactions` | Get transaction history |
| GET | `/api/mesh/state` | Get mesh device states |
| POST | `/api/demo/send` | Inject a payment |
| POST | `/api/mesh/gossip` | Run gossip round |
| POST | `/api/mesh/flush` | Upload bridge packets |
| POST | `/api/mesh/reset` | Reset simulation |
| POST | `/api/bridge/ingest` | Process incoming payment |

## 🧪 Testing

Run tests:

```bash
./mvnw test
```

Important tests:

- `encryptDecryptRoundTrip` – verifies encryption and decryption.
- `tamperedCiphertextIsRejected` – verifies tampering detection.
- `singlePacketDeliveredByThreeBridgesSettlesExactlyOnce` – verifies concurrent duplicate protection.

## 🚧 Limitations & Future Scope

This is an educational prototype, not a production UPI implementation.

| Current Demo | Production Requirement |
|---|---|
| H2 database | PostgreSQL |
| In-memory idempotency | Redis / durable database constraints |
| Simulated mesh | Bluetooth LE / Wi-Fi Direct |
| Generated RSA keys | Hardware-backed key management |
| Demo accounts | Verified bank accounts |
| No bridge authentication | Mutual TLS and device certificates |
| Simulated settlement | Authorized banking integration |

**Important limitations:**
- Offline receivers cannot verify the sender's available balance.
- Offline double-spending is possible.
- Bluetooth background communication has OS restrictions.
- Payments are deferred until a bridge reconnects to the internet.

Therefore, this project demonstrates **mesh-routed deferred settlement**, not real-time offline UPI.

## 📜 License

No formal open-source license has been added yet.

---

**Simulate Tomorrow. Decide Today.**
