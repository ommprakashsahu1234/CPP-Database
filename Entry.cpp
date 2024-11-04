#include <iostream>
#include <windows.h>
#include <cstdlib>
#include <string>

using namespace std;

int main()
{
    const string Admin_Pw = "Admin@123";

    cout << "Write your accessibility :" << endl;
    cout << "ADMIN or USER" << endl;

    string option;
    cin >> option;
    cin.ignore();

    string cmd;

    if (option == "ADMIN" || option == "Admin" || option == "admin") {
        cout << "Enter Admin Password : ";
        string admpw;
        cin >> admpw;
        if (admpw == Admin_Pw) {
            cmd = "code Admin/DataEntry.cpp && Admin\\DataEntry";
        } else {
            cout << "Incorrect password. Exiting..." << endl;
            return 1;
        }
    } else if (option == "USER" || option == "User" || option == "user") {
        cmd = "code Users/login.cpp && Users\\login";
    } else {
        cout << "Invalid option. Exiting..." << endl;
        return 1;
    }

    cout << "Executing command: " << cmd << endl;
    int result = system(cmd.c_str());
    if (result == -1) {
        cout << "Failed to execute command." << endl;
        return 1;
    }

    return 0;
}
