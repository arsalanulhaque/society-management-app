const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT;

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

app.get('/', async (req, res) => { res.status(200).json({ message: 'Service is running!' }) })

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

// Check user Permissions for a specific action
const checkPermission = (Permission) => {
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

      // Check if user has the required Permission
      const [Permissions] = await pool.query(
        `SELECT rmm.* FROM RoleMenuMapping rmm 
         JOIN User u ON rmm.RoleID = u.RoleID 
         WHERE u.UserID = ? AND rmm.MenuID = ?`,
        [userId, menuId]
      );

      if (Permissions.length === 0 || !Permissions[0][Permission]) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during Permission check' });
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
      [username], ' and password = ?', [password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    // const passwordMatch = await bcrypt.compare(password, user.Password);
    // if (!passwordMatch) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Get user Permissions
    const [lstPermissions] = await pool.query(`CALL get_permissions_by_role(?)`, [user.RoleID]);

    // Create PermissionMap and Menus
    const PermissionMap = {};
    const Menus = [];

    lstPermissions['0'].forEach(perm => {
      if (perm.MenuURL) {
        // Build the permission map dynamically
        PermissionMap[perm.MenuURL] = {};

        Object.keys(perm).forEach(key => {
          if (
            key !== 'MenuURL' &&
            key !== 'RoleID' &&
            key !== 'RoleName' &&
            key !== 'MenuID' &&
            key !== 'MenuName' &&
            key !== 'ParentMenuID'
          ) {
            PermissionMap[perm.MenuURL][key] = perm[key] === 1;
          }
        });

        // Push menu info (avoid duplicates)
        Menus.push({
          RoleID: user.RoleID,
          MenuID: perm.MenuID,
          MenuName: perm.MenuName,
          MenuURL: perm.MenuURL,
          ParentMenuID: perm.ParentMenuID
        });
      }
    });

    // Optionally remove duplicates from Menus
    const uniqueMenus = Array.from(
      new Map(Menus.map(m => [m.MenuID, m])).values()
    );

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
        role: { roleID: user.RoleID, roleName: user.RoleName },
        permissions: PermissionMap,
        menus: uniqueMenus
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    // Find user
    const [users] = await pool.query(
      'SELECT u.*, r.RoleName FROM User u JOIN Role r ON u.RoleID = r.RoleID WHERE u.Username = ?',
      [username], ' and password = ?', [password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    // const passwordMatch = await bcrypt.compare(password, user.Password);
    // if (!passwordMatch) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Get user Permissions
    const [lstPermissions] = await pool.query(`CALL get_permissions_by_role(?)`, [user.RoleID]);

    // Create PermissionMap and Menus
    const PermissionMap = {};
    const Menus = [];

    lstPermissions['0'].forEach(perm => {
      if (perm.MenuURL) {
        // Build the permission map dynamically
        PermissionMap[perm.MenuURL] = {};

        Object.keys(perm).forEach(key => {
          if (
            key !== 'MenuURL' &&
            key !== 'RoleID' &&
            key !== 'RoleName' &&
            key !== 'MenuID' &&
            key !== 'MenuName' &&
            key !== 'ParentMenuID'
          ) {
            PermissionMap[perm.MenuURL][key] = perm[key] === 1;
          }
        });

        // Push menu info (avoid duplicates)
        Menus.push({
          MenuID: perm.MenuID,
          MenuName: perm.MenuName,
          MenuURL: perm.MenuURL,
          ParentMenuID: perm.ParentMenuID
        });
      }
    });

    // Optionally remove duplicates from Menus
    const uniqueMenus = Array.from(
      new Map(Menus.map(m => [m.MenuID, m])).values()
    );

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
        role: { roleID: user.RoleID, roleName: user.RoleName },
        permissions: PermissionMap,
        menus: uniqueMenus
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



// Get Menus
// app.get('/api/menus/:roleID', verifyToken, async (req, res) => {
//   try {
//     const { roleID } = req.params;

//     const rows = await pool.query(
//       `SELECT distinct rma.RoleID, rma.MenuID, m.ParentMenuID, m.MenuName as Title, m.MenuURL as Path,
//       	(Select true from Action where rma.ActionID = ActionID) as CanView,
//         (Select true from Action where rma.ActionID = ActionID) as CanAdd,
//         (Select true from Action where rma.ActionID = ActionID) as CanEdit,
//         (Select true from Action where rma.ActionID = ActionID) as CanDelete
//       FROM RoleMenuActions  rma
//         JOIN Menu m ON rma.MenuID = m.MenuID 
//       WHERE rma.RoleID = ?
//       ORDER BY m.Position ASC`, [roleID]
//     );
//     res.json({ success: true, data: rows[0] });
//   } catch (error) {
//     console.error('Get Menu List error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

/*
Action Crud
*/
// Get all actions
app.get('/api/action', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.action');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Actions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Action
app.post('/api/action', verifyToken, async (req, res) => {
  try {
    const { ActionName } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.action (ActionName) VALUES (?)',
      [ActionName]
    );

    res.status(201).json({
      success: true,
      message: 'Action added successfully',
      plotId: result.insertId
    });
  } catch (error) {
    console.error('Add action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Action
app.put('/api/action/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ActionName } = req.body;

    await pool.query(`UPDATE societydb.action SET ActionName = ? WHERE ActionID = ?`, [ActionName, id]);

    res.json({
      success: true,
      message: 'Plot category updated successfully'
    });
  } catch (error) {
    console.error('Update plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Action
app.delete('/api/action/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM societydb.action WHERE ActionID = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
Menus Crud
*/
// Get all menus
app.get('/api/menus', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.vw_MenuHierarchy');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Floor summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add menu
app.post('/api/menus', verifyToken, async (req, res) => {
  const { MenuName, MenuURL, ParentMenuID, Position } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO menu (MenuName, MenuURL, ParentMenuID, Position) VALUES (?, ?, ?, ?)`,
      [MenuName, MenuURL, ParentMenuID, Position]
    );
    const [menu] = await pool.query('SELECT * FROM menu WHERE MenuID = ?', [result.insertId]);
    res.json(menu[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update menu
app.put('/api/menus/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { MenuName, MenuURL, ParentMenuID, Position } = req.body;
  try {
    await pool.query(
      `UPDATE menu SET MenuName = ?, MenuURL = ?, ParentMenuID = ?, Position = ? WHERE MenuID = ?`,
      [MenuName, MenuURL, ParentMenuID, Position, id]
    );
    const [menu] = await pool.query('SELECT * FROM menu WHERE MenuID = ?', [id]);
    res.json(menu[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete menu
app.delete('/api/menus/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM menu WHERE MenuID = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
Menu Action Mapping Crud
*/
// Get all Menu Actions Mapping
app.get('/api/menuactionsmap', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.vw_menuactions');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Actions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Menu Actions Mapping
app.post('/api/menuactionsmap', verifyToken, async (req, res) => {
  try {
    const { ActionID, MenuID } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.menuactionsmapping (ActionID, MenuID) VALUES (?, ?)',
      [ActionID, MenuID]
    );

    res.status(201).json({
      success: true,
      message: 'Menu Actions Mapping added successfully',
      plotId: result.insertId
    });
  } catch (error) {
    console.error('Add Menu Actions Mapping Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Menu Actions Mapping
app.put('/api/menuactionsmap/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ActionID, MenuID } = req.body;

    await pool.query(`UPDATE societydb.menuactionsmapping SET ActionID = ?, MenuID = ? WHERE MenuActionID = ?`, [ActionID, MenuID, id]);

    res.json({
      success: true,
      message: 'Plot category updated successfully'
    });
  } catch (error) {
    console.error('Update Menu Actions Mapping Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Menu Actions Mapping
app.delete('/api/menuactionsmap/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM societydb.menuactionsmapping WHERE MenuActionID = ?`, [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
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

/*
Roles Crud
*/
// Get all Roles
app.get('/api/role', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.role');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Role
app.post('/api/role', verifyToken, async (req, res) => {
  try {
    const { RoleName } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.role (RoleName) VALUES (?)',
      [RoleName]
    );

    res.status(201).json({
      success: true,
      message: 'Role added successfully',
      plotId: result.insertId
    });
  } catch (error) {
    console.error('Add Role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Role
app.put('/api/role/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { RoleName } = req.body;

    await pool.query(`UPDATE societydb.role SET RoleName = ? WHERE RoleID = ?`, [RoleName, id]);

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Role
app.delete('/api/role/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM societydb.role WHERE RoleID = ?', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
Roles Crud
*/
// Get By Role ID 
app.get('/api/role-permissions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
  
    const [rows] = await pool.query('SELECT * FROM societydb.vw_menuaction_rolepermissions where RoleID = ?', [id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Role
app.post('/api/role-permissions', verifyToken, async (req, res) => {
  try {
    const { RoleMenuActions } = req.body; // Expecting array of IRoleMenuActionsMap

    if (!Array.isArray(RoleMenuActions)) {
      return res.status(400).json({ message: 'RoleMenuActions must be an array' });
    }

    const [result] = await pool.query(
      'CALL SaveRoleMenuActions(?)',
      [JSON.stringify(RoleMenuActions)]
    );

    res.status(201).json({
      success: true,
      message: 'Permissions saved successfully',
    });
  } catch (error) {
    console.error('Save Role Permissions error:', error);
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

app.get('/api/plot-category', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.plotcategory');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get plot categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/plot-category', verifyToken, async (req, res) => {
  try {
    const { CategoryName } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.plotcategory (CategoryName) VALUES (?)',
      [CategoryName]
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

app.put('/api/plot-category/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { CategoryName } = req.body;

    await pool.query(
      'UPDATE societydb.plotcategory SET CategoryName = ? WHERE CategoryID = ?',
      [CategoryName, id]
    );

    res.json({
      success: true,
      message: 'Plot category updated successfully'
    });
  } catch (error) {
    console.error('Update plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/plot-category/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM societydb.plotcategory WHERE CategoryID = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete plot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/plot-type', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.plottype');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get plot type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/plot-type', verifyToken, async (req, res) => {
  try {
    const { TypeName, } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.plottype (TypeName) VALUES (?)',
      [TypeName]
    );

    res.status(201).json({
      success: true,
      message: 'Plot Type added successfully',
      plotId: result.insertId
    });
  } catch (error) {
    console.error('Add plot type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/plot-type/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { TypeName } = req.body;

    await pool.query(
      'UPDATE societydb.plottype SET TypeName = ? WHERE TypeID = ?',
      [TypeName, id]
    );

    res.json({
      success: true,
      message: 'Plot type updated successfully'
    });
  } catch (error) {
    console.error('Update Plot Type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/plot-type/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM societydb.plottype WHERE TypeID = ?', [id]);

    res.json({
      success: true,
      message: 'Plot Type deleted successfully'
    });
  } catch (error) {
    console.error('Delete Plot Type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/plot-floor', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.floor');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get floors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/plot-floor', verifyToken, async (req, res) => {
  try {
    const { Floor } = req.body;

    const [result] = await pool.query(
      'INSERT INTO societydb.floor (Floor) VALUES (?)',
      [Floor]
    );

    res.status(201).json({
      success: true,
      message: 'Floor added successfully',
      FloorId: result.insertId
    });
  } catch (error) {
    console.error('Add floor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/plot-floor/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { Floor } = req.body;

    await pool.query(
      'UPDATE societydb.floor SET Floor = ? WHERE FloorID = ?',
      [Floor, id]
    );

    res.json({
      success: true,
      message: 'Floor updated successfully'
    });
  } catch (error) {
    console.error('Update Floor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/plot-floor/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM societydb.floor WHERE FloorID = ?', [id]);

    res.json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    console.error('Delete Floor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Plot routes
app.get('/api/plot', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_PlotDetails');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get plots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/plot/:id', verifyToken, async (req, res) => {
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

app.post('/api/plot', verifyToken, async (req, res) => {
  try {
    const { HouseNo, CategoryID, FloorID, TypeID } = req.body;

    const [result] = await pool.query(
      'INSERT INTO Plot (HouseNo, CategoryID, FloorID, TypeID) VALUES (?, ?, ?, ?)',
      [HouseNo, CategoryID, FloorID, TypeID]
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

app.put('/api/plot/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { HouseNo, CategoryID, FloorID, TypeID } = req.body;

    await pool.query(
      'UPDATE Plot SET HouseNo = ?, CategoryID = ?, FloorID = ?, TypeID = ? WHERE PlotID = ?',
      [HouseNo, CategoryID, FloorID, TypeID, id]
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

app.delete('/api/plot/:id', verifyToken, async (req, res) => {
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

/*
ServiceRate 
*/
// Get all Service Rates
app.get('/api/service-rate', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.vw_servicerates');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get service rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new Service Rate
app.post('/api/service-rate', verifyToken, async (req, res) => {
  try {
    const { PlotTypeID, PlotTypeRate, PlotCategoryID, PlotCategoryRate, FloorID, FloorRate, TotalAmount, Month, Year, IsActive } = req.body;
    const [result] = await pool.query(
      'INSERT INTO societydb.servicerate (PlotTypeID, PlotTypeRate, PlotCategoryID, PlotCategoryRate, FloorID, FloorRate, TotalAmount, Month, Year, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [PlotTypeID, PlotTypeRate, PlotCategoryID, PlotCategoryRate, FloorID, FloorRate, TotalAmount, Month, Year, IsActive]
    );
    res.status(201).json({ success: true, message: 'Service rate added', rateId: result.insertId });
  } catch (error) {
    console.error('Add service rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Service Rate
app.put('/api/service-rate/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PlotTypeID, PlotCategoryID, PerFloorRate, EffectiveFromDate, Status } = req.body;
    await pool.query(
      'UPDATE societydb.servicerate SET PlotTypeID = ?, PlotCategoryID = ?, PerFloorRate = ?, EffectiveFromDate = ?, Status = ? WHERE RateID = ?',
      [PlotTypeID, PlotCategoryID, PerFloorRate, EffectiveFromDate, Status, id]
    );
    res.json({ success: true, message: 'Service rate updated' });
  } catch (error) {
    console.error('Update service rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Service Rate
app.delete('/api/service-rate/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM societydb.servicerate WHERE RateID = ?', [id]);
    res.json({ success: true, message: 'Service rate deleted' });
  } catch (error) {
    console.error('Delete service rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
PaymentPlan 
*/
app.get('/api/payment-plan', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.paymentplan');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get payment plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payment-plan', verifyToken, async (req, res) => {
  try {
    const { PlotID, RateID, StartDate, EndDate, Frequency, TotalAmount, Status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO societydb.paymentplan (PlotID, RateID, StartDate, EndDate, Frequency, TotalAmount, Status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [PlotID, RateID, StartDate, EndDate, Frequency, TotalAmount, Status]
    );
    res.status(201).json({ success: true, message: 'Payment plan added', planId: result.insertId });
  } catch (error) {
    console.error('Add payment plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/payment-plan/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PlotID, RateID, StartDate, EndDate, Frequency, TotalAmount, Status } = req.body;
    await pool.query(
      'UPDATE societydb.paymentplan SET PlotID = ?, RateID = ?, StartDate = ?, EndDate = ?, Frequency = ?, TotalAmount = ?, Status = ? WHERE PaymentPlanID = ?',
      [PlotID, RateID, StartDate, EndDate, Frequency, TotalAmount, Status, id]
    );
    res.json({ success: true, message: 'Payment plan updated' });
  } catch (error) {
    console.error('Update payment plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/payment-plan/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM societydb.paymentplan WHERE PaymentPlanID = ?', [id]);
    res.json({ success: true, message: 'Payment plan deleted' });
  } catch (error) {
    console.error('Delete payment plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
PaymentSchedule 
*/
app.get('/api/payment-schedule', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.paymentschedule');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get payment schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payment-schedule', verifyToken, async (req, res) => {
  try {
    const { PlanID, DueDate, Amount, IsPaid, PaymentDate } = req.body;
    const [result] = await pool.query(
      'INSERT INTO societydb.paymentschedule (PlanID, DueDate, Amount, IsPaid, PaymentDate) VALUES (?, ?, ?, ?, ?)',
      [PlanID, DueDate, Amount, IsPaid, PaymentDate]
    );
    res.status(201).json({ success: true, message: 'Payment schedule added', scheduleId: result.insertId });
  } catch (error) {
    console.error('Add payment schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/payment-schedule/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PlanID, DueDate, Amount, IsPaid, PaymentDate } = req.body;
    await pool.query(
      'UPDATE societydb.paymentschedule SET PlanID = ?, DueDate = ?, Amount = ?, IsPaid = ?, PaymentDate = ? WHERE PaymentScheduleID = ?',
      [PlanID, DueDate, Amount, IsPaid, PaymentDate, id]
    );
    res.json({ success: true, message: 'Payment schedule updated' });
  } catch (error) {
    console.error('Update payment schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/payment-schedule/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM societydb.paymentschedule WHERE PaymentScheduleID = ?', [id]);
    res.json({ success: true, message: 'Payment schedule deleted' });
  } catch (error) {
    console.error('Delete payment schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
PaymentReceipt 
*/
app.get('/api/payment-receipt', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM societydb.paymentreceipt');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get payment receipts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payment-receipt', verifyToken, async (req, res) => {
  try {
    const { PaymentScheduleID, PaidAmount, PaidOn, PaymentMode, ReferenceNumber, Remarks } = req.body;
    const [result] = await pool.query(
      'INSERT INTO societydb.paymentreceipt (PaymentScheduleID, PaidAmount, PaidOn, PaymentMode, ReferenceNumber, Remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [PaymentScheduleID, PaidAmount, PaidOn, PaymentMode, ReferenceNumber, Remarks]
    );
    res.status(201).json({ success: true, message: 'Payment receipt added', receiptId: result.insertId });
  } catch (error) {
    console.error('Add payment receipt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/payment-receipt/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PaymentScheduleID, PaidAmount, PaidOn, PaymentMode, ReferenceNumber, Remarks } = req.body;
    await pool.query(
      'UPDATE societydb.paymentreceipt SET PaymentScheduleID = ?, PaidAmount = ?, PaidOn = ?, PaymentMode = ?, ReferenceNumber = ?, Remarks = ? WHERE ReceiptID = ?',
      [PaymentScheduleID, PaidAmount, PaidOn, PaymentMode, ReferenceNumber, Remarks, id]
    );
    res.json({ success: true, message: 'Payment receipt updated' });
  } catch (error) {
    console.error('Update payment receipt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/payment-receipt/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM societydb.paymentreceipt WHERE ReceiptID = ?', [id]);
    res.json({ success: true, message: 'Payment receipt deleted' });
  } catch (error) {
    console.error('Delete payment receipt error:', error);
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

// Roles and Permissions routes
app.get('/api/role', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Role');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// app.get('/api/Permissions', verifyToken, async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM vw_RoleMenuPermissions');
//     res.json({ success: true, data: rows });
//   } catch (error) {
//     console.error('Get Permissions error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
