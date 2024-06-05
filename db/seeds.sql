\c employee_db

INSERT INTO department (name)
VALUES ('HR'),
('Research & Development'),
('Sales'),
('Warehouse');

INSERT INTO role (title, salary, department_id)
VALUES ('Boss', 90000, 1),
('Researcher', 100000, 2),
('Developer', 100000, 2),
('Sales Rep', 70000, 3),
('Warehouse Manager', 50000, 4),
('Warehouse Worker', 20000, 4);

INSERT INTO employee
(first_name, last_name, role_id, manager_id)
VALUES ('Eric', 'Buchiet', 1, NULL),
('Paulee', 'Nelson', 2, 1),
('Cassidy','Clancy', 3, 1),
('Clark','Moniz', 4, 1),
('Rueben','Valazquez', 6, 1),
('Katie','Peterson', 5, 1);


