    DROP DATABASE IF EXISTS employee_db;

    CREATE DATABASE employee_db;

    \c employee_db 

    CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30) NOT NULL
    );

    CREATE TABLE role (
        id SERIAL PRIMARY KEY,
        title VARCHAR(30) NOT NULL,
        salary DECIMAL(10, 2) NOT NULL,
        department_id INT NOT NULL,
        CONSTRAINT fk_department
        FOREIGN KEY (department_id) 
        REFERENCES department (id)
        ON DELETE CASCADE 
    );

    CREATE TABLE employee (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INT NOT NULL,
        manager_id INT,
        CONSTRAINT fk_role 
        FOREIGN KEY (role_id)
        REFERENCES role (id)
        ON DELETE CASCADE,
        CONSTRAINT fk_manager 
        FOREIGN KEY (manager_id)
        REFERENCES employee (id)
        ON DELETE SET NULL
    )