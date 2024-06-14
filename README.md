# Employee Tracker

Employee Tracker is a command-line application designed to manage a company's employee database. This tool allows you to view, add, update, and remove employees, roles, and departments. It's built using Node.js, Inquirer, and PostgreSQL.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Screenshots](#screenshots)
- [License](#license)
- [Credits](#credits)


## Installation

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/yourusername/employee-tracker.git
    cd employee-tracker
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

3. Install Inquirer:

    ```bash
    npm i inquirer@8.2.4
    ```

4. Set up your environment variables. Create a `.env` file in the root directory of your project and add the following:

    ```env
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_DATABASE=your_database_name
    ```

5. Ensure PostgreSQL is installed and running on your machine. Create a new database and configure it with the necessary tables:

    ```sql
    CREATE DATABASE your_database_name;
    \c your_database_name

    CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL
    );

    CREATE TABLE role (
        id SERIAL PRIMARY KEY,
        title VARCHAR(30) NOT NULL,
        salary DECIMAL(10, 2) NOT NULL,
        department_id INTEGER REFERENCES department(id)
    );

    CREATE TABLE employee (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INTEGER REFERENCES role(id),
        manager_id INTEGER REFERENCES employee(id)
    );
    ```

## Usage

1. Run the application:

    ```bash
    node index.js
    ```

2. Follow the prompts provided by Inquirer to manage your employee database. You can view, add, remove, and update employees, roles, and departments.

## Features

- View all employees
- View employees by department
- View employees by manager
- Add employees
- Remove employees
- Update employee roles
- Update employee managers
- View all departments
- Add departments
- Remove departments
- View utilized budget by department
- View all roles
- Add roles
- Remove roles

## Screenshots

## License

This project is licensed under the MIT License.

## Credits

Special thanks to my teachers, Drew and Kyle, for their guidance and support in teaching me the right methods to complete this module. Drew's speed runs were particularly helpful.

Thank you for using Employee Tracker!
