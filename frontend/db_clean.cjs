const { Client } = require('pg');

async function cleanDB() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Dm3!g6p93QuG5b@@db.klxzihjdnpkogwuqcuau.supabase.co:5432/postgres'
  });
  try {
    await client.connect();
    console.log('Connected to Supabase DIRECTLY over IPv6.');
    
    // Drop all tables in public schema
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('Schema public dropped and recreated.');
    
    // Also need to delete the trigger on auth.users if it exists
    try {
      await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
      console.log('Dropped auth.users trigger.');
    } catch(e) {
      console.log('Trigger drop ignored:', e.message);
    }
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

cleanDB();
