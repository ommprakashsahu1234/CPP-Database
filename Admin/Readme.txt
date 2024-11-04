# User Management and Complaint Handling System

## Overview

This User Management and Complaint Handling System is a C++ application designed to manage user accounts and handle complaints. The system allows users to add, retrieve, modify, and delete user data, as well as log and view complaints. This document provides an overview of how to use the system effectively.

## Features

1. **Print All Data**: Display all user data in CSV format.
2. **Retrieve Data**: Search for user data by username, mobile number, or email.
3. **Insert Data**: Add new user data while checking for duplicates and constraints.
4. **Delete Data**: Remove user data after verifying with the password.
5. **Modify Account Details**: Update user details after verifying with the password.
6. **Add Complaint**: Log a new complaint for an existing user.
7. **View Complaint**: Retrieve complaint details using the complaint number.

## Getting Started

### Prerequisites

- C++ compiler (e.g., g++)
- Basic knowledge of command-line interface

### Files

- **main.cpp**: The source code file for the application.
- **data.csv**: Stores user data.
- **activities.csv**: Logs activities related to user data manipulation.
- **complaints.csv**: Logs user complaints.

### File Structure

- Each user data entry in `data.csv` is stored in the format:
  ```
  username,password,mobile_number,email
  ```
- Each activity log in `activities.csv` is stored in the format:
  ```
  activity,username,timestamp,old_value,new_value,remark
  ```
- Each complaint log in `complaints.csv` is stored in the format:
  ```
  username,description,complaint_number,remark
  ```

### Directory Structure

Ensure that all necessary files (`main.cpp`, `data.csv`, `activities.csv`, `complaints.csv`) are placed in the same directory. This ensures that the application can access and modify the CSV files correctly.

## How to Use

### Running the Program

1. **Compile the Program**:
   ```sh
   g++ -o user_management_system main.cpp
   ```
2. **Run the Program**:
   ```sh
   ./user_management_system
   ```

### Main Menu Options

When you run the program, you will be presented with the following options:

1. **Print All Data in CSV Format**:
   - Select option 1 to print all user data in CSV format.
   - Useful for quickly viewing all stored user information.

2. **Retrieve Data**:
   - Select option 2 to search for user data.
   - You can search by username, mobile number, or email.
   - Enter your search term and the program will display the corresponding user details.

3. **Insert New Data**:
   - Select option 3 to add a new user.
   - Enter the required details: username, password, mobile number, and email.
   - The program checks for duplicate usernames and ensures that no more than 5 accounts use the same mobile number or email.

4. **Delete Data**:
   - Select option 4 to delete a user.
   - Enter the username and verify with the password.
   - If the username and password match, the user data will be deleted.

5. **Modify Account Details**:
   - Select option 5 to modify existing user details.
   - Enter the username and verify with the password.
   - Choose the detail to modify (password, mobile number, or email) and enter the new value.
   - The modification will be saved after verification.

6. **Add a New Complaint**:
   - Select option 6 to log a new complaint.
   - Enter the username and the complaint description.
   - The program generates a unique complaint number and logs the complaint.
   - You can add a remark while logging the complaint.

7. **View a Complaint**:
   - Select option 7 to view a complaint.
   - Enter the complaint number to retrieve the complaint details.
   - The program displays the complaint description and any remarks associated with it.

### Logging and Tracking

- All activities related to user data manipulation are logged in `activities.csv` with timestamps for auditing purposes.
- Complaints are logged in `complaints.csv` with unique complaint numbers for easy tracking and resolution.

## Conclusion

This system provides a comprehensive solution for managing user accounts and handling complaints. By following the steps outlined in this document, users can effectively use the application to maintain and manage user data and complaints. Ensure that the CSV files are properly formatted and placed in the same directory as the executable for smooth operation. For any issues or further assistance, please refer to the source code documentation or contact the developer.

Happy managing!

Managed By Omm Prakash Sahu
Mail at : opsommprakash+projecthelp@outlook.com