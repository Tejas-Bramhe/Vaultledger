# VaultLedger — Bank Management System
![Made with C++](https://img.shields.io/badge/Made%20with-C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows-lightgrey?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

A lightweight and scalable **Bank Management System** featuring a **C++ console application** and a **React web dashboard** backed by an **Express API server**, with structured data storage in **JSON** and **CSV**.


## 📌 **Features**
✅ **Create Accounts** (Savings & Current)
✅ **View Account Details**
✅ **Modify Account (Name & Type)**
✅ **Deposit & Withdraw Money**
✅ **Transfer Money Between Accounts**
✅ **Delete Account**
✅ **Save & Load Data in JSON**
✅ **Export Data to CSV**
✅ **React Web Dashboard** with live API


## 📜 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Running the Web App](#running-the-web-app)
3. [Running the Console App](#running-the-console-app)
4. [API Reference](#api-reference)
5. [File & Directory Structure](#file--directory-structure)
6. [Code Explanation](#code-explanation)
7. [Data Storage Formats](#data-storage-formats)
8. [Error Handling](#error-handling)
9. [Contribution Guidelines](#contribution-guidelines)


## ⚙️ **Prerequisites**

### **For the Web App**
- [Node.js](https://nodejs.org/) **v18+** and npm
- A modern web browser

### **For the Console App** *(optional)*
- C++ Compiler (GCC, Clang, MSVC, etc.)
- C++17 or later
- [nlohmann/json](https://github.com/nlohmann/json) (already included in `include/json.hpp`)


## 🌐 **Running the Web App**

### **Quick Start**

1️⃣ **Clone the Repository**
```sh
git clone https://github.com/Tejas-Bramhe/Vaultledger.git
cd bank-management-system
```

2️⃣ **Install Dependencies**
```sh
cd web-app
npm install
```

3️⃣ **Start the Express API Server** *(runs on port 5000)*
```sh
npm run server
```

4️⃣ **Start the React Dev Server** *(open a new terminal, runs on port 5173)*
```sh
cd web-app
npm run dev
```

5️⃣ **Open the App**

Visit [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> The Vite dev server automatically proxies `/api` requests to the Express server on port 5000, so both servers must be running simultaneously.

### **Production Build**

To build and serve the app as a single process:

```sh
cd web-app
npm run build
npm start
```

This builds the React frontend into `web-app/dist/` and serves it through the Express server at [http://localhost:5000](http://localhost:5000).


## 💻 **Running the Console App**

1️⃣ **Compile the Code**
```sh
g++ -o bank main.cpp src/user.cpp -std=c++17 -Iinclude
```
OR
```sh
make
```

2️⃣ **Run the Program**
```sh
./bank
```
OR
```sh
make run
```

3️⃣ **Run Tests** *(optional)*
```sh
make test
```

4️⃣ **Clean Build Artifacts & Data**
```sh
make clean
```

> [!IMPORTANT]
> Both the console app and the web app share the same `data/accounts.json` file. Changes made in one are reflected in the other.


## 📡 **API Reference**

The Express server exposes the following REST endpoints:

| Method   | Endpoint                  | Description                  | Body Parameters                                        |
| -------- | ------------------------- | ---------------------------- | ------------------------------------------------------ |
| `GET`    | `/api/accounts`           | List all accounts            | —                                                      |
| `POST`   | `/api/accounts/create`    | Create a new account         | `{ "name": "...", "type": "Savings" \| "Current" }`    |
| `POST`   | `/api/accounts/deposit`   | Deposit money                | `{ "accountNumber": "...", "amount": 100 }`            |
| `POST`   | `/api/accounts/withdraw`  | Withdraw money               | `{ "accountNumber": "...", "amount": 50 }`             |
| `POST`   | `/api/accounts/transfer`  | Transfer between accounts    | `{ "fromAccountNumber": "...", "toAccountNumber": "...", "amount": 100 }` |
| `DELETE` | `/api/accounts/:id`       | Delete an account            | —                                                      |
| `POST`   | `/api/accounts/export`    | Export all accounts to CSV   | —                                                      |


## 📁 **File & Directory Structure**
```
Bank Management System/
│
├── .gitignore                 # Git ignore rules
├── LICENSE                    # MIT license
├── README.md                  # This file
├── Makefile                   # Build rules for the C++ console app
├── main.cpp                   # Console app entry point
│
├── data/                      # Shared data directory
│   ├── accounts.json          # Account data (JSON)
│   └── accounts.csv           # Exported CSV file
│
├── include/                   # C++ header files
│   ├── json.hpp               # nlohmann/json library
│   └── user.h                 # User class definition
│
├── src/                       # C++ source files
│   └── user.cpp               # User class implementation
│
├── tests/                     # C++ unit tests
│   ├── catch.hpp              # Catch2 header
│   └── user_test.cpp          # Unit tests
│
└── web-app/                   # React + Express web application
    ├── package.json           # Node.js dependencies & scripts
    ├── server.js              # Express API server
    ├── vite.config.js         # Vite config with API proxy
    ├── index.html             # HTML entry point
    ├── public/                # Static assets
    └── src/                   # React components & styles
```


## 🛠️ **Code Explanation**

### **🔹 `User` Class (user.h & user.cpp)**
- **Private Members**
  - `account_number`, `user_name`, `account_balance`, `account_type`
- **Public Methods**
  - `createAccount()` → Takes user input & generates account.
  - `displayAccount()` → Prints details of the account.
  - `deposit(double amount)` → Adds money to the account.
  - `withdraw(double amount)` → Deducts money from the account.
  - `modifyAccount()` → Changes name & type of the account.
  - `deleteAccount()` → Removes account data from the storage.
  - `toJson()` → Converts the user object to a JSON format.
  - `saveToJson()` → Saves all accounts to `data/accounts.json`.
  - `loadFromJson()` → Reads account data from JSON and updates the `users` list.
  - `exportToCSV()` → Exports all account data to `data/accounts.csv`.

### **🔹 Express API Server (server.js)**
- Reads and writes to the shared `data/accounts.json` file.
- Generates unique account numbers using a date-based prefix (`YYYYMMDD`) plus a sequential counter.
- Serves the production React build from `web-app/dist/`.

### **🔹 React Frontend (web-app/src/)**
- Vite-powered React 19 app.
- Proxies `/api` requests to the Express server during development.


## 📂 **Data Storage Formats**

### **🔹 JSON File Format (`data/accounts.json`)**
```json
[
    {
        "account_number": "0000202502261",
        "user_name": "John Doe",
        "account_balance": 1000.50,
        "account_type": "Savings"
    }
]
```

### **🔹 CSV File Format (`data/accounts.csv`)**
```csv
Account Number,Name,Balance,Type
0000202502261,John Doe,1000.50,Savings
```


## ❌ **Error Handling**
✔ **Invalid Inputs** → If incorrect data is entered, prompts reappear for correction.
✔ **Insufficient Balance** → Withdrawals are blocked if the account has insufficient funds.
✔ **File Errors** → If JSON/CSV files fail to open, errors are displayed.
✔ **API Errors** → The Express server returns appropriate HTTP status codes and error messages.


## 🔧 **Industry Readiness & Best Practices**
- **Memory Efficiency**
  ✅ Uses a global `vector<User>` to store all users, avoiding redundant data loading.
  ✅ A **static counter** for unique account number generation ensures efficient handling without conflicts.

- **Modern C++ Practices**
  ✅ Structured serialization of objects using **nlohmann/json**.
  ✅ **RAII principles**: Destructor ensures proper memory management.
  ✅ No raw pointers—uses **smart memory management**.

- **Web Architecture**
  ✅ **Separation of concerns**: React frontend communicates with Express API.
  ✅ **Vite** for fast HMR during development.
  ✅ **Shared data layer**: Both console and web app use the same JSON storage.

- **Scalability & Maintainability**
  ✅ **Enum-based account types**: Future-proof design with extendable account types.
  ✅ **Global `unordered_map<Type, std::string>`** allows for efficient lookup of account types.
  ✅ The code avoids dependency on compiler-specific features, ensuring broader compatibility.


## 👥 **Contribution Guidelines**
✅ Fork the repository.
✅ Make changes in a separate branch.
✅ Submit a pull request (PR) with a proper description of your changes.
