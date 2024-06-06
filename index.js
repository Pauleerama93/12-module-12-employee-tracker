const inquirer = require('inquirer');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'qwer',
    database: 'employee_db',
    port: 5432
},
    console.log("Connected to the database")
);

pool.connect();

function quit() {
    console.log("Goodbye!");
    process.exit();
}

function viewEmployees() {
    sqlQuery = `SELECT employee.id, employee.first_name, employee.last_name,
             role.title, department.name AS department, role.salary,
             CONCAT(manager.first_name, ' ', manager.last_name) AS manager
             FROM employee
             JOIN role on employee.role_id = role.id
             JOIN department on role.department_id = department.id
             JOIN employee manager on employee.manager_id = manager.id;`;
    pool.query(sqlQuery, (err, results) => {
        console.log("\n");
        console.table(results.rows)
        loadMainMenu();
    })
}

function viewEmployeesByDepartment() {
    let sqlQuery = `SELECT * FROM department`;
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }

        const departmentChoices = results.rows.map((department) => ({
            name: department.name,
            value: department.id
        }));
        // console.log(departmentChoices)


        inquirer.prompt([{
            type: 'list',
            name: 'departmentId',
            message: 'Which department would you like to see employee for?',
            choices: departmentChoices,
        }]).then(({ departmentId }) => {
            sqlQuery = `SELECT employee.id, employee.first_name,
            employee.last_name, role.title 
            FROM employee JOIN role on employee.role_id = role.id
            JOIN department on role.department_id = department.id
            WHERE department.id = $1;`
            pool.query(sqlQuery, [departmentId], (err, results) => {
                console.log("\n");
                console.table(results.rows)
                loadMainMenu();
            });
        });
    });
}

function viewEmployeesByMananger() {
    let sqlQuery = `SELECT * FROM employee`;
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }
        const managerChoices = results.rows.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));
        inquirer.prompt([{
            type: 'list',
            name: 'managerId',
            message: 'Which employee do you want to see direct report for?',
            choices: managerChoices,
        }])
            .then(({ managerId }) => {
                sqlQuery = `SELECT employee.id, employee.first_name,
                    employee.last_name, department.name AS department,
                    role.title FROM employee
                    JOIN role on employee.role_id = role.id
                    JOIN department on role.department_id = department.id
                    WHERE employee.manager_id = $1;`;

                pool.query(sqlQuery, [managerId], (err, results) => {
                    console.log("\n");
                    if(results.rows.length === 0) {
                        console.log("This employee has no report");
                    } else {
                        console.table(results.rows);
                    }
                    loadMainMenu();
                });
            });
    });
}

function addEmployee() {
    inquirer.prompt([
        {
        name: "first_name",
        message: "Enter the employee's first name"
        },
        {
            name: "last_name",
            message: "Enter the employee's last name"
        }
    ]).then(({first_name, last_name}) => {
        pool.query("SELECT * FROM role", (err, results) => {

            let roleChoices = results.rows.map(({id, title}) => ({
                name: title,
                value: id
            }));

            inquirer.prompt([
                {
                type: 'list',
                name: 'roleId',
                message: "What is the employee's role?",
                choices: roleChoices
                }
            ]).then(({roleId}) => {
                pool.query("SELECT * FROM employee", (err, results) => {
                    let managerChoices = results.rows.map(
                        ({ id, first_name, last_name}) =>({
                        name: `${first_name} ${last_name}`,
                        value: id,
                    }));

                    inquirer.prompt([{
                        type:'list',
                        name: 'managerId',
                        message: "Who is the employee's manager?",
                        choices: managerChoices
                    },
                    ])
                    .then(({managerId}) => {
                        let employee = {
                            manager_id: managerId,
                            role_id: roleId,
                            first_name: first_name,
                            last_name: last_name,
                        };
                        let sqlQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES ($1, $2, $3, $4)`;
                        pool.query(sqlQuery, [employee.first_name, employee.last_name, employee.role_id, employee.manager_id], (err, results) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log(`Adding employee: ${employee.first_name} ${employee.last_name}...`)
                            loadMainMenu();
                        });
                        
                    })

                });
            })
        });
    })
}

function removeEmployee() {
    let sqlQuery = `SELECT * FROM employee`;
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }

        const employeeChoices = results.rows.map(
            ({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
            })
        );

        inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee would you like to remove?",
                choices: employeeChoices,
            },
        ])
        .then(({ employeeId}) => {
            sqlQuery = `DELETE FROM employee WHERE id = $1;`;
            pool.query(sqlQuery, [employeeId], (err, results) => {
                console.log("\n");
                console.log("Employee removed");
                loadMainMenu();
            });
        });
    });
}

function updateEmployeeRole() {
    pool.query("SELECT * FROM employee", (err, results) => {
        const employeeChoices = results.rows.map(({ id, first_name, last_name}) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));

        inquirer.prompt([{
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to update?",
            choices: employeeChoices
        }]).then(({employeeId})=> {
            pool.query("SELECT * FROM role", (err, results) => {
                const roleChoices = results.rows.map(({ id, title }) => ({
                    name: title, 
                    value: id
                }));

                inquirer.prompt(({
                    type: "list",
                    name: "roleId",
                    message: "What is the employee's new role?",
                    choices: roleChoices
                })).then(({roleId}) => { 
                    let sqlQuery = `UPDATE employee SET role_id = $1 WHERE id = $2`;
                    pool.query(sqlQuery, [roleId, employeeId], (err, results) => {
                    console.log("\n");
                    console.log("Employee role uppdate");
                    loadMainMenu();
                    });
                });
            });
        });
    });
}

function updateEmployeeManager() {
    pool.query("SELECT * FROM employee", (err, results) => {
        const employeeChoices = results.rows.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));

        inquirer.prompt([
            {
            type: "list",
            name: "employeeId",
            message: "Which employee's manager would you like to update?",
            choices: employeeChoices
            }
        ]).then(({employeeId}) => {
            pool.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee WHERE employee.id != $1", [employeeId], (err, results) => {
            const managerChoices = results.rows.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
                }));

                inquirer.prompt([{
                    type: "list",
                    name: "managerId",
                    message: "Who is the employee's new manager?",
                    choices: managerChoices,
                }]).then(({managerId}) => {
                    let sqlQuery = `UPDATE employee SET manager_id = $1 WHERE id = $2 `;
                    pool.query(sqlQuery, [managerId, employeeId], (err, results) => {
                        console.log("\n");
                        console.log("Employee manager updated!");
                        loadMainMenu();
                    });
                });
            });
        })
    });
}

function addDepartment() {
    inquirer.prompt([{
        name: 'name',
        message: 'Enter the name of the department'
    }]).then(({ name}) => {
        pool.query('INSERT INTO department (name) VALUES ($1)', [name], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(`Adding department: ${name}...`);
            loadMainMenu();
        });
    });
}

function viewAllDepartments(){
    pool.query("SELECT * FROM department", (err, results) => {
        console.log("\n");
        console.table(results.rows);
        loadMainMenu();
    });
}

function removeDepartment() {
    let sqlQuery = `SELECT * FROM department`;
    pool.query(sqlQuery, (err, results) => {
        if (err) { 
            console.log(err);
        }
        const departmentChoices = results.rows.map((department) => ({
            name: department.name,
            value: department.id,
        }));
        inquirer.prompt([
            {
                type: "list",
                name: "departmentId",
                message: "Which department would you like to remove?",
                choices: departmentChoices
            }
        ]).then(({departmentId}) => {
            sqlQuery = `DELETE FROM department WHERE id = $1`;
            pool.query(sqlQuery, [departmentId], (err, results) => {
                console.log("\n");
                console.log("Department removed");
                loadMainMenu();
            });
        });
    });

}

function viewUtilizedBudgetByDepartment() {
    let sqlQuery = `SELECT department.id, department.name, SUM(role.salary) AS utilized_budget
    FROM employee JOIN role on employee.role_id = role.id
    JOIN department on role.department_id = department.id
    GROUP BY department.id, department.name;`;

    pool.query(sqlQuery, (err, results) => {
        console.log("\n");
        console.table(results.rows);
        loadMainMenu();
    });
}

function viewRoles() {
    let sqlQuery = `SELECT * FROM role`;
    pool.query(sqlQuery, (err, results) => {
        console.log("\n");
        console.table(results.rows);
        loadMainMenu();
    });
}

function addRoles() {
    let sqlQuery = `SELECT * FROM department`;
    pool.query(sqlQuery, (err, results) => {
        const departmentChoices = results.rows.map(({id, name}) => ({
            name: name,
            value: id,
        }));

        inquirer.prompt([
            {
                name: "title",
                message: "Enter the title of the role",
            },
            {
                name: "salary",
                message: "Enter the salary of the role"
            },
            {
                type: "list",
                name: "departmentId",
                message: "Which department does the role belong to?",
                choices: departmentChoices,
            }
        ]).then(({title, salary, departmentId}) => {
            let sqlQuery = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
            pool.query(sqlQuery, [title, salary, departmentId], (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(`Adding role: ${title}...`);
                loadMainMenu();
            });
        });
    });
}

function removeRole() {
    let sqlQuery = `SELECT * FROM role`;
    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
        }
        const roleChoices = results.rows.map((role) => ({
            name: role.title,
            value: role.id,
        }));
        inquirer.prompt([
            {
                type: "list",
                name: "roleId",
                message: "Which role would you like to remove?",
                choices: roleChoices,
            },
        ])
        .then(({roleId}) => {
            sqlQuery = `DELETE FROM role WHERE id = $1;`;
            pool.query(sqlQuery, [roleId], (err, results) => {
                console.log("\n");
                console.log("Role Removed");
                loadMainMenu();
            });
        });
    });
}

function loadMainMenu() {
    inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            {
                name: "View All Employees",
                value: "VIEW_EMPLOYEES",
            },
            {
                name: "View All Employees By Department",
                value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
            },
            {
                name: "View All Employees By Manager",
                value: "VIEW_EMPLOYEES_BY_MANAGER",
            },
            {
                name: "Add Employee",
                value: "ADD_EMPLOYEE",
            },
            {
                name: "Remove Employee",
                value: "REMOVE_EMPLOYEE",
            },
            {
                name: "Update Employee Role",
                value: "UPDATE_EMPLOYEE_ROLE",
            },
            {
                name: "Update Employee Manager",
                value: "UPDATE_EMPLOYEE_MANAGER",
            },
            {
                name: "Add Department",
                value: "ADD_DEPARTMENT",
            },
            {
                name: "View All Departments",
                value: "VIEW_ALL_DEPARTMENTS",
            },
            {
                name: "Remove Department",
                value: "REMOVE_ALL_DEPARTMENTS",
            },
            {
                name: "View Utilized Budget By Department",
                value: "VIEW_UTILIZED_BUDGET_BY_DEPARTMENT",
            },
            {
                name: "View Roles",
                value: "VIEW_ROLES",
            },
            {
                name: "Add Role",
                value: "ADD_ROLE",
            },
            {
                name: "Remove Role",
                value: "REMOVE_ROLE",
            },
            {
                name: "Quit",
                value: "QUIT"
            }
        ]
    }]).then((answers) => {
        let { choice } = answers;
        if (choice === "VIEW_EMPLOYEES") {
            viewEmployees();
        }
        else if (choice === "VIEW_EMPLOYEES_BY_DEPARTMENT") {
            viewEmployeesByDepartment();
        }
        else if (choice === "VIEW_EMPLOYEES_BY_MANAGER") {
            viewEmployeesByMananger();
        }
        else if ( choice === "ADD_EMPLOYEE"){
            addEmployee();
        }
        else if ( choice === "REMOVE_EMPLOYEE"){
            removeEmployee(); 
        }
        else if ( choice === "UPDATE_EMPLOYEE_ROLE"){
            updateEmployeeRole(); 
        }
        else if ( choice === "UPDATE_EMPLOYEE_MANAGER"){
            updateEmployeeManager();
        }
        else if ( choice === "ADD_DEPARTMENT"){
            addDepartment();
        }
        else if (choice === "VIEW_ALL_DEPARTMENTS"){
            viewAllDepartments();
        }
        else if ( choice === "REMOVE_ALL_DEPARTMENTS"){
            removeDepartment();
        }
        else if (choice === "VIEW_UTILIZED_BUDGET_BY_DEPARTMENT"){
            viewUtilizedBudgetByDepartment();
        }
        else if (choice === "VIEW_ROLES"){
            viewRoles();
        }
        else if ( choice === "ADD_ROLE"){
            addRoles();
        }
        else if ( choice === "REMOVE_ROLE"){
            removeRole();
        }
        else {
            quit();
        }
    });
}

function init() {
    console.log("Welcome to the Employee Management System");
    loadMainMenu();
}


init()