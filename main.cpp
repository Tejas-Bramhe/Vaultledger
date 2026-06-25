#include "user.h"
#include <limits>

using namespace std;

int main() {
    User::loadFromJson();  // Load users from JSON at the start

    int choice;
    do {
        cout << "\n==== WELCOME TO VAULTLEDGER ====\n";
        cout << "1. Create Account\n";
        cout << "2. Display Account\n";
        cout << "3. Modify Account\n";
        cout << "4. Delete Account\n";
        cout << "5. Deposit Money\n";
        cout << "6. Withdraw Money\n";
        cout << "7. Export Accounts to CSV\n";
        cout << "8. Exit\n";
        cout << "Enter your choice: ";
        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            choice = -1;
        }

        switch (choice) {
            case 1: {
                User newUser;
                newUser.createAccount();
                users.push_back(newUser);  // Update global users list
                User::saveToJson();        // Persist immediately
                break;
            }
            case 2: {
                string accNumber;
                cout << "Enter Account Number: ";
                cin >> accNumber;

                auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                    return u.getAccountNumber() == accNumber;
                });

                if (it != users.end()) {
                    it->displayAccount();
                } else {
                    cout << "Account Not Found!" << endl;
                }
                break;
            }
            case 3: {
                string accNumber;
                cout << "Enter Account Number: ";
                cin >> accNumber;

                auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                    return u.getAccountNumber() == accNumber;
                });

                if (it != users.end()) {
                    it->modifyAccount();
                } else {
                    cout << "Account Not Found!" << endl;
                }
                break;
            }
            case 4: {
                string accNumber;
                cout << "Enter Account Number: ";
                cin >> accNumber;

                auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                    return u.getAccountNumber() == accNumber;
                });

                if (it != users.end()) {
                    string accNum = it->getAccountNumber();
                    users.erase(it);  // Remove from global vector
                    User::saveToJson();  // Update JSON after deletion
                    cout << "Account " << accNum << " deleted successfully." << endl;
                } else {
                    cout << "Account Not Found!" << endl;
                }
                break;
            }
            case 5: {
                string accNumber;
                double amount;
                cout << "Enter Account Number: ";
                cin >> accNumber;
                cout << "Enter Amount to Deposit: ";
                if (!(cin >> amount)) {
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    cout << "Invalid amount entered!" << endl;
                    break;
                }

                auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                    return u.getAccountNumber() == accNumber;
                });

                if (it != users.end()) {
                    it->deposit(amount);
                } else {
                    cout << "Account Not Found!" << endl;
                }
                break;
            }
            case 6: {
                string accNumber;
                double amount;
                cout << "Enter Account Number: ";
                cin >> accNumber;
                cout << "Enter Amount to Withdraw: ";
                if (!(cin >> amount)) {
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    cout << "Invalid amount entered!" << endl;
                    break;
                }

                auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                    return u.getAccountNumber() == accNumber;
                });

                if (it != users.end()) {
                    it->withdraw(amount);
                } else {
                    cout << "Account Not Found!" << endl;
                }
                break;
            }
            case 7: {
                User::exportToCSV(users);
                break;
            }
            case 8:
                cout << "Exiting VaultLedger... Have a Nice Day!\n";
                break;
            default:
                cout << "Invalid choice! Please try again.\n";
        }
    } while (choice != 8);

    return 0;
}
