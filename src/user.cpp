#include "user.h"
#ifdef _WIN32
#include <direct.h>
#else
#include <sys/stat.h>
#endif

using namespace std;

vector<User> users;  // Global vector to store live User objects

static void createDataDir() {
#ifdef _WIN32
    _mkdir("data");
#else
    mkdir("data", 0777);
#endif
}

const unordered_map<Type, string> accountTypeMap = {
    {SAVINGS, "Savings"},
    {CURRENT, "Current"}
};

int User::counter = 0;                              // Initializing the static counter

// Generates current date in YYYYMMDD format
string User::getCurrentDate() {
    time_t now = time(0);
    char dateStr[9];
    strftime(dateStr, sizeof(dateStr), "%Y%m%d", localtime(&now));
    return string(dateStr);
}

// Constructor: Generates a unique account number
User::User() {
    counter += 1;
    account_number = "0000" + getCurrentDate() + to_string(counter);
    account_balance = 0.0;
}

// Destructor
User::~User() {
    // Empty Deconstructor
}

// Creates a new account with user input
void User::createAccount() {
    cout << "Enter Your Name: ";
    getline(cin >> ws, user_name);  // Allows spaces, prevents `\n` issues

    int accTypeInput;
    cout << "Enter Account Type (0 for Savings, 1 for Current): ";
    while (!(cin >> accTypeInput) || (accTypeInput != 0 && accTypeInput != 1)) {
        cout << "Invalid choice! Enter 0 for Savings or 1 for Current: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    account_type = static_cast<Type>(accTypeInput);
    cout << "Account " << account_number << " created Successfully!" << endl;
}

// Displays account details
void User::displayAccount() const {
    cout << "Account Number: " << account_number << endl;
    cout << "Name: " << user_name << endl;
    cout << "Balance: $" << fixed << setprecision(2) << account_balance << endl;
    cout << "Type: " << accountTypeMap.at(account_type) << endl;
}

// Make a deposit into the account
void User::deposit(double amount) {
    if (amount > 0) {
        account_balance += amount;
        saveToJson();   // Saves the updated balance
        cout << "Credited $" << fixed << setprecision(2) << amount << " successfully." << endl;
        cout << "Updated Balance: $" << fixed << setprecision(2) << account_balance << endl;
    } else {
        cout << "Invalid amount!" << endl;
    }
}

// Withdraw money if there is sufficient balance
bool User::withdraw(double amount) {
    if (amount > 0 && amount <= account_balance) {
        account_balance -= amount;
        saveToJson();   // Saves the updated balance
        cout << "Debited $" << fixed << setprecision(2) << amount << " successfully." << endl;
        cout << "Updated Balance: $" << fixed << setprecision(2) << account_balance << endl;
        return true;
    } else {
        cout << "Insufficient balance or invalid amount!" << endl;
        return false;
    }
}

// Modify exisiting account 
void User::modifyAccount() {
    cout << "Modify Account Details" << endl;
    cout << "Current Name: " << user_name << endl;
    cout << "Enter New Name: ";
    getline(cin >> ws, user_name);

    int accTypeInput;
    cout << "Current Account Type: " << accountTypeMap.at(account_type) << endl;
    cout << "Enter New Type (0 for Savings, 1 for Current): ";
    while (!(cin >> accTypeInput) || (accTypeInput != 0 && accTypeInput != 1)) {
        cout << "Invalid choice! Enter 0 for Savings or 1 for Current: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    account_type = static_cast<Type>(accTypeInput);
    saveToJson();
    cout << "Account Details Updated Successfully!" << endl;
}

// Converts User object to JSON format
json User::toJson() const {
    return json{
        {"account_number", account_number},
        {"user_name", user_name},
        {"account_balance", account_balance},
        {"account_type", accountTypeMap.at(account_type)}
    };
}

// Saves all accounts to a JSON file
void User::saveToJson() {
    json jArray = json::array();
    for (const auto& user : users) {
        jArray.push_back(user.toJson());
    }

    createDataDir();
    ofstream outFile("data/accounts.json");
    if (outFile) {
        outFile << jArray.dump(4); // Properly formatted JSON
        outFile.close();
        // cout << "Accounts saved successfully to JSON." << endl;
    } else {
        cerr << "Error: Could not open JSON file for writing!" << endl;
    }
}

// Loads all accounts from a JSON file
vector<User> User::loadFromJson() {
    ifstream inFile("data/accounts.json");
    vector<User> loadedUsers;
    int maxCounter = 0;

    if (inFile) {
        json jArray;
        try {
            inFile >> jArray;
            inFile.close();

            for (const auto& jUser : jArray) {
                User user;
                user.account_number = jUser["account_number"];
                user.user_name = jUser["user_name"];
                user.account_balance = jUser["account_balance"];

                // Reverse lookup for account type (C++11 standard iteration)
                for (const auto& pair : accountTypeMap) {
                    if (pair.second == jUser["account_type"]) {
                        user.account_type = pair.first;
                        break;
                    }
                }

                // Safely parse the counter from account number to prevent conflicts
                if (user.account_number.length() > 12) {
                    try {
                        int loadedCounter = std::stoi(user.account_number.substr(12));
                        if (loadedCounter > maxCounter) {
                            maxCounter = loadedCounter;
                        }
                    } catch (...) {
                        // Ignore parsing errors for malformed account numbers
                    }
                }

                loadedUsers.push_back(user);
            }
            User::counter = maxCounter;
            cout << "Accounts loaded successfully from JSON." << endl;
        } catch (...) {
            cerr << "Error parsing accounts.json file. It might be empty or corrupted." << endl;
            inFile.close();
        }
    } else {
        cout << "No previous account data found!" << endl;
    }
    
    users = loadedUsers;  // Update global users list
    return users;
}

// Exports all accounts to a CSV file
void User::exportToCSV(const std::vector<User>& users) {
    createDataDir();
    ofstream outFile("data/accounts.csv");

    if (outFile) {
        // CSV Header
        outFile << "Account Number,Name,Balance,Type\n";
        for (const auto& user : users) {
            outFile << user.account_number << ","
                    << user.user_name << ","
                    << fixed << setprecision(2) << user.account_balance << ","
                    << accountTypeMap.at(user.account_type) << "\n";
        }
        outFile.close();
        cout << "Accounts exported successfully to CSV." << endl;
    } else {
        cerr << "Error exporting accounts to CSV!" << endl;
    }
}

std::string User::getAccountNumber() const {
    return account_number;
}

// Get-Set Methods for Testing
void User::setUserName(const std::string& name) {
    this->user_name = name;
    return;
}

void User::setAccountType(Type type) {
    this->account_type = type;
    return;
}

void User::setBalance(double balance) {
    this->account_balance = balance;
    return;
}

double User::getBalance() const {
    return this->account_balance;
}



