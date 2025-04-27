
-- Dashboard summary view
CREATE OR REPLACE VIEW vw_DashboardSummary AS
SELECT 
    (SELECT COUNT(*) FROM Plot) AS totalPlots,
    (SELECT SUM(Amount) FROM SocietyExpense) AS totalExpenses,
    (SELECT SUM(Amount) FROM Receivable) AS totalReceivables,
    (SELECT SUM(Amount) FROM Receivable WHERE IsPaid = 1) AS totalPaidReceivables,
    (SELECT SUM(Amount) FROM Receivable WHERE IsPaid = 0 OR IsPaid IS NULL) AS pendingReceivables,
    (SELECT 
        CASE 
            WHEN SUM(Amount) = 0 THEN 0 
            ELSE (SUM(CASE WHEN IsPaid = 1 THEN Amount ELSE 0 END) / SUM(Amount)) * 100 
        END 
    FROM Receivable) AS collectionPercentage;

-- Monthly expenses summary view
CREATE OR REPLACE VIEW vw_MonthlyExpenseSummary AS
SELECT 
    MonthYear AS month, 
    SUM(Amount) AS amount
FROM SocietyExpense
GROUP BY MonthYear
ORDER BY STR_TO_DATE(CONCAT('01/', MonthYear), '%d/%m/%Y') DESC
LIMIT 12;

-- Monthly collection summary view
CREATE OR REPLACE VIEW vw_MonthlyCollectionSummary AS
SELECT 
    MonthYear AS month,
    SUM(CASE WHEN IsPaid = 1 THEN Amount ELSE 0 END) AS collected,
    SUM(CASE WHEN IsPaid = 0 OR IsPaid IS NULL THEN Amount ELSE 0 END) AS pending
FROM Receivable
GROUP BY MonthYear
ORDER BY STR_TO_DATE(CONCAT('01/', MonthYear), '%d/%m/%Y') DESC
LIMIT 12;

-- Plot category summary view
CREATE OR REPLACE VIEW vw_CategorySummary AS
SELECT 
    pc.CategoryName AS categoryName,
    COUNT(p.PlotID) AS count
FROM Plot p
JOIN PlotCategory pc ON p.CategoryID = pc.CategoryID
GROUP BY pc.CategoryName;

-- Floor summary view
CREATE OR REPLACE VIEW vw_FloorSummary AS
SELECT 
    f.Floor AS floor,
    COUNT(p.PlotID) AS count
FROM Plot p
JOIN Floor f ON p.FloorID = f.FloorID
GROUP BY f.Floor;

-- Plot details view with joined data
CREATE OR REPLACE VIEW vw_PlotDetails AS
SELECT 
    p.PlotID,
    p.HouseNo,
    p.CategoryID,
    p.FloorID,
    p.TypeID,
    pc.CategoryName,
    f.Floor,
    pt.TypeName,
    pc.Charges + f.Charges AS Charges
FROM Plot p
JOIN PlotCategory pc ON p.CategoryID = pc.CategoryID
JOIN Floor f ON p.FloorID = f.FloorID
JOIN PlotType pt ON p.TypeID = pt.TypeID;

-- Receivable details view with plot info
CREATE OR REPLACE VIEW vw_ReceivableDetails AS
SELECT 
    r.ReceivableID,
    r.PlotID,
    r.MonthYear,
    r.Amount,
    r.IsPaid,
    r.PaidOnDate,
    p.HouseNo
FROM Receivable r
JOIN Plot p ON r.PlotID = p.PlotID;

-- User details view with role
CREATE OR REPLACE VIEW vw_UserDetails AS
SELECT 
    u.UserID,
    u.Username,
    u.FullName,
    u.Email,
    u.Phone,
    u.RoleID,
    r.RoleName
FROM User u
JOIN Role r ON u.RoleID = r.RoleID;

-- User plot mapping details
CREATE OR REPLACE VIEW vw_UserPlotMapping AS
SELECT 
    upm.UserPlotMappingID,
    upm.UserID,
    upm.PlotID,
    upm.AssignedDate,
    p.HouseNo,
    u.FullName
FROM UserPlotMapping upm
JOIN Plot p ON upm.PlotID = p.PlotID
JOIN User u ON upm.UserID = u.UserID;

-- Menu hierarchy view
CREATE OR REPLACE VIEW vw_MenuHierarchy AS
SELECT 
    m.MenuID,
    m.MenuName,
    m.MenuURL,
    m.ParentMenuID,
    p.MenuName AS ParentMenuName
FROM Menu m
LEFT JOIN Menu p ON m.ParentMenuID = p.MenuID;

-- Role menu Permissions
CREATE OR REPLACE VIEW vw_RoleMenuPermissions AS
SELECT 
    rmm.RoleMenuMappingID,
    rmm.RoleID,
    r.RoleName,
    rmm.MenuID,
    m.MenuName,
    m.MenuURL,
    rmm.CanView,
    rmm.CanAdd,
    rmm.CanEdit,
    rmm.CanDelete
FROM RoleMenuMapping rmm
JOIN Role r ON rmm.RoleID = r.RoleID
JOIN Menu m ON rmm.MenuID = m.MenuID;

-- Current month receivables summary
CREATE OR REPLACE VIEW vw_CurrentMonthReceivables AS
SELECT 
    SUM(Amount) AS totalAmount,
    SUM(CASE WHEN IsPaid = 1 THEN Amount ELSE 0 END) AS paidAmount,
    SUM(CASE WHEN IsPaid = 0 OR IsPaid IS NULL THEN Amount ELSE 0 END) AS pendingAmount,
    COUNT(*) AS totalRecords,
    SUM(CASE WHEN IsPaid = 1 THEN 1 ELSE 0 END) AS paidRecords,
    SUM(CASE WHEN IsPaid = 0 OR IsPaid IS NULL THEN 1 ELSE 0 END) AS pendingRecords
FROM Receivable
WHERE MonthYear = DATE_FORMAT(CURDATE(), '%m/%Y');

-- Current month expenses summary
CREATE OR REPLACE VIEW vw_CurrentMonthExpenses AS
SELECT 
    SUM(Amount) AS totalAmount,
    SUM(CASE WHEN IsPaid = 1 THEN Amount ELSE 0 END) AS paidAmount,
    SUM(CASE WHEN IsPaid = 0 OR IsPaid IS NULL THEN Amount ELSE 0 END) AS pendingAmount,
    COUNT(*) AS totalRecords,
    SUM(CASE WHEN IsPaid = 1 THEN 1 ELSE 0 END) AS paidRecords,
    SUM(CASE WHEN IsPaid = 0 OR IsPaid IS NULL THEN 1 ELSE 0 END) AS pendingRecords
FROM SocietyExpense
WHERE MonthYear = DATE_FORMAT(CURDATE(), '%m/%Y');
