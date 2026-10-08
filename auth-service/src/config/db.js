const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

let pool = null;
let memDb = null;

function getMemDb() {
  if (!memDb) {
    const { newDb } = require('pg-mem');
    const db = newDb();

    db.public.registerFunction({
      name: 'gen_random_uuid',
      implementation: () => require('crypto').randomUUID(),
    });

    const initSqlPath = path.join(__dirname, '../../migrations/001_init.sql');
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      db.public.none(sql);
    }

    try {
      const hash = bcrypt.hashSync('centavo2026', 10);
      db.public.none(`
        INSERT INTO users (id, name, email, password)
        VALUES ('00000000-0000-0000-0000-000000000001', 'Demo User', 'demo@centavo.app', '${hash}')
        ON CONFLICT DO NOTHING;
      `);
    } catch (e) {
      console.warn('[db] Seed error:', e.message);
    }

    memDb = db.adapters.createPg();
  }
  return memDb;
}

if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('[db] Error en PostgreSQL client, fallback memoria:', err.message);
  });
}

/**
 * Ejecuta una consulta SQL contra la base de datos.
 * @param {string} text  - Query SQL parametrizado
 * @param {Array}  params - Valores para los placeholders ($1, $2, …)
 */
async function query(text, params) {
  if (pool) {
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[db] query="${text}" duration=${duration}ms rows=${result.rowCount}`);
      }
      return result;
    } catch (err) {
      console.warn('[db] Postgres no disponible, usando base de datos en memoria:', err.message);
      const mem = getMemDb();
      return await mem.query(text, params);
    }
  } else {
    const mem = getMemDb();
    return await mem.query(text, params);
  }
}

module.exports = { query };

