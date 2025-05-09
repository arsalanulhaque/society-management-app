
-- Table: Action
CREATE TABLE IF NOT EXISTS Action (
    ActionID INT PRIMARY KEY,
    ActionName VARCHAR(100) NOT NULL
);

-- Table: Floor
CREATE TABLE IF NOT EXISTS Floor (
    FloorID INT PRIMARY KEY,
    Floor VARCHAR(50) NOT NULL,
    Charges DECIMAL(10, 2) NOT NULL
);

-- Table: Menu
CREATE TABLE IF NOT EXISTS Menu (
    MenuID INT PRIMARY KEY,
    MenuName VARCHAR(100) NOT NULL,
    MenuURL VARCHAR(255),
    ParentMenuID INT,
    FOREIGN KEY (ParentMenuID) REFERENCES Menu(MenuID)
);

-- Table: Menu Actions Mapping
CREATE TABLE IF NOT EXISTS MenuActionsMapping(
    MenuActionID INT PRIMARY KEY,
    MenuID INT,
    ActionID INT
)

-- Table: Plot
CREATE TABLE IF NOT EXISTS Plot (
    PlotID INT PRIMARY KEY,
    HouseNo VARCHAR(50) NOT NULL,
    CategoryID INT,
    FloorID INT,
    TypeID INT,
    UserID INT,
    FOREIGN KEY (CategoryID) REFERENCES PlotCategory(CategoryID),
    FOREIGN KEY (FloorID) REFERENCES Floor(FloorID),
    FOREIGN KEY (TypeID) REFERENCES PlotType(TypeID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Table: PlotCategory
CREATE TABLE IF NOT EXISTS PlotCategory (
    CategoryID INT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    CategoryType CHAR(1) NOT NULL, -- R, A, B, C, D, etc.
    Charges DECIMAL(10, 2) NOT NULL
);

-- Table: PlotType
CREATE TABLE IF NOT EXISTS PlotType (
    TypeID INT PRIMARY KEY,
    TypeName VARCHAR(100) NOT NULL
);

-- Table: Receivable
CREATE TABLE IF NOT EXISTS Receivable (
    ReceivableID INT PRIMARY KEY,
    PlotID INT,
    MonthYear VARCHAR(10) NOT NULL, -- Format: MM/YYYY
    Amount DECIMAL(10, 2) NOT NULL,
    IsPaid BOOLEAN,
    PaidOnDate DATE,
    FOREIGN KEY (PlotID) REFERENCES Plot(PlotID)
);

-- Table: Role
CREATE TABLE IF NOT EXISTS Role (
    RoleID INT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);


-- Table: Role Menu Actions Mapping
CREATE TABLE IF NOT EXISTS RoleMenuActionsMapping (
    RoleMenuActionID INT PRIMARY KEY,
    RoleID INT,
    MenuID INT,
    ActionID INT
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID),
    FOREIGN KEY (MenuID) REFERENCES Menu(MenuID)
    FOREIGN KEY (ActionID) REFERENCES Action(ActionID)
);

-- Table: SocietyExpense (formerly Expenses)
CREATE TABLE IF NOT EXISTS SocietyExpense (
    ExpenseID INT PRIMARY KEY,
    ExpanseType VARCHAR(100) NOT NULL,
    ExpanseTitle VARCHAR(200),
    Description TEXT,
    MonthYear VARCHAR(10) NOT NULL, -- Format: MM/YYYY
    Amount DECIMAL(10, 2) NOT NULL,
    IsPaid BOOLEAN,
    PaidOnDate DATE
);

-- Table: User
CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(200),
    Email VARCHAR(150),
    Phone VARCHAR(15),
    RoleID INT,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);