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

function quit(){
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

function  viewEmployeesDepartment() {
    pool.query(`SELECT * FROM department`, (err, results) => {
        if(err) {
            console.log(err);
        }

        const departmentChoices = results.rows.map(department => ({
            name: department.name,
            value: department.id
        }))
        console.log(departmentChoices)

        inquirer.prompt([{
            
        }]).then((answers) => {

        })
    })

    // sqlQuery = ``;
    //          pool.query(sqlQuery, (err, results) => {
    //             console.log("\n");
    //             console.table(results.rows)
    //             loadMainMenu();
    //          })
}

function loadMainMenu(){
    inquirer.prompt([{
        type: 'list',
        name:'choice',
        message: 'What would you like to do?',
        choices: [
            {
                name: "View All Employees",
                value: "VIEW_EMPLOYEES"
            },
            {
                name: "View All Employees By Department",
                value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
            },
            // ----Enter 15 total options here ----
            {
                name: "Quit",
                value: "QUIT"
            }
        ]
    }]).then((answers) => {
        let {choice} = answers; 
        if(choice === "VIEW_EMPLOYEES"){
           viewEmployees()
        }
        else if(choice === "VIEW_EMPLOYEES_BY_DEPARTMENT"){
            viewEmployeesDepartment()
        }
        else {
            quit();
        }
    });
}

function init(){
    console.log("Welcome to the Employee Management System");
    loadMainMenu();
}


init()