
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'maintenance_system';
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Use the database
    console.log(`Using database ${dbName}...`);
    await connection.query(`USE ${dbName}`);
    
    // Read and execute table creation SQL
    const tableSql = fs.readFileSync(path.join(__dirname, './db/tables.sql'), 'utf8');
    console.log('Creating tables...');
    await connection.query(tableSql);
    
    // Read and execute views creation SQL
    const viewsSql = fs.readFileSync(path.join(__dirname, './db/views.sql'), 'utf8');
    console.log('Creating views...');
    await connection.query(viewsSql);
    
    // Read and execute seed data SQL
    const seedSql = fs.readFileSync(path.join(__dirname, './db/seed.sql'), 'utf8');
    console.log('Inserting seed data...');
    await connection.query(seedSql);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      console.log('Closing connection...');
      await connection.end();
    }
  }
}

setupDatabase();
