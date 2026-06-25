import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// ESM __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCOUNTS_FILE = path.resolve(__dirname, '../data/accounts.json');
const CSV_FILE = path.resolve(__dirname, '../data/accounts.csv');

app.use(cors());
app.use(express.json());

// Serve static frontend assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// Helper to get formatted current date YYYYMMDD
function getCurrentDate() {
    const d = new Date();
    const yyyy = d.getFullYear().toString();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return yyyy + mm + dd;
}

// Read accounts from JSON
function readAccounts() {
    try {
        if (!fs.existsSync(ACCOUNTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading accounts JSON:', error);
        return [];
    }
}

// Write accounts to JSON
function writeAccounts(accounts) {
    try {
        const dir = path.dirname(ACCOUNTS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing accounts JSON:', error);
        return false;
    }
}

// Export to CSV
function writeCSV(accounts) {
    try {
        const dir = path.dirname(CSV_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const header = 'Account Number,Name,Balance,Type\n';
        const rows = accounts.map(acc => `${acc.account_number},${acc.user_name},${parseFloat(acc.account_balance).toFixed(2)},${acc.account_type}`).join('\n');
        fs.writeFileSync(CSV_FILE, header + rows + '\n', 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing accounts CSV:', error);
        return false;
    }
}

// Generate sequential account number
function getNextAccountNumber(accounts) {
    let maxCounter = 0;
    const datePrefix = getCurrentDate();
    accounts.forEach(acc => {
        if (acc.account_number && acc.account_number.length > 12) {
            const suffix = parseInt(acc.account_number.substring(12), 10);
            if (!isNaN(suffix) && suffix > maxCounter) {
                maxCounter = suffix;
            }
        }
    });
    const nextCounter = maxCounter + 1;
    return `0000${datePrefix}${nextCounter}`;
}

// --- REST API ENDPOINTS ---

// Get all accounts
app.get('/api/accounts', (req, res) => {
    res.json(readAccounts());
});

// Create new account
app.post('/api/accounts/create', (req, res) => {
    const { name, type } = req.body;
    if (!name || (type !== 'Savings' && type !== 'Current')) {
        return res.status(400).json({ error: 'Invalid name or account type. Type must be Savings or Current.' });
    }
    const accounts = readAccounts();
    const newAccNum = getNextAccountNumber(accounts);
    const newAccount = {
        account_number: newAccNum,
        user_name: name,
        account_balance: 0.0,
        account_type: type
    };
    accounts.push(newAccount);
    if (writeAccounts(accounts)) {
        res.status(201).json(newAccount);
    } else {
        res.status(500).json({ error: 'Failed to write account data.' });
    }
});

// Deposit money
app.post('/api/accounts/deposit', (req, res) => {
    const { accountNumber, amount } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!accountNumber || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Invalid account number or deposit amount.' });
    }
    const accounts = readAccounts();
    const account = accounts.find(acc => acc.account_number === accountNumber);
    if (!account) {
        return res.status(404).json({ error: 'Account not found.' });
    }
    account.account_balance += parsedAmount;
    if (writeAccounts(accounts)) {
        res.json({ message: 'Deposit successful.', account });
    } else {
        res.status(500).json({ error: 'Failed to save transaction.' });
    }
});

// Withdraw money
app.post('/api/accounts/withdraw', (req, res) => {
    const { accountNumber, amount } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!accountNumber || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Invalid account number or withdrawal amount.' });
    }
    const accounts = readAccounts();
    const account = accounts.find(acc => acc.account_number === accountNumber);
    if (!account) {
        return res.status(404).json({ error: 'Account not found.' });
    }
    if (account.account_balance < parsedAmount) {
        return res.status(400).json({ error: 'Insufficient balance.' });
    }
    account.account_balance -= parsedAmount;
    if (writeAccounts(accounts)) {
        res.json({ message: 'Withdrawal successful.', account });
    } else {
        res.status(500).json({ error: 'Failed to save transaction.' });
    }
});

// Transfer money
app.post('/api/accounts/transfer', (req, res) => {
    const { fromAccountNumber, toAccountNumber, amount } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!fromAccountNumber || !toAccountNumber || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Invalid accounts or transfer amount.' });
    }
    if (fromAccountNumber === toAccountNumber) {
        return res.status(400).json({ error: 'Cannot transfer to the same account.' });
    }
    const accounts = readAccounts();
    const fromAccount = accounts.find(acc => acc.account_number === fromAccountNumber);
    const toAccount = accounts.find(acc => acc.account_number === toAccountNumber);
    if (!fromAccount) {
        return res.status(404).json({ error: 'Source account not found.' });
    }
    if (!toAccount) {
        return res.status(404).json({ error: 'Destination account not found.' });
    }
    if (fromAccount.account_balance < parsedAmount) {
        return res.status(400).json({ error: 'Insufficient balance in source account.' });
    }
    fromAccount.account_balance -= parsedAmount;
    toAccount.account_balance += parsedAmount;
    if (writeAccounts(accounts)) {
        res.json({ message: 'Transfer successful.', fromAccount, toAccount });
    } else {
        res.status(500).json({ error: 'Failed to save transaction.' });
    }
});

// Delete account
app.delete('/api/accounts/:id', (req, res) => {
    const { id } = req.params;
    const accounts = readAccounts();
    const index = accounts.findIndex(acc => acc.account_number === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Account not found.' });
    }
    accounts.splice(index, 1);
    if (writeAccounts(accounts)) {
        res.json({ message: 'Account deleted successfully.' });
    } else {
        res.status(500).json({ error: 'Failed to delete account.' });
    }
});

// Export to CSV
app.post('/api/accounts/export', (req, res) => {
    const accounts = readAccounts();
    if (writeCSV(accounts)) {
        res.json({ message: 'Accounts exported successfully to CSV.' });
    } else {
        res.status(500).json({ error: 'Failed to export CSV.' });
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});
