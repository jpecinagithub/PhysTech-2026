require('dotenv').config({ path: '../backend/.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hash = await bcrypt.hash('demo1234', 10);

  await conn.query(`
    INSERT INTO users (name, email, password_hash)
    VALUES ('Demo User', 'demo@phystech.com', ?)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
  `, [hash]);

  console.log('✅ Demo user created: demo@phystech.com / demo1234');
  await conn.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
