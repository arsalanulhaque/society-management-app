
-- Views for Dashboard

-- 1. Summarized view for receivables by month/year
CREATE OR REPLACE VIEW vw_ReceivablesSummary AS
SELECT 
    r.MonthYear,
    SUM(r.Amount) AS TotalAmount,
    SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) AS AmountReceived,
    SUM(CASE WHEN r.IsPaid = FALSE THEN r.Amount ELSE 0 END) AS AmountDue,
    CASE
        WHEN SUM(r.Amount) > 0 
        THEN (SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) / SUM(r.Amount)) * 100
        ELSE 0
    END AS RecoveryPercentage
FROM 
    Receivable r
GROUP BY 
    r.MonthYear;

-- 2. Current year summary
CREATE OR REPLACE VIEW vw_CurrentYearSummary AS
SELECT 
    CONCAT('01/', YEAR(CURRENT_DATE)) AS StartMonthYear,
    CONCAT('12/', YEAR(CURRENT_DATE)) AS EndMonthYear,
    SUM(r.Amount) AS TotalAmount,
    SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) AS AmountReceived,
    SUM(CASE WHEN r.IsPaid = FALSE THEN r.Amount ELSE 0 END) AS AmountDue,
    CASE
        WHEN SUM(r.Amount) > 0 
        THEN (SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) / SUM(r.Amount)) * 100
        ELSE 0
    END AS RecoveryPercentage
FROM 
    Receivable r
WHERE 
    SUBSTRING_INDEX(r.MonthYear, '/', -1) = YEAR(CURRENT_DATE);

-- 3. Current month summary
CREATE OR REPLACE VIEW vw_CurrentMonthSummary AS
SELECT 
    CONCAT(LPAD(MONTH(CURRENT_DATE), 2, '0'), '/', YEAR(CURRENT_DATE)) AS MonthYear,
    SUM(r.Amount) AS TotalAmount,
    SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) AS AmountReceived,
    SUM(CASE WHEN r.IsPaid = FALSE THEN r.Amount ELSE 0 END) AS AmountDue,
    CASE
        WHEN SUM(r.Amount) > 0 
        THEN (SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) / SUM(r.Amount)) * 100
        ELSE 0
    END AS RecoveryPercentage
FROM 
    Receivable r
WHERE 
    r.MonthYear = CONCAT(LPAD(MONTH(CURRENT_DATE), 2, '0'), '/', YEAR(CURRENT_DATE));

-- 4. Last month summary
CREATE OR REPLACE VIEW vw_LastMonthSummary AS
SELECT 
    CONCAT(LPAD(MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)), 2, '0'), '/', 
           YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))) AS MonthYear,
    SUM(r.Amount) AS TotalAmount,
    SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) AS AmountReceived,
    SUM(CASE WHEN r.IsPaid = FALSE THEN r.Amount ELSE 0 END) AS AmountDue,
    CASE
        WHEN SUM(r.Amount) > 0 
        THEN (SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) / SUM(r.Amount)) * 100
        ELSE 0
    END AS RecoveryPercentage
FROM 
    Receivable r
WHERE 
    r.MonthYear = CONCAT(LPAD(MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)), 2, '0'), '/', 
                         YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)));

-- 5. Last year summary
CREATE OR REPLACE VIEW vw_LastYearSummary AS
SELECT 
    CONCAT('01/', YEAR(CURRENT_DATE) - 1) AS StartMonthYear,
    CONCAT('12/', YEAR(CURRENT_DATE) - 1) AS EndMonthYear,
    SUM(r.Amount) AS TotalAmount,
    SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) AS AmountReceived,
    SUM(CASE WHEN r.IsPaid = FALSE THEN r.Amount ELSE 0 END) AS AmountDue,
    CASE
        WHEN SUM(r.Amount) > 0 
        THEN (SUM(CASE WHEN r.IsPaid = TRUE THEN r.Amount ELSE 0 END) / SUM(r.Amount)) * 100
        ELSE 0
    END AS RecoveryPercentage
FROM 
    Receivable r
WHERE 
    SUBSTRING_INDEX(r.MonthYear, '/', -1) = YEAR(CURRENT_DATE) - 1;

-- Views for Data Grids

-- 6. Detailed Plot Information
CREATE OR REPLACE VIEW vw_PlotDetails AS
SELECT
    p.PlotID,
    p.HouseNo,
    pc.CategoryID,
    pc.CategoryName,
    pc.CategoryType,
    pc.Charges AS CategoryCharges,
    f.FloorID,
    f.Floor,
    f.Charges AS FloorCharges,
    pt.TypeID,
    pt.TypeName,
    (pc.Charges + f.Charges) AS TotalCharges
FROM
    Plot p
JOIN
    PlotCategory pc ON p.CategoryID = pc.CategoryID
JOIN
    Floor f ON p.FloorID = f.FloorID
JOIN
    PlotType pt ON p.TypeID = pt.TypeID;

-- 7. Detailed Expense Information
CREATE OR REPLACE VIEW vw_ExpenseDetails AS
SELECT
    e.ExpenseID,
    e.ExpanseType,
    e.ExpanseTitle,
    e.Description,
    e.MonthYear,
    e.Amount,
    e.IsPaid,
    e.PaidOnDate,
    SUBSTRING_INDEX(e.MonthYear, '/', 1) AS Month,
    SUBSTRING_INDEX(e.MonthYear, '/', -1) AS Year
FROM
    SocietyExpense e;

-- 8. Detailed Receivable Information
CREATE OR REPLACE VIEW vw_ReceivableDetails AS
SELECT
    r.ReceivableID,
    r.PlotID,
    p.HouseNo,
    pc.CategoryName,
    f.Floor,
    pt.TypeName,
    r.MonthYear,
    r.Amount,
    r.IsPaid,
    r.PaidOnDate,
    SUBSTRING_INDEX(r.MonthYear, '/', 1) AS Month,
    SUBSTRING_INDEX(r.MonthYear, '/', -1) AS Year
FROM
    Receivable r
JOIN
    Plot p ON r.PlotID = p.PlotID
JOIN
    PlotCategory pc ON p.CategoryID = pc.CategoryID
JOIN
    Floor f ON p.FloorID = f.FloorID
JOIN
    PlotType pt ON p.TypeID = pt.TypeID;

-- 9. User Information with Roles
CREATE OR REPLACE VIEW vw_UserRoles AS
SELECT
    u.UserID,
    u.Username,
    u.FullName,
    u.Email,
    u.Phone,
    r.RoleID,
    r.RoleName
FROM
    User u
JOIN
    Role r ON u.RoleID = r.RoleID;

-- 10. User Permissions
CREATE OR REPLACE VIEW vw_UserPermissions AS
SELECT
    u.UserID,
    u.Username,
    m.MenuID,
    m.MenuName,
    m.MenuURL,
    rm.CanView,
    rm.CanAdd,
    rm.CanEdit,
    rm.CanDelete
FROM
    User u
JOIN
    Role r ON u.RoleID = r.RoleID
JOIN
    RoleMenuMapping rm ON r.RoleID = rm.RoleID
JOIN
    Menu m ON rm.MenuID = m.MenuID;
