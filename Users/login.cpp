#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <ctime>
#include <iomanip>
#include <windows.h>
#define LIGHT_BLUE "\033[1;92m"
#define RESET_COLOR "\033[0m"

using namespace std;

string trim(const string &str)
{
    size_t first = str.find_first_not_of(' ');
    if (string::npos == first)
    {
        return str;
    }
    size_t last = str.find_last_not_of(' ');
    return str.substr(first, (last - first + 1));
}

vector<vector<string>> loadData(const string &filename)
{
    vector<vector<string>> data;
    ifstream file(filename);
    string line, word;

    while (getline(file, line))
    {
        vector<string> row;
        stringstream ss(line);
        while (getline(ss, word, ','))
        {
            row.push_back(trim(word));
        }
        data.push_back(row);
    }
    file.close();
    return data;
}

void saveData(const string &filename, const vector<vector<string>> &data)
{
    ofstream file(filename);
    for (const auto &row : data)
    {
        for (size_t i = 0; i < row.size(); ++i)
        {
            file << row[i];
            if (i < row.size() - 1)
                file << ",";
        }
        file << endl;
    }
    file.close();
}

void logUserActivity(const string &username)
{
    ofstream file("C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Users/useractivities.csv", ios::app);
    time_t now = time(0);
    tm *ltm = localtime(&now);

    file << username << "," << (ltm->tm_year + 1900) << "-" << (ltm->tm_mon + 1) << "-" << ltm->tm_mday
         << " " << ltm->tm_hour << ":" << ltm->tm_min << ":" << ltm->tm_sec << endl;
    file.close();
}

void logUserRemark(const string &username, const string &remark)
{
    ofstream file("C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Users/userremark.csv", ios::app);
    time_t now = time(0);
    tm *ltm = localtime(&now);

    file << username << "," << (ltm->tm_year + 1900) << "-" << (ltm->tm_mon + 1) << "-" << ltm->tm_mday
         << " " << ltm->tm_hour << ":" << ltm->tm_min << ":" << ltm->tm_sec << "," << remark << endl;
    file.close();
}

void logQuery(const string &username, const string &query)
{
    ofstream file("C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Admin/queries.csv", ios::app);
    file << username << "," << query << endl;
    file.close();
}

void displayQueriesAndResponses(const string &username)
{
    ifstream file("C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Admin/queries.csv");
    string line;
    
    bool foundQuery = false;
    
    while (getline(file, line))
    {
        stringstream ss(line);
        string user, query, response;

        getline(ss, user, ',');
        getline(ss, query, ',');
        getline(ss, response, ',');

        if (user == username)
        {
            foundQuery = true;
            Sleep(1000);
            cout << LIGHT_BLUE << "Your Query: " << RESET_COLOR << query << endl;
            if (!response.empty())
            {
                cout << LIGHT_BLUE << "Admin Response: " << RESET_COLOR << response << endl;
            }
            else
            {
                cout << LIGHT_BLUE << "Admin Response: " << RESET_COLOR << "(No response yet)" << endl;
            }
            cout << endl;
        }
    }

    if (!foundQuery)
    {
        cout << LIGHT_BLUE << "No queries found for the user." << RESET_COLOR << endl;
    }

    file.close();
}

void editAccountDetails(vector<vector<string>> &data, const string &username)
{
    string oldPassword, newPassword, newMob, newEmail;
    bool verified = false;

    // Find the user row
    for (auto &row : data)
    {
        if (row[0] == username)
        {
            cout << "Enter your current password: ";
            cin >> oldPassword;

            // Reverify the password
            if (row[1] == oldPassword)
            {
                verified = true;

                int editChoice;
                cout << "What do you want to edit? (1 - Password, 2 - Mobile, 3 - Email): ";
                cin >> editChoice;

                if (editChoice == 1)
                {
                    cout << "Enter your new password: ";
                    cin >> newPassword;
                    row[1] = newPassword;  // Update the password in the CSV data
                    Sleep(1000);
                    cout << LIGHT_BLUE << "Password updated successfully." << RESET_COLOR << endl;
                }
                else if (editChoice == 2)
                {
                    cout << "Enter your new mobile number: ";
                    cin >> newMob;
                    row[2] = newMob;  // Update the mobile number in the CSV data
                    Sleep(1000);
                    cout << LIGHT_BLUE << "Mobile number updated successfully." << RESET_COLOR << endl;
                }
                else if (editChoice == 3)
                {
                    cout << "Enter your new email: ";
                    cin >> newEmail;
                    row[3] = newEmail;  // Update the email in the CSV data
                    Sleep(1000);
                    cout << LIGHT_BLUE << "Email updated successfully." << RESET_COLOR << endl;
                }
                else
                {
                    cout << "Invalid choice!" << endl;
                }
            }
            else
            {
                cout << LIGHT_BLUE << "Incorrect current password!" << RESET_COLOR << endl;
            }
            break;
        }
    }

    if (verified)
    {
        // Save the updated data back to the file
        saveData("C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Admin/data.csv", data);
    }
}

int main()
{
    const string filename = "C:/Aa Omm Prakash Sahu/VS CODE/C++/Database using  CPP/Admin/data.csv";
    vector<vector<string>> data = loadData(filename);

    string username, password;
    cout << "Enter username: ";
    cin >> username;
    cout << "Enter password: ";
    cin >> password;

    bool verified = false;
    for (const auto &row : data)
    {
        if (row[0] == username && row[1] == password)
        {
            verified = true;
            break;
        }
    }

    if (verified)
    {
        Sleep(1000);
        cout << LIGHT_BLUE << "Account Login Successful" << RESET_COLOR << endl;
        logUserActivity(username);

        int choice;
        do
        {
            cout << "\n1 -- Enter Remark\n2 -- Raise a Query\n3 -- Edit Account Details\n4 -- View Queries and Responses\n5 -- Exit\n";
            cout << "Enter your choice: ";
            cin >> choice;
            cin.ignore();  // Ignore newline after integer input

            if (choice == 1)
            {
                string remark;
                cout << "Enter a remark: ";
                getline(cin, remark);
                logUserRemark(username, remark);
            }
            else if (choice == 2)
            {
                string query;
                cout << "Enter your query: ";
                getline(cin, query);
                logQuery(username, query);
                cout << LIGHT_BLUE << "Query submitted successfully." << RESET_COLOR << endl;
            }
            else if (choice == 3)
            {
                editAccountDetails(data, username);
            }
            else if (choice == 4)
            {
                displayQueriesAndResponses(username);  // New feature: Display queries and admin responses
            }
            else if (choice != 5)
            {
                cout << "Invalid choice, please try again." << endl;
            }
        } while (choice != 5);

        cout << LIGHT_BLUE << "Goodbye!" << RESET_COLOR << endl;
    }
    else
    {
        cout << LIGHT_BLUE << "Invalid Credentials \nSession Cancelled" << RESET_COLOR << endl;
        Sleep(2000);
    }

    return 0;
}
