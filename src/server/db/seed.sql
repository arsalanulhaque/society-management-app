
-- Seed data for the database

-- Roles
INSERT INTO Role (RoleID, RoleName) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'Staff'),
(4, 'Resident');

-- Menu items
INSERT INTO Menu (MenuID, MenuName, MenuURL, ParentMenuID) VALUES
(1, 'Dashboard', '/', NULL),
(2, 'Management Panel', '/management-panel', NULL),
(3, 'Admin Tools', '/admin-tools', NULL),
(4, 'Plots', '/plots', 3),
(5, 'Receivables', '/receivables', 3),
(6, 'Expenses', '/expenses', 3),
(7, 'Users', '/users', 3),
(8, 'Reports', '/reports', 2);

-- Role-Menu Permissions
-- Admin has full access
INSERT INTO RoleMenuMapping (RoleMenuMappingID, RoleID, MenuID, CanView, CanAdd, CanEdit, CanDelete) VALUES
(1, 1, 1, 1, 1, 1, 1),   -- Admin - Dashboard
(2, 1, 2, 1, 1, 1, 1),   -- Admin - Management Panel
(3, 1, 3, 1, 1, 1, 1),   -- Admin - Admin Tools
(4, 1, 4, 1, 1, 1, 1),   -- Admin - Plots
(5, 1, 5, 1, 1, 1, 1),   -- Admin - Receivables
(6, 1, 6, 1, 1, 1, 1),   -- Admin - Expenses
(7, 1, 7, 1, 1, 1, 1),   -- Admin - Users
(8, 1, 8, 1, 1, 1, 1);   -- Admin - Reports

-- Manager has view/add/edit but not delete
INSERT INTO RoleMenuMapping (RoleMenuMappingID, RoleID, MenuID, CanView, CanAdd, CanEdit, CanDelete) VALUES
(9, 2, 1, 1, 1, 1, 0),    -- Manager - Dashboard
(10, 2, 2, 1, 1, 1, 0),   -- Manager - Management Panel
(11, 2, 3, 1, 1, 1, 0),   -- Manager - Admin Tools
(12, 2, 4, 1, 1, 1, 0),   -- Manager - Plots
(13, 2, 5, 1, 1, 1, 0),   -- Manager - Receivables
(14, 2, 6, 1, 1, 1, 0),   -- Manager - Expenses
(15, 2, 7, 1, 0, 0, 0),   -- Manager - Users (view only)
(16, 2, 8, 1, 1, 1, 0);   -- Manager - Reports

-- Staff has view/add but not edit/delete
INSERT INTO RoleMenuMapping (RoleMenuMappingID, RoleID, MenuID, CanView, CanAdd, CanEdit, CanDelete) VALUES
(17, 3, 1, 1, 0, 0, 0),   -- Staff - Dashboard (view only)
(18, 3, 2, 1, 1, 0, 0),   -- Staff - Management Panel
(19, 3, 4, 1, 1, 0, 0),   -- Staff - Plots
(20, 3, 5, 1, 1, 0, 0),   -- Staff - Receivables
(21, 3, 6, 1, 1, 0, 0),   -- Staff - Expenses
(22, 3, 8, 1, 0, 0, 0);   -- Staff - Reports (view only)

-- Resident can only view dashboard and reports
INSERT INTO RoleMenuMapping (RoleMenuMappingID, RoleID, MenuID, CanView, CanAdd, CanEdit, CanDelete) VALUES
(23, 4, 1, 1, 0, 0, 0),   -- Resident - Dashboard (view only)
(24, 4, 8, 1, 0, 0, 0);   -- Resident - Reports (view only)

-- Plot Types
INSERT INTO PlotType (TypeID, TypeName) VALUES
(1, 'Residential'),
(2, 'Commercial'),
(3, 'Mixed Use');

-- Floors
INSERT INTO Floor (FloorID, Floor, Charges) VALUES
(1, 'Ground Floor', 500),
(2, 'First Floor', 400),
(3, 'Second Floor', 350),
(4, 'Third Floor', 300),
(5, 'Penthouse', 600);

-- Plot Categories
INSERT INTO PlotCategory (CategoryID, CategoryName, CategoryType, Charges) VALUES
(1, 'Category A', 'A', 1000),
(2, 'Category B', 'B', 800),
(3, 'Category C', 'C', 600),
(4, 'Category D', 'D', 500);

-- Sample plots
INSERT INTO Plot (PlotID, HouseNo, CategoryID, FloorID, TypeID) VALUES
(1, 'A-101', 1, 1, 1),
(2, 'A-102', 1, 1, 1),
(3, 'B-201', 2, 2, 1),
(4, 'C-301', 3, 3, 1),
(5, 'D-101', 4, 1, 1),
(6, 'S-101', 2, 1, 2);

-- Sample users (password: password123)
INSERT INTO User (UserID, Username, Password, FullName, Email, Phone, RoleID) VALUES
(1, 'admin', '$2b$10$vRDgTUSLNe9d4QvXTMTMt.7nPXjWO/xqxMwA1RfkTcRRXpQ1rg3AO', 'Admin User', 'admin@example.com', '1234567890', 1),
(2, 'manager', '$2b$10$vRDgTUSLNe9d4QvXTMTMt.7nPXjWO/xqxMwA1RfkTcRRXpQ1rg3AO', 'Manager User', 'manager@example.com', '2345678901', 2),
(3, 'staff', '$2b$10$vRDgTUSLNe9d4QvXTMTMt.7nPXjWO/xqxMwA1RfkTcRRXpQ1rg3AO', 'Staff User', 'staff@example.com', '3456789012', 3),
(4, 'resident', '$2b$10$vRDgTUSLNe9d4QvXTMTMt.7nPXjWO/xqxMwA1RfkTcRRXpQ1rg3AO', 'Resident User', 'resident@example.com', '4567890123', 4);

-- User-Plot mapping
INSERT INTO UserPlotMapping (UserPlotMappingID, UserID, PlotID, AssignedDate) VALUES
(1, 4, 1, '2023-01-01'),
(2, 4, 3, '2023-02-15');

-- Sample receivables
INSERT INTO Receivable (ReceivableID, PlotID, MonthYear, Amount, IsPaid, PaidOnDate) VALUES
(1, 1, '01/2023', 1500, 1, '2023-01-10'),
(2, 1, '02/2023', 1500, 1, '2023-02-12'),
(3, 1, '03/2023', 1500, 1, '2023-03-08'),
(4, 1, '04/2023', 1500, 0, NULL),
(5, 2, '01/2023', 1500, 1, '2023-01-15'),
(6, 2, '02/2023', 1500, 1, '2023-02-18'),
(7, 2, '03/2023', 1500, 0, NULL),
(8, 3, '01/2023', 1200, 1, '2023-01-05'),
(9, 3, '02/2023', 1200, 1, '2023-02-07'),
(10, 3, '03/2023', 1200, 1, '2023-03-10'),
(11, 4, '01/2023', 950, 1, '2023-01-20'),
(12, 4, '02/2023', 950, 0, NULL);

-- Sample expenses
INSERT INTO SocietyExpense (ExpenseID, ExpanseType, ExpanseTitle, Description, MonthYear, Amount, IsPaid, PaidOnDate) VALUES
(1, 'Utility', 'Electricity Bill', 'Common area electricity bill', '01/2023', 25000, 1, '2023-01-15'),
(2, 'Utility', 'Water Bill', 'Water supply bill', '01/2023', 15000, 1, '2023-01-18'),
(3, 'Maintenance', 'Garden Maintenance', 'Monthly garden service', '01/2023', 8000, 1, '2023-01-20'),
(4, 'Maintenance', 'Security Staff', 'Security staff salaries', '01/2023', 30000, 1, '2023-01-25'),
(5, 'Utility', 'Electricity Bill', 'Common area electricity bill', '02/2023', 27000, 1, '2023-02-15'),
(6, 'Utility', 'Water Bill', 'Water supply bill', '02/2023', 16000, 1, '2023-02-18'),
(7, 'Maintenance', 'Garden Maintenance', 'Monthly garden service', '02/2023', 8000, 1, '2023-02-20'),
(8, 'Maintenance', 'Security Staff', 'Security staff salaries', '02/2023', 30000, 1, '2023-02-25'),
(9, 'Utility', 'Electricity Bill', 'Common area electricity bill', '03/2023', 26000, 1, '2023-03-15'),
(10, 'Utility', 'Water Bill', 'Water supply bill', '03/2023', 15500, 1, '2023-03-18'),
(11, 'Maintenance', 'Garden Maintenance', 'Monthly garden service', '03/2023', 8000, 0, NULL),
(12, 'Maintenance', 'Security Staff', 'Security staff salaries', '03/2023', 30000, 0, NULL),
(13, 'Repair', 'Gate Repair', 'Main gate repair work', '03/2023', 12000, 1, '2023-03-10');
