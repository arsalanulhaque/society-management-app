
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'maintenance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Add user info to request
    req.user = decoded;
    next();
  });
};

// Check user permissions for a specific action
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const url = req.originalUrl.split('?')[0];
      
      // Find the menu that matches this URL
      const [menus] = await pool.query(
        'SELECT m.MenuID FROM Menu m WHERE m.MenuURL = ?',
        [url]
      );
      
      if (menus.length === 0) {
        return res.status(403).json({ message: 'Menu not found' });
      }
      
      const menuId = menus[0].MenuID;
      
      // Check if user has the required permission
      const [permissions] = await pool.query(
        `SELECT rmm.* FROM RoleMenuMapping rmm 
         JOIN User u ON rmm.RoleID = u.RoleID 
         WHERE u.UserID = ? AND rmm.MenuID = ?`,
        [userId, menuId]
      );
      
      if (permissions.length === 0 || !permissions[0][permission]) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const [users] = await pool.query(
      'SELECT u.*, r.RoleName FROM User u JOIN Role r ON u.RoleID = r.RoleID WHERE u.Username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Get user permissions
    const [permissions] = await pool.query(
      `SELECT m.MenuURL, rmm.CanView, rmm.CanAdd, rmm.CanEdit, rmm.CanDelete 
       FROM RoleMenuMapping rmm 
       JOIN Menu m ON rmm.MenuID = m.MenuID 
       WHERE rmm.RoleID = ?`,
      [user.RoleID]
    );
    
    // Create permission map
    const permissionMap = {};
    permissions.forEach(perm => {
      if (perm.MenuURL) {
        permissionMap[perm.MenuURL] = {
          canView: perm.CanView === 1,
          canAdd: perm.CanAdd === 1,
          canEdit: perm.CanEdit === 1,
          canDelete: perm.CanDelete === 1
        };
      }
    });
    
    // Create token
    const token = jwt.sign(
      { 
        id: user.UserID, 
        username: user.Username,
        role: user.RoleName,
        roleId: user.RoleID
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.json({
      success: true,
      user: {
        id: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName,
        permissions: permissionMap
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, fullName, phone, roleId } = req.body;
    
    // Check if username already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM User WHERE Username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO User (Username, Password, FullName, Email, Phone, RoleID) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, fullName, email, phone, roleId]
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const [users] = await pool.query(
      'SELECT u.*, r.RoleName FROM User u JOIN Role r ON u.RoleID = r.RoleID WHERE u.UserID = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user permissions
    const [permissions] = await pool.query(
      `SELECT m.MenuURL, rmm.CanView, rmm.CanAdd, rmm.CanEdit, rmm.CanDelete 
       FROM RoleMenuMapping rmm 
       JOIN Menu m ON rmm.MenuID = m.MenuID 
       WHERE rmm.RoleID = ?`,
      [user.RoleID]
    );
    
    // Create permission map
    const permissionMap = {};
    permissions.forEach(perm => {
      if (perm.MenuURL) {
        permissionMap[perm.MenuURL] = {
          canView: perm.CanView === 1,
          canAdd: perm.CanAdd === 1,
          canEdit: perm.CanEdit === 1,
          canDelete: perm.CanDelete === 1
        };
      }
    });
    
    // Return user info
    res.json({
      success: true,
      user: {
        id: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName,
        permissions: permissionMap
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard routes
app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_DashboardSummary');
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/expenses', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_MonthlyExpenseSummary');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Monthly expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/collections', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_MonthlyCollectionSummary');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Monthly collections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/categories', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_CategorySummary');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Category summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/floors', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_FloorSummary');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Floor summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Plot routes
app.get('/api/plots', verifyToken, checkPermission('CanView'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_PlotDetails');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get plots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/plots/:id', verifyToken, checkPermission('CanView'), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vw_PlotDetails WHERE PlotID = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Plot not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/plots', verifyToken, checkPermission('CanAdd'), async (req, res) => {
  try {
    const { houseNo, categoryId, floorId, typeId } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO Plot (HouseNo, CategoryID, FloorID, TypeID) VALUES (?, ?, ?, ?)',
      [houseNo, categoryId, floorId, typeId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Plot added successfully',
      plotId: result.insertId
    });
  } catch (error) {
    console.error('Add plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/plots/:id', verifyToken, checkPermission('CanEdit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { houseNo, categoryId, floorId, typeId } = req.body;
    
    await pool.query(
      'UPDATE Plot SET HouseNo = ?, CategoryID = ?, FloorID = ?, TypeID = ? WHERE PlotID = ?',
      [houseNo, categoryId, floorId, typeId, id]
    );
    
    res.json({
      success: true,
      message: 'Plot updated successfully'
    });
  } catch (error) {
    console.error('Update plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/plots/:id', verifyToken, checkPermission('CanDelete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM Plot WHERE PlotID = ?', [id]);
    
    res.json({
      success: true,
      message: 'Plot deleted successfully'
    });
  } catch (error) {
    console.error('Delete plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Receivable routes
app.get('/api/receivables', verifyToken, checkPermission('CanView'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ReceivableDetails');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get receivables error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/receivables', verifyToken, checkPermission('CanAdd'), async (req, res) => {
  try {
    const { plotId, monthYear, amount, isPaid, paidOnDate } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO Receivable (PlotID, MonthYear, Amount, IsPaid, PaidOnDate) VALUES (?, ?, ?, ?, ?)',
      [plotId, monthYear, amount, isPaid, paidOnDate]
    );
    
    res.status(201).json({
      success: true,
      message: 'Receivable added successfully',
      receivableId: result.insertId
    });
  } catch (error) {
    console.error('Add receivable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/receivables/:id', verifyToken, checkPermission('CanEdit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { plotId, monthYear, amount, isPaid, paidOnDate } = req.body;
    
    await pool.query(
      'UPDATE Receivable SET PlotID = ?, MonthYear = ?, Amount = ?, IsPaid = ?, PaidOnDate = ? WHERE ReceivableID = ?',
      [plotId, monthYear, amount, isPaid, paidOnDate, id]
    );
    
    res.json({
      success: true,
      message: 'Receivable updated successfully'
    });
  } catch (error) {
    console.error('Update receivable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Society Expenses routes
app.get('/api/expenses', verifyToken, checkPermission('CanView'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM SocietyExpense');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/expenses', verifyToken, checkPermission('CanAdd'), async (req, res) => {
  try {
    const { expanseType, expanseTitle, description, monthYear, amount, isPaid, paidOnDate } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO SocietyExpense (ExpanseType, ExpanseTitle, Description, MonthYear, Amount, IsPaid, PaidOnDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [expanseType, expanseTitle, description, monthYear, amount, isPaid, paidOnDate]
    );
    
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expenseId: result.insertId
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/expenses/:id', verifyToken, checkPermission('CanEdit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { expanseType, expanseTitle, description, monthYear, amount, isPaid, paidOnDate } = req.body;
    
    await pool.query(
      'UPDATE SocietyExpense SET ExpanseType = ?, ExpanseTitle = ?, Description = ?, MonthYear = ?, Amount = ?, IsPaid = ?, PaidOnDate = ? WHERE ExpenseID = ?',
      [expanseType, expanseTitle, description, monthYear, amount, isPaid, paidOnDate, id]
    );
    
    res.json({
      success: true,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/users', verifyToken, checkPermission('CanView'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_UserDetails');
    
    // Don't return password hash
    const users = rows.map(user => {
      const { Password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Roles and permissions routes
app.get('/api/roles', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Role');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/menus', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_MenuHierarchy');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/permissions', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_RoleMenuPermissions');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
