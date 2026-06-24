const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    // Enable uuid-ossp extension in public schema
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;');
    console.log("uuid-ossp extension successfully ensured in public schema!");
  } catch (e) {
    console.error("Error creating extension:", e);
  } finally {
    await client.end();
  }
}

main();
